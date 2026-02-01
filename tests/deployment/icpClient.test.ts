import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import {
  createICPClient,
  generateStubCanisterId,
  calculateWasmHash,
  validateWasmPath,
} from '../../src/deployment/icpClient.js';

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Mock crypto module
vi.mock('node:crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234'),
  })),
}));

describe('icpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStubCanisterId', () => {
    it('should generate a valid canister ID format', () => {
      const id = generateStubCanisterId();

      // Canister IDs are typically in format: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
      expect(id).toMatch(/^[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateStubCanisterId());
      }
      // Should be highly likely all unique
      expect(ids.size).toBeGreaterThan(95);
    });
  });

  describe('validateWasmPath', () => {
    it('should return invalid for non-existent file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = validateWasmPath('/nonexistent/file.wasm');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return invalid for directory', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => false } as fs.Stats);

      const result = validateWasmPath('/path/to/dir');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Not a file');
    });

    it('should return invalid for file too small', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([0x00, 0x61, 0x73]));

      const result = validateWasmPath('/path/to/small.wasm');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too small');
    });

    it('should return invalid for missing magic bytes', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as fs.Stats);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));

      const result = validateWasmPath('/path/to/invalid.wasm');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('magic bytes');
    });

    it('should return valid for valid WASM file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as fs.Stats);
      // Valid WASM magic bytes + version
      vi.mocked(fs.readFileSync).mockReturnValue(
        Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      );

      const result = validateWasmPath('/path/to/valid.wasm');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('calculateWasmHash', () => {
    it('should calculate hash of WASM file', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([0x00, 0x61, 0x73, 0x6d]));

      const hash = calculateWasmHash('/path/to/file.wasm');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 hex is 64 chars
    });
  });

  describe('ICPClient', () => {
    describe('constructor', () => {
      it('should create client with local network', () => {
        const client = createICPClient({ network: 'local' });

        expect(client.network).toBe('local');
        expect(client.getHost()).toBe('http://127.0.0.1:4943');
      });

      it('should create client with ic network', () => {
        const client = createICPClient({ network: 'ic' });

        expect(client.network).toBe('ic');
        expect(client.getHost()).toBe('https://ic0.app');
      });

      it('should use custom host if provided', () => {
        const client = createICPClient({
          network: 'local',
          host: 'http://custom:8000',
        });

        expect(client.getHost()).toBe('http://custom:8000');
      });
    });

    describe('checkConnection', () => {
      it('should return connected for ic network', async () => {
        const client = createICPClient({ network: 'ic' });

        const result = await client.checkConnection();

        expect(result.connected).toBe(true);
      });

      it('should return connected for local network', async () => {
        const client = createICPClient({ network: 'local' });

        const result = await client.checkConnection();

        expect(result.connected).toBe(true);
      });
    });

    describe('createCanister', () => {
      it('should return canister ID and cycles', async () => {
        const client = createICPClient({ network: 'local' });

        const result = await client.createCanister();

        expect(result.canisterId).toBeDefined();
        expect(result.canisterId).toMatch(/^[a-z2-7]{5}-/);
        expect(result.cyclesUsed).toBeGreaterThan(BigInt(0));
      });
    });

    describe('installCode', () => {
      it('should install code successfully', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, size: 1024 } as fs.Stats);
        vi.mocked(fs.readFileSync).mockReturnValue(
          Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
        );

        const client = createICPClient({ network: 'local' });

        const result = await client.installCode('test-canister-id', '/path/to/file.wasm');

        expect(result.success).toBe(true);
        expect(result.cyclesUsed).toBeGreaterThan(BigInt(0));
      });

      it('should throw for invalid WASM', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const client = createICPClient({ network: 'local' });

        await expect(
          client.installCode('test-canister-id', '/nonexistent.wasm')
        ).rejects.toThrow();
      });
    });

    describe('getCanisterStatus', () => {
      it('should return canister status', async () => {
        const client = createICPClient({ network: 'local' });

        const status = await client.getCanisterStatus('test-canister-id');

        expect(status.status).toBe('running');
        expect(status.memorySize).toBeGreaterThan(BigInt(0));
        expect(status.cycles).toBeGreaterThan(BigInt(0));
      });
    });

    describe('deploy', () => {
      beforeEach(() => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, size: 1024 } as fs.Stats);
        vi.mocked(fs.readFileSync).mockReturnValue(
          Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
        );
      });

      it('should deploy new canister', async () => {
        const client = createICPClient({ network: 'local' });

        const result = await client.deploy('/path/to/file.wasm');

        expect(result.canisterId).toBeDefined();
        expect(result.isUpgrade).toBe(false);
        expect(result.cyclesUsed).toBeGreaterThan(BigInt(0));
        expect(result.wasmHash).toBeDefined();
      });

      it('should upgrade existing canister', async () => {
        const client = createICPClient({ network: 'local' });

        const result = await client.deploy('/path/to/file.wasm', 'existing-canister-id');

        expect(result.canisterId).toBe('existing-canister-id');
        expect(result.isUpgrade).toBe(true);
      });

      it('should throw for invalid WASM', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const client = createICPClient({ network: 'local' });

        await expect(client.deploy('/nonexistent.wasm')).rejects.toThrow();
      });
    });
  });
});
