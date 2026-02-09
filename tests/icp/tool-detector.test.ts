/**
 * Tests for ICP tool detector
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock execa before importing the module
vi.mock('execa', () => ({
  execaCommand: vi.fn(),
}));

import { detectTool, detectToolchain, requireTool } from '../../src/icp/tool-detector.js';
import { execaCommand } from 'execa';

const mockExecaCommand = execaCommand as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('detectTool', () => {
  it('should detect an available tool with version', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd === 'which ic-wasm') {
        return { exitCode: 0, stdout: '/opt/homebrew/bin/ic-wasm', stderr: '' };
      }
      if (cmd === 'ic-wasm --version') {
        return { exitCode: 0, stdout: 'ic-wasm 0.9.11', stderr: '' };
      }
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const result = await detectTool('ic-wasm');
    expect(result.name).toBe('ic-wasm');
    expect(result.available).toBe(true);
    expect(result.path).toBe('/opt/homebrew/bin/ic-wasm');
    expect(result.version).toBe('0.9.11');
  });

  it('should detect icp tool', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd === 'which icp') {
        return { exitCode: 0, stdout: '/opt/homebrew/bin/icp', stderr: '' };
      }
      if (cmd === 'icp --version') {
        return { exitCode: 0, stdout: 'icp 0.1.0', stderr: '' };
      }
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const result = await detectTool('icp');
    expect(result.name).toBe('icp');
    expect(result.available).toBe(true);
    expect(result.path).toBe('/opt/homebrew/bin/icp');
    expect(result.version).toBe('0.1.0');
  });

  it('should return unavailable when tool is not installed', async () => {
    mockExecaCommand.mockImplementation(async () => {
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const result = await detectTool('ic-wasm');
    expect(result.name).toBe('ic-wasm');
    expect(result.available).toBe(false);
    expect(result.path).toBeUndefined();
    expect(result.version).toBeUndefined();
  });

  it('should handle which throwing an error', async () => {
    mockExecaCommand.mockRejectedValue(new Error('Command failed'));

    const result = await detectTool('dfx');
    expect(result.available).toBe(false);
    expect(result.path).toBeUndefined();
  });

  it('should mark available even if version check fails but binary exists', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('which')) {
        return { exitCode: 0, stdout: '/usr/local/bin/dfx', stderr: '' };
      }
      throw new Error('version check failed');
    });

    const result = await detectTool('dfx');
    expect(result.available).toBe(true);
    expect(result.path).toBe('/usr/local/bin/dfx');
  });

  it('should extract version from output with extra text', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('which')) {
        return { exitCode: 0, stdout: '/usr/bin/dfx', stderr: '' };
      }
      return { exitCode: 0, stdout: 'dfx version 0.25.0 (some extra info)', stderr: '' };
    });

    const result = await detectTool('dfx');
    expect(result.version).toBe('0.25.0');
  });
});

describe('detectToolchain', () => {
  it('should detect all tools and prefer icp when available', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd === 'which ic-wasm') return { exitCode: 0, stdout: '/bin/ic-wasm', stderr: '' };
      if (cmd === 'ic-wasm --version') return { exitCode: 0, stdout: '0.9.11', stderr: '' };
      if (cmd === 'which icp') return { exitCode: 0, stdout: '/bin/icp', stderr: '' };
      if (cmd === 'icp --version') return { exitCode: 0, stdout: '0.1.0', stderr: '' };
      if (cmd === 'which dfx') return { exitCode: 0, stdout: '/bin/dfx', stderr: '' };
      if (cmd === 'dfx --version') return { exitCode: 0, stdout: '0.25.0', stderr: '' };
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const status = await detectToolchain();
    expect(status.icWasm.available).toBe(true);
    expect(status.icp.available).toBe(true);
    expect(status.dfx.available).toBe(true);
    expect(status.preferredDeployTool).toBe('icp');
    expect(status.canOptimize).toBe(true);
  });

  it('should fall back to dfx when icp is not available', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd === 'which ic-wasm') return { exitCode: 1, stdout: '', stderr: '' };
      if (cmd === 'which icp') return { exitCode: 1, stdout: '', stderr: '' };
      if (cmd === 'which dfx') return { exitCode: 0, stdout: '/bin/dfx', stderr: '' };
      if (cmd === 'dfx --version') return { exitCode: 0, stdout: '0.25.0', stderr: '' };
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const status = await detectToolchain();
    expect(status.preferredDeployTool).toBe('dfx');
    expect(status.canOptimize).toBe(false);
  });

  it('should return null preferred tool when nothing is available', async () => {
    mockExecaCommand.mockImplementation(async () => {
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    const status = await detectToolchain();
    expect(status.preferredDeployTool).toBeNull();
    expect(status.canOptimize).toBe(false);
  });
});

describe('requireTool', () => {
  it('should return tool info when available', async () => {
    mockExecaCommand.mockImplementation(async (cmd: string) => {
      if (cmd.startsWith('which')) return { exitCode: 0, stdout: '/bin/ic-wasm', stderr: '' };
      return { exitCode: 0, stdout: '0.9.11', stderr: '' };
    });

    const tool = await requireTool('ic-wasm', 'WASM optimization');
    expect(tool.available).toBe(true);
  });

  it('should throw when tool is not available', async () => {
    mockExecaCommand.mockImplementation(async () => {
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    await expect(requireTool('ic-wasm', 'WASM optimization')).rejects.toThrow(
      /required for WASM optimization/
    );
  });

  it('should include install hint in error message', async () => {
    mockExecaCommand.mockImplementation(async () => {
      return { exitCode: 1, stdout: '', stderr: '' };
    });

    await expect(requireTool('icp', 'deployment')).rejects.toThrow(
      /https:\/\/github\.com\/dfinity\/icp-cli/
    );
  });
});
