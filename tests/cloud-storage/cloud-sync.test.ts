import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  archiveToCloud,
  listCloudArchives,
  restoreFromCloud,
  verifyCloudArchive,
} from '../../src/cloud-storage/cloud-sync.js';

/**
 * Integration-style tests using real temporary directories.
 * Tests the full archive → list → verify → restore cycle.
 */
describe('cloud-sync', () => {
  let tmpDir: string;
  let cloudDir: string;

  beforeEach(() => {
    // Create temp dirs for isolated tests
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentvault-cloud-test-'));
    cloudDir = path.join(tmpDir, 'cloud-provider');

    fs.mkdirSync(cloudDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('archiveToCloud', () => {
    it('should return error when no data exists to archive', () => {
      // Empty vault — nothing in ~/.agentvault
      const result = archiveToCloud(cloudDir, {
        includeConfigs: true,
        includeWallets: true,
        includeBackups: true,
        includeNetworks: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data found');
    });

    it('should create archive directory structure', () => {
      // Create some data in the real ~/.agentvault for testing
      const home = os.homedir();
      const vaultDir = path.join(home, '.agentvault');
      const testAgentDir = path.join(
        vaultDir,
        'agents',
        'cloud-test-agent',
      );
      const createdDirs: string[] = [];

      try {
        // Seed minimal data
        fs.mkdirSync(testAgentDir, { recursive: true });
        createdDirs.push(testAgentDir);
        fs.writeFileSync(
          path.join(testAgentDir, 'agent.json'),
          JSON.stringify({ name: 'cloud-test-agent', type: 'generic' }),
        );

        const result = archiveToCloud(cloudDir, {
          agentName: 'cloud-test-agent',
          includeConfigs: true,
          includeWallets: false,
          includeBackups: false,
          includeNetworks: false,
        });

        expect(result.success).toBe(true);
        expect(result.archivePath).toBeDefined();
        expect(result.fileCount).toBeGreaterThan(0);
        expect(result.totalBytes).toBeGreaterThan(0);

        // Manifest should exist
        const manifestPath = path.join(result.archivePath!, 'manifest.json');
        expect(fs.existsSync(manifestPath)).toBe(true);

        const manifest = JSON.parse(
          fs.readFileSync(manifestPath, 'utf8'),
        );
        expect(manifest.version).toBe('1.0');
        expect(manifest.agentName).toBe('cloud-test-agent');
        expect(manifest.components).toContain('configs');
        expect(manifest.files.length).toBeGreaterThan(0);
        expect(manifest.checksum).toBeDefined();
      } finally {
        // Clean up test data
        for (const dir of createdDirs) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
    });

    it('should respect include/exclude options', () => {
      const home = os.homedir();
      const vaultDir = path.join(home, '.agentvault');
      const testAgentDir = path.join(
        vaultDir,
        'agents',
        'cloud-options-test',
      );

      try {
        fs.mkdirSync(testAgentDir, { recursive: true });
        fs.writeFileSync(
          path.join(testAgentDir, 'agent.json'),
          JSON.stringify({ name: 'cloud-options-test' }),
        );

        const result = archiveToCloud(cloudDir, {
          agentName: 'cloud-options-test',
          includeConfigs: true,
          includeWallets: false,
          includeBackups: false,
          includeNetworks: false,
        });

        expect(result.success).toBe(true);

        const manifest = JSON.parse(
          fs.readFileSync(result.manifestPath!, 'utf8'),
        );
        expect(manifest.components).toContain('configs');
        expect(manifest.components).not.toContain('wallets');
        expect(manifest.components).not.toContain('backups');
        expect(manifest.components).not.toContain('networks');
      } finally {
        fs.rmSync(testAgentDir, { recursive: true, force: true });
      }
    });
  });

  describe('listCloudArchives', () => {
    it('should return empty array for empty directory', () => {
      const archives = listCloudArchives(cloudDir);
      expect(archives).toEqual([]);
    });

    it('should return empty array for non-existent directory', () => {
      const archives = listCloudArchives('/nonexistent/path');
      expect(archives).toEqual([]);
    });

    it('should discover archives with valid manifests', () => {
      // Create a fake archive
      const archDir = path.join(
        cloudDir,
        'AgentVault-Backups',
        'test-2025-01-01',
      );
      fs.mkdirSync(archDir, { recursive: true });
      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify({
          version: '1.0',
          createdAt: '2025-01-01T00:00:00.000Z',
          platform: 'linux',
          hostname: 'test',
          agentVaultVersion: '1.0.0',
          components: ['configs'],
          files: [],
          checksum: 'abc123',
        }),
      );

      const archives = listCloudArchives(cloudDir);

      expect(archives.length).toBe(1);
      expect(archives[0]!.manifest.version).toBe('1.0');
      expect(archives[0]!.manifest.components).toContain('configs');
    });

    it('should sort archives newest first', () => {
      const backupsDir = path.join(cloudDir, 'AgentVault-Backups');

      for (const [name, date] of [
        ['old', '2024-01-01T00:00:00.000Z'],
        ['new', '2025-06-01T00:00:00.000Z'],
        ['mid', '2025-03-01T00:00:00.000Z'],
      ] as const) {
        const dir = path.join(backupsDir, name);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'manifest.json'),
          JSON.stringify({
            version: '1.0',
            createdAt: date,
            platform: 'linux',
            hostname: 'test',
            agentVaultVersion: '1.0.0',
            components: [],
            files: [],
            checksum: 'x',
          }),
        );
      }

      const archives = listCloudArchives(cloudDir);

      expect(archives.length).toBe(3);
      expect(new Date(archives[0]!.manifest.createdAt).getTime()).toBeGreaterThan(
        new Date(archives[1]!.manifest.createdAt).getTime(),
      );
      expect(new Date(archives[1]!.manifest.createdAt).getTime()).toBeGreaterThan(
        new Date(archives[2]!.manifest.createdAt).getTime(),
      );
    });

    it('should skip directories without manifest', () => {
      const backupsDir = path.join(cloudDir, 'AgentVault-Backups');
      const noManifest = path.join(backupsDir, 'no-manifest');
      fs.mkdirSync(noManifest, { recursive: true });
      fs.writeFileSync(path.join(noManifest, 'somefile.txt'), 'hi');

      const archives = listCloudArchives(cloudDir);
      expect(archives.length).toBe(0);
    });
  });

  describe('verifyCloudArchive', () => {
    it('should return invalid for missing manifest', () => {
      const result = verifyCloudArchive(path.join(tmpDir, 'nonexistent'));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Manifest file not found');
    });

    it('should verify a valid archive', () => {
      const archDir = path.join(tmpDir, 'verify-test');
      fs.mkdirSync(path.join(archDir, 'configs'), { recursive: true });

      const fileContent = Buffer.from('test content');
      fs.writeFileSync(
        path.join(archDir, 'configs', 'agent.json'),
        fileContent,
      );

      const crypto = require('node:crypto');
      const fileChecksum = crypto
        .createHash('sha256')
        .update(fileContent)
        .digest('hex');
      const overallChecksum = crypto
        .createHash('sha256')
        .update(Buffer.from(fileChecksum))
        .digest('hex');

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'agent.json'),
            sizeBytes: fileContent.length,
            checksum: fileChecksum,
          },
        ],
        checksum: overallChecksum,
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      const result = verifyCloudArchive(archDir);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect checksum mismatch', () => {
      const archDir = path.join(tmpDir, 'verify-bad');
      fs.mkdirSync(path.join(archDir, 'configs'), { recursive: true });
      fs.writeFileSync(
        path.join(archDir, 'configs', 'agent.json'),
        'original content',
      );

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'agent.json'),
            sizeBytes: 16,
            checksum: 'wrong-checksum-value',
          },
        ],
        checksum: 'also-wrong',
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      const result = verifyCloudArchive(archDir);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing files', () => {
      const archDir = path.join(tmpDir, 'verify-missing');
      fs.mkdirSync(archDir, { recursive: true });

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'gone.json'),
            sizeBytes: 10,
            checksum: 'abc',
          },
        ],
        checksum: 'xyz',
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      const result = verifyCloudArchive(archDir);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Missing'))).toBe(true);
    });
  });

  describe('restoreFromCloud', () => {
    it('should return error for non-existent archive', () => {
      const result = restoreFromCloud('/nonexistent/archive');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No manifest found');
    });

    it('should restore files from a valid archive', () => {
      // Build a minimal valid archive
      const archDir = path.join(tmpDir, 'restore-test');
      const configsDir = path.join(archDir, 'configs');
      fs.mkdirSync(configsDir, { recursive: true });

      const fileContent = Buffer.from(
        JSON.stringify({ name: 'restored-agent' }),
      );
      fs.writeFileSync(
        path.join(configsDir, 'agent.json'),
        fileContent,
      );

      const crypto = require('node:crypto');
      const fileChecksum = crypto
        .createHash('sha256')
        .update(fileContent)
        .digest('hex');

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'agent.json'),
            sizeBytes: fileContent.length,
            checksum: fileChecksum,
          },
        ],
        checksum: 'irrelevant-for-restore',
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      const result = restoreFromCloud(archDir, true);

      expect(result.success).toBe(true);
      expect(result.restoredFiles).toBeGreaterThanOrEqual(1);
      expect(result.components).toContain('configs');

      // Verify the file landed in ~/.agentvault/agents/
      const destPath = path.join(
        os.homedir(),
        '.agentvault',
        'agents',
        'agent.json',
      );
      expect(fs.existsSync(destPath)).toBe(true);

      // Clean up
      fs.rmSync(destPath, { force: true });
    });

    it('should skip files with checksum mismatch', () => {
      const archDir = path.join(tmpDir, 'restore-bad-checksum');
      const configsDir = path.join(archDir, 'configs');
      fs.mkdirSync(configsDir, { recursive: true });
      fs.writeFileSync(
        path.join(configsDir, 'agent.json'),
        'some content',
      );

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'agent.json'),
            sizeBytes: 12,
            checksum: 'intentionally-wrong',
          },
        ],
        checksum: 'x',
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      const result = restoreFromCloud(archDir, true);

      expect(result.success).toBe(true);
      expect(result.restoredFiles).toBe(0);
      expect(
        result.warnings.some((w) => w.includes('Checksum mismatch')),
      ).toBe(true);
    });

    it('should not overwrite existing files without --overwrite', () => {
      const archDir = path.join(tmpDir, 'restore-no-overwrite');
      const configsDir = path.join(archDir, 'configs');
      fs.mkdirSync(configsDir, { recursive: true });

      const fileContent = Buffer.from('new-data');
      fs.writeFileSync(
        path.join(configsDir, 'agent.json'),
        fileContent,
      );

      const crypto = require('node:crypto');
      const checksum = crypto
        .createHash('sha256')
        .update(fileContent)
        .digest('hex');

      const manifest = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'linux',
        hostname: 'test',
        agentVaultVersion: '1.0.0',
        components: ['configs'],
        files: [
          {
            relativePath: path.join('configs', 'agent.json'),
            sizeBytes: fileContent.length,
            checksum,
          },
        ],
        checksum: 'x',
      };

      fs.writeFileSync(
        path.join(archDir, 'manifest.json'),
        JSON.stringify(manifest),
      );

      // Create existing file at destination
      const destDir = path.join(
        os.homedir(),
        '.agentvault',
        'agents',
      );
      fs.mkdirSync(destDir, { recursive: true });
      const destFile = path.join(destDir, 'agent.json');
      fs.writeFileSync(destFile, 'existing-data');

      try {
        const result = restoreFromCloud(archDir, false);

        expect(result.success).toBe(true);
        expect(result.restoredFiles).toBe(0);
        expect(
          result.warnings.some((w) => w.includes('Skipping existing')),
        ).toBe(true);

        // Existing data should be unchanged
        expect(fs.readFileSync(destFile, 'utf8')).toBe('existing-data');
      } finally {
        fs.rmSync(destFile, { force: true });
      }
    });
  });
});
