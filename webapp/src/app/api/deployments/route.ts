import { createHash } from 'node:crypto'
import * as fs from 'node:fs'
import { NextResponse } from 'next/server'
import type { DeploymentHistory } from '@/icp/types.js'
import { deployAgent } from '@/deployment/index.js'
import { addDeploymentToHistory, getAllDeployments } from '@/deployment/promotion.js'
import { packageAgent } from '@/packaging/index.js'
import {
  buildAgentModel,
  buildDeploymentModels,
  readAgentConfigRecord,
  resolveAgentSourcePath,
  resolveProjectRoot,
} from '@/lib/server/agent-models'

type DeployMode = 'auto' | 'install' | 'reinstall' | 'upgrade'
type WalletType = 'ethereum' | 'icp' | 'arweave'

interface WalletProof {
  type?: WalletType
  address?: string
  chainName?: string
  message?: string
  signature?: string
  issuedAt?: string
  nonce?: string
}

interface DeployRequestBody {
  agentId?: string
  sourcePath?: string
  network?: string
  environment?: string
  canisterId?: string
  identity?: string
  cycles?: string | number
  mode?: DeployMode
  projectRoot?: string
  walletProof?: WalletProof
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

function jsonWithCors(body: unknown, init?: ResponseInit): NextResponse {
  return withCors(NextResponse.json(body, init))
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toCyclesValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value))
  }
  return undefined
}

function toDeployMode(value: unknown): DeployMode | undefined {
  if (value === 'auto' || value === 'install' || value === 'reinstall' || value === 'upgrade') {
    return value
  }
  return undefined
}

function computeWasmHash(wasmPath: string): string {
  const buffer = fs.readFileSync(wasmPath)
  return createHash('sha256').update(buffer).digest('hex')
}

function nextVersion(history: DeploymentHistory[]): number {
  return history.reduce((maxVersion, entry) => {
    const version = Number(entry.version)
    return Number.isFinite(version) ? Math.max(maxVersion, version) : maxVersion
  }, 0) + 1
}

function parseWalletProof(value: unknown): WalletProof | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const raw = value as Record<string, unknown>
  const type = raw.type === 'ethereum' || raw.type === 'icp' || raw.type === 'arweave'
    ? raw.type
    : undefined
  const address = asString(raw.address)
  const chainName = asString(raw.chainName)
  const message = asString(raw.message)
  const signature = asString(raw.signature)
  const issuedAt = asString(raw.issuedAt)
  const nonce = asString(raw.nonce)

  if (!type || !address) {
    return undefined
  }

  return {
    type,
    address,
    chainName,
    message,
    signature,
    issuedAt,
    nonce,
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const agentId = url.searchParams.get('agentId') ?? url.searchParams.get('agent')
    const status = url.searchParams.get('status')

    if (!agentId) {
      return jsonWithCors({
        success: false,
        error: 'agentId is required',
      }, { status: 400 })
    }

    if (!buildAgentModel(agentId)) {
      return jsonWithCors({
        success: false,
        error: `Agent '${agentId}' not found`,
      }, { status: 404 })
    }

    const deployments = buildDeploymentModels(agentId)
    const filtered = status
      ? deployments.filter((deployment) => deployment.status === status)
      : deployments

    return jsonWithCors({
      success: true,
      data: filtered,
    })
  } catch (error) {
    return jsonWithCors({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const startedAt = new Date()

  try {
    const body = (await request.json()) as DeployRequestBody
    const agentId = asString(body.agentId)

    if (!agentId) {
      return jsonWithCors({
        success: false,
        error: 'agentId is required',
      }, { status: 400 })
    }

    const walletProof = parseWalletProof(body.walletProof)
    const walletWarnings: string[] = []
    if (!walletProof) {
      walletWarnings.push('No wallet proof supplied. Proceeding with server-side deploy context.')
    }

    const config = readAgentConfigRecord(agentId)
    const requestedSourcePath = asString(body.sourcePath)
    const sourcePath = resolveAgentSourcePath(agentId, config, requestedSourcePath)
    if (!sourcePath) {
      const sourceHint = requestedSourcePath
        ? `The requested sourcePath '${requestedSourcePath}' was not found or is not a valid agent source.`
        : 'Provide sourcePath in the deploy request or set sourcePath/workingDirectory in the agent config.'
      return jsonWithCors({
        success: false,
        error: `Unable to resolve agent source path. ${sourceHint}`,
      }, { status: 400 })
    }

    const packageResult = await packageAgent({
      sourcePath,
    })

    const network = asString(body.network) ?? 'local'
    const environment = asString(body.environment)
    const canisterId = asString(body.canisterId)
    const identity = asString(body.identity)
    const cycles = toCyclesValue(body.cycles)
    const mode = toDeployMode(body.mode)
    const projectRoot = asString(body.projectRoot) ?? resolveProjectRoot(sourcePath)

    const deployResult = await deployAgent({
      wasmPath: packageResult.wasmPath,
      network,
      canisterId,
      skipConfirmation: true,
      environment,
      identity,
      cycles,
      mode,
      projectRoot,
    })

    const completedAt = new Date()
    const history = getAllDeployments(agentId) as DeploymentHistory[]

    const historyEntry: DeploymentHistory = {
      agentName: agentId,
      environment: environment ?? network,
      canisterId: deployResult.canister.canisterId,
      wasmHash: deployResult.canister.wasmHash ?? computeWasmHash(packageResult.wasmPath),
      timestamp: completedAt,
      version: nextVersion(history),
      success: true,
    }

    addDeploymentToHistory(historyEntry)

    const deployment = {
      id: `${agentId}-${historyEntry.version}-${completedAt.getTime()}`,
      agentId,
      status: 'completed' as const,
      canisterId: historyEntry.canisterId,
      createdAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    }

    return jsonWithCors({
      success: true,
      data: {
        deployment,
        agent: buildAgentModel(agentId),
        warnings: [...deployResult.warnings, ...walletWarnings],
        deployTool: deployResult.deployTool,
        sourcePath,
        wasmPath: packageResult.wasmPath,
        walletProof: walletProof
          ? {
              type: walletProof.type,
              address: walletProof.address,
              chainName: walletProof.chainName,
            }
          : undefined,
      },
    })
  } catch (error) {
    return jsonWithCors({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
