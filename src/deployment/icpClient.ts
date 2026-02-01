/**
 * ICP Client
 *
 * Wrapper for ICP canister operations.
 * This module provides a stub implementation for ICP deployment.
 * In a full implementation, this would use @dfinity/agent for actual
 * canister deployment and management.
 */

import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import type { NetworkType, ICPClientConfig } from './types.js';

/**
 * Default hosts for each network
 */
const DEFAULT_HOSTS: Record<NetworkType, string> = {
  local: 'http://127.0.0.1:4943',
  ic: 'https://ic0.app',
};

/**
 * Generate a stub canister ID
 *
 * Creates a realistic-looking canister ID for testing/development.
 * In production, this would be assigned by the IC.
 */
export function generateStubCanisterId(): string {
  // ICP canister IDs are typically 27 characters in this format
  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let id = '';
  for (let i = 0; i < 5; i++) {
    if (i > 0) id += '-';
    for (let j = 0; j < 5; j++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return id;
}

/**
 * Calculate hash of WASM module
 */
export function calculateWasmHash(wasmPath: string): string {
  const buffer = fs.readFileSync(wasmPath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate WASM file exists and is readable
 */
export function validateWasmPath(wasmPath: string): { valid: boolean; error?: string } {
  try {
    if (!fs.existsSync(wasmPath)) {
      return { valid: false, error: `WASM file not found: ${wasmPath}` };
    }

    const stats = fs.statSync(wasmPath);
    if (!stats.isFile()) {
      return { valid: false, error: `Not a file: ${wasmPath}` };
    }

    // Check for WASM magic bytes
    const buffer = fs.readFileSync(wasmPath);
    if (buffer.length < 8) {
      return { valid: false, error: 'File too small to be a valid WASM module' };
    }

    const magic = buffer.subarray(0, 4);
    if (magic[0] !== 0x00 || magic[1] !== 0x61 || magic[2] !== 0x73 || magic[3] !== 0x6d) {
      return { valid: false, error: 'Invalid WASM file: missing magic bytes' };
    }

    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: `Failed to read WASM file: ${message}` };
  }
}

/**
 * ICP Client class
 *
 * Provides methods for interacting with the Internet Computer.
 * Currently implements stub functionality for development.
 */
export class ICPClient {
  private config: ICPClientConfig;
  private host: string;

  constructor(config: ICPClientConfig) {
    this.config = config;
    this.host = config.host ?? DEFAULT_HOSTS[config.network];
  }

  /**
   * Get the network type
   */
  get network(): NetworkType {
    return this.config.network;
  }

  /**
   * Get the host URL
   */
  getHost(): string {
    return this.host;
  }

  /**
   * Check if the network is available
   *
   * In a full implementation, this would make a health check request.
   */
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    // Stub: Always succeed for IC, check for local replica
    if (this.config.network === 'ic') {
      return { connected: true };
    }

    // For local network, we simulate a check
    // In production, this would actually ping the local replica
    return { connected: true };
  }

  /**
   * Create a new canister
   *
   * Stub implementation that simulates canister creation.
   */
  async createCanister(): Promise<{ canisterId: string; cyclesUsed: bigint }> {
    // Simulate network delay
    await this.simulateNetworkDelay();

    return {
      canisterId: generateStubCanisterId(),
      cyclesUsed: BigInt(100_000_000_000), // 100B cycles (typical creation cost)
    };
  }

  /**
   * Install WASM code to a canister
   *
   * Stub implementation that simulates code installation.
   */
  async installCode(
    _canisterId: string,
    wasmPath: string,
    _mode: 'install' | 'upgrade' | 'reinstall' = 'install'
  ): Promise<{ success: boolean; cyclesUsed: bigint }> {
    // Validate WASM file
    const validation = validateWasmPath(wasmPath);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Simulate network delay
    await this.simulateNetworkDelay();

    // Calculate cycles based on WASM size
    const stats = fs.statSync(wasmPath);
    const cyclesPerByte = BigInt(1_000_000); // 1M cycles per byte (simplified)
    const cyclesUsed = BigInt(stats.size) * cyclesPerByte;

    return {
      success: true,
      cyclesUsed,
    };
  }

  /**
   * Get canister status
   *
   * Stub implementation that returns mock status.
   */
  async getCanisterStatus(_canisterId: string): Promise<{
    status: 'running' | 'stopping' | 'stopped';
    memorySize: bigint;
    cycles: bigint;
  }> {
    await this.simulateNetworkDelay();

    return {
      status: 'running',
      memorySize: BigInt(1024 * 1024), // 1MB
      cycles: BigInt(1_000_000_000_000), // 1T cycles
    };
  }

  /**
   * Deploy WASM to a new or existing canister
   *
   * This is the main deployment method that handles both new
   * deployments and upgrades.
   */
  async deploy(
    wasmPath: string,
    canisterId?: string
  ): Promise<{
    canisterId: string;
    isUpgrade: boolean;
    cyclesUsed: bigint;
    wasmHash: string;
  }> {
    // Validate WASM
    const validation = validateWasmPath(wasmPath);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const wasmHash = calculateWasmHash(wasmPath);
    let totalCycles = BigInt(0);
    let isUpgrade = false;
    let finalCanisterId: string;

    if (canisterId) {
      // Upgrade existing canister
      isUpgrade = true;
      finalCanisterId = canisterId;
      const result = await this.installCode(canisterId, wasmPath, 'upgrade');
      totalCycles = result.cyclesUsed;
    } else {
      // Create new canister and install code
      const createResult = await this.createCanister();
      finalCanisterId = createResult.canisterId;
      totalCycles += createResult.cyclesUsed;

      const installResult = await this.installCode(finalCanisterId, wasmPath, 'install');
      totalCycles += installResult.cyclesUsed;
    }

    return {
      canisterId: finalCanisterId,
      isUpgrade,
      cyclesUsed: totalCycles,
      wasmHash,
    };
  }

  /**
   * Simulate network delay for realistic behavior
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = this.config.network === 'local' ? 100 : 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Create an ICP client instance
 */
export function createICPClient(config: ICPClientConfig): ICPClient {
  return new ICPClient(config);
}
