/**
 * Backup System
 *
 * Portable JSON format backup with embedded manifest and checksums
 * Stores backups in ~/.agentvault/backups/
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import type { AgentConfig } from '../packaging/types.js';

const AGENTVAULT_DIR = path.join(os.homedir(), '.agentvault');
const BACKUPS_DIR = path.join(AGENTVAULT_DIR, 'backups');

function ensureBackupsDir(): void {
  if (!fs.existsSync(AGENTVAULT_DIR)) {
    fs.mkdirSync(AGENTVAULT_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

export interface BackupManifest {
  version: string;
  agentName: string;
  timestamp: Date;
  created: Date;
  agentConfig?: AgentConfig;
  canisterId?: string;
  checksums: Record<string, string>;
  size: number;
  components: string[];
}

export interface BackupOptions {
  agentName: string;
  outputPath?: string;
  includeConfig?: boolean;
}

export interface ImportOptions {
  inputPath: string;
  targetAgentName?: string;
  overwrite?: boolean;
}

export interface BackupResult {
  success: boolean;
  path?: string;
  error?: string;
  sizeBytes?: number;
  manifest?: BackupManifest;
}

export interface ImportResult {
  success: boolean;
  agentName?: string;
  error?: string;
  components: string[];
  warnings: string[];
}

export async function exportBackup(options: BackupOptions): Promise<BackupResult> {
  try {
    ensureBackupsDir();
    
    const { agentName, outputPath, includeConfig = true } = options;
    
    const timestamp = new Date();
    const created = new Date();
    const filename = `${agentName}-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = outputPath || path.join(BACKUPS_DIR, filename);
    
    const components: string[] = [];
    if (includeConfig) {
      components.push('config');
    }
    
    const manifest: BackupManifest = {
      version: '1.0',
      agentName,
      timestamp,
      created,
      checksums: {},
      size: 0,
      components,
    };
    
    if (includeConfig) {
      manifest.canisterId = agentName;
    }
    
    const content = JSON.stringify(manifest, null, 2);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    manifest.checksums[filename] = checksum;
    
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
    
    const stats = fs.statSync(filePath);
    manifest.size = stats.size;
    
    return {
      success: true,
      path: filePath,
      sizeBytes: stats.size,
      manifest,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function previewBackup(inputPath: string): Promise<BackupManifest | null> {
  try {
    if (!fs.existsSync(inputPath)) {
      return null;
    }
    
    const content = fs.readFileSync(inputPath, 'utf8');
    const manifest = JSON.parse(content) as BackupManifest;
    
    return manifest;
  } catch (error) {
    console.error('Failed to preview backup:', error);
    return null;
  }
}

export async function importBackup(options: ImportOptions): Promise<ImportResult> {
  try {
    const { inputPath, targetAgentName, overwrite } = options;
    
    if (!fs.existsSync(inputPath)) {
      return {
        success: false,
        agentName: undefined,
        components: [],
        warnings: [],
        error: `Backup file not found: ${inputPath}`,
      };
    }
    
    const manifest = await previewBackup(inputPath);
    if (!manifest) {
      return {
        success: false,
        agentName: undefined,
        components: [],
        warnings: [],
        error: 'Invalid backup file',
      };
    }
    
    const targetName = targetAgentName || manifest.agentName;
    const warnings: string[] = [];
    
    if (!overwrite) {
      warnings.push('Using dry-run mode; no changes will be made');
    }
    
    return {
      success: true,
      agentName: targetName,
      components: manifest.components,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      agentName: undefined,
      components: [],
      warnings: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listBackups(agentName: string): Promise<BackupManifest[]> {
  ensureBackupsDir();
  const backups: BackupManifest[] = [];
  
  if (!fs.existsSync(BACKUPS_DIR)) {
    return backups;
  }
  
  const files = fs.readdirSync(BACKUPS_DIR);
  for (const file of files) {
    if (file.startsWith(agentName) && file.endsWith('.json')) {
      const filePath = path.join(BACKUPS_DIR, file);
      try {
        const manifest = await previewBackup(filePath);
        if (manifest && manifest.agentName === agentName) {
          backups.push(manifest);
        }
      } catch (error) {
        console.error(`Failed to read backup ${file}:`, error);
      }
    }
  }
  
  backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return backups;
}

export async function deleteBackup(filePath: string): Promise<boolean> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return false;
  }
}

export function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
