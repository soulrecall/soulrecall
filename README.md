# AgentVault

Persistent on-chain AI agent tooling for packaging, canister deployment scaffolding, monitoring, and multi-chain wallet operations on ICP.

## Current Status

This repository is active and evolving. The following is accurate for the current codebase:

- Packaging pipeline is implemented (`agentvault package`) with WasmEdge-compatible output and optional `ic-wasm` optimization.
- ICP toolchain wrappers exist (`icp` CLI and `ic-wasm`), plus environment config via `icp.yaml`.
- Monitoring and management commands are present (info, stats, monitor, health, identity, cycles, tokens).
- Wallet system is fully implemented (ckETH, Polkadot, Solana) with send, sign, history, export/import, and transaction queue helpers.
- The Motoko canister currently focuses on wallet registry, transaction queue, and VetKeys mock endpoints.

Not yet wired end-to-end:
- The on-chain agent state/execution interface is declared in `canister/agent.did`, but the Motoko canister does not currently implement those `agent_*` methods.
- CLI commands `deploy`, `fetch`, `show`, and `exec` use stubbed ICP client logic; they do not persist or read real on-chain agent state yet.

## Repository Layout

- `src/`: core TypeScript library (packaging, deployment, ICP tooling, monitoring, wallet, security)
- `cli/`: CLI entry points and command handlers
- `canister/`: Motoko canister code and Candid definitions
- `tests/`: Vitest suite (unit/integration/CLI)
- `examples/`: sample agent configs
- `docs/`, `AI_DOCS/`: product and implementation docs

## Quick Start (Local Build)

```bash
# Clone
git clone https://github.com/johnnyclem/AgentVault.git
cd AgentVault

# Install deps
npm install

# Build TypeScript (outputs to dist/)
npm run build

# Run the CLI from the repo
node dist/cli/index.js --help
```

## Local On-Chain Setup (Current Working Flow)

The steps below set up a local ICP replica and deploy the canister. This is the only fully working on-chain flow today. Agent state backup/restore is not yet wired.

```bash
# 1) Install dfx (see the official ICP SDK instructions)
# 2) Start a local replica

dfx start --clean --background

# 3) Deploy the AgentVault canister

dfx deploy agent_vault

# 4) Verify canister health

dfx canister call agent_vault getCanisterStatus
```

## Packaging an Agent (Local)

```bash
# Package a local agent directory into WASM + state artifacts
node dist/cli/index.js package ./path/to/agent -o ./dist/agent

# Optional: enable ic-wasm optimizations when ic-wasm is installed
node dist/cli/index.js package ./path/to/agent -o ./dist/agent --ic-wasm-optimize --ic-wasm-shrink
```

## Development Commands

```bash
npm run dev         # tsx watch
npm run build       # tsc build
npm run start       # run dist/index.js
npm run test        # vitest run
npm run test:watch  # vitest watch
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run lint:fix    # eslint --fix
```

## Notes on On-Chain Backup

On-chain agent state backup/reconstruction is a roadmap item. The intended flow is:
1) package agent to WASM + state JSON
2) deploy canister
3) upload state and WASM to the canister
4) fetch/decrypt/rebuild from chain

Steps 3–4 are not implemented in the current CLI/canister pairing. If you want this wired next, see the PRDs in `AI_DOCS/` and the gaps called out in the code review.

## License

MIT License - see [LICENSE](./LICENSE).
