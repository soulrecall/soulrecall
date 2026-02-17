# Backups Guide

This guide covers creating, managing, and restoring backups in SoulRecall.

## Overview

SoulRecall provides two backup strategies:

1. **Local Backups** - Stored locally on your machine
2. **Arweave Archival** - Permanent storage on Arweave blockchain

## Backup Types

### Canister Backup

Complete backup of canister state:

```bash
# Create canister backup
soulrecall backup create <canister-id>

# Includes:
# - Code (WASM)
# - Stable memory
# - Heap memory snapshot
# - Metadata (timestamp, cycles, etc.)
```

### Configuration Backup

Backup agent configuration and source:

```bash
# Backup project configuration
soulrecall backup config --project <project-path>

# Output: agent.yaml, package.json, and source files
```

### Incremental Backup

Incremental backups for faster restores:

```bash
# Create incremental backup
soulrecall backup create --incremental <canister-id>

# Only stores changes since last backup
```

## Creating Backups

### Manual Backup

Create backup on demand:

```bash
# Backup specific canister
soulrecall backup create <canister-id>

# Backup all canisters
soulrecall backup create --all

# Include metadata
soulrecall backup create <canister-id> --metadata
```

### Scheduled Backup

Configure automatic backups:

```bash
# Schedule daily backups
soulrecall backup schedule --canister-id <id> --frequency daily --time "02:00"

# Schedule hourly backups
soulrecall backup schedule --canister-id <id> --frequency hourly

# List scheduled backups
soulrecall backup schedule list
```

### Pre-deployment Backup

Automatically create backup before deploying:

```bash
# Enable pre-deployment backup
soulrecall config set --pre-deployment-backup true

# Deploy (backup created automatically)
soulrecall deploy <canister-id>
```

## Arweave Archival

### Upload to Arweave

Archive backup to Arweave for permanent storage:

```bash
# Upload backup to Arweave
soulrecall archive upload <backup-id>

# Estimate cost
soulrecall archive estimate <backup-size>

# View status
soulrecall archive status <tx-id>
```

### Arweave Configuration

Configure Arweave settings:

```bash
# Set Arweave wallet
soulrecall archive configure --wallet <wallet-id>

# Set custom host
soulrecall archive configure --host https://arweave.net

# View configuration
soulrecall archive config show
```

## Listing Backups

### List Local Backups

View all local backups:

```bash
# List all backups
soulrecall backup list

# List backups for specific canister
soulrecall backup list --canister <canister-id>

# Show backup size
soulrecall backup list --canister <canister-id> --show-size
```

### List Arweave Archives

View archives on Arweave:

```bash
# List all archives
soulrecall archive list

# Filter by status
soulrecall archive list --status completed

# Show cost information
soulrecall archive list --show-cost
```

## Restoring Backups

### Restore Canister

Restore canister from backup:

```bash
# Restore from local backup
soulrecall backup restore <backup-id>

# Restore from Arweave
soulrecall backup restore --arweave <tx-id>

# Options:
# --verify          - Verify checksum before restore
# --dry-run         - Preview changes without applying
# --force           - Force restore (override existing)
```

### Restore Process

1. **Validation** - Verify backup integrity and checksum
2. **Download** - Download backup from Arweave (if applicable)
3. **Canister Stop** - Stop canister if running
4. **Code Installation** - Install backuped WASM
5. **Memory Restore** - Restore stable and heap memory
6. **Verification** - Verify canister health
7. **Restart** - Start canister with restored state

### Verification

After restore, verify canister:

```bash
# Check canister status
soulrecall status <canister-id>

# Run health check
soulrecall health <canister-id>

# Run tests
soulrecall test <canister-id>
```

## Backup Management

### Delete Backups

Remove old or unnecessary backups:

```bash
# Delete local backup
soulrecall backup delete <backup-id>

# Delete Arweave archive
soulrecall archive delete <tx-id>

# Delete all backups older than N days
soulrecall backup prune --older-than 30
```

### Backup Compression

Compress backups to save space:

```bash
# Create compressed backup
soulrecall backup create <canister-id> --compress

# Compression options:
# --algorithm gzip   - Gzip compression
# --algorithm brotli - Brotli compression
# --level 9         - Compression level (1-9, 9=max)
```

### Backup Encryption

Encrypt backups for security:

```bash
# Create encrypted backup
soulrecall backup create <canister-id> --encrypt

# Options:
# --algorithm aes-256
# --password          - Interactive password prompt
# --key-file         - Use public key file
```

## Troubleshooting

### Backup Creation Failed

**Insufficient disk space:**
```bash
# Check disk space
df -h

# Clean old backups
soulrecall backup prune --older-than 7

# Use external storage
soulrecall backup create --destination /external/backup/path
```

**Canister access denied:**
```bash
# Verify controller
soulrecall canister controller <canister-id>

# Set correct controller
soulrecall canister set-controller <canister-id> --principal <your-principal>
```

### Restore Failed

**Corrupt backup:**
```bash
# Verify checksum
soulrecall backup verify <backup-id>

# Try alternative backup
soulrecall backup list --canister <canister-id>
```

**Arweave upload failed:**
```bash
# Check Arweave status
soulrecall archive status

# Check wallet balance
soulrecall wallet balance --wallet <arweave-wallet-id>

# Retry upload
soulrecall archive upload <backup-id> --retry
```

### Network Issues

**Timeout during upload:**
```bash
# Increase timeout
soulrecall archive upload <backup-id> --timeout 300

# Use smaller chunks
soulrecall archive upload <backup-id> --chunk-size 1048576
```

## Best Practices

### Before Creating Backup

- [ ] **Canister should be in stable state** - Not during upgrades
- [ ] **Sufficient cycles** - Ensure canister has cycles for operations
- [ ] **Minimize data size** - Clean up unnecessary data
- [ ] **Schedule during off-peak** - Reduce load on canisters
- [ ] **Document restore process** - Know steps to restore

### After Creating Backup

- [ ] **Verify backup integrity** - Check checksum and size
- [ ] **Test restore process** - Verify backup is restorable
- [ ] **Store in multiple locations** - Local + Arweave
- [ ] **Document backup ID** - Save reference for future restores
- [ ] **Set retention policy** - Delete old backups automatically

### Long-term Storage

- [ ] **Use Arweave for critical data** - Permanent, immutable storage
- [ ] **Regular backup rotation** - Replace old backups
- [ ] **Offsite copy** - Store backup copy in separate location
- [ ] **Encrypt sensitive backups** - For enhanced security

## Automation

### Backup Scripts

Create automated backup workflows:

```bash
#!/bin/bash
# backup-all.sh
for canister in $(soulrecall list --format ids); do
  soulrecall backup create --canister $canister
  soulrecall archive upload latest --async
done
```

### Cron Jobs

Schedule automated backups with cron:

```cron
# Daily backup at 2 AM
0 2 * * * soulrecall backup create --all

# Hourly backup of specific canister
0 * * * * soulrecall backup create --canister-id <id>
```

## Advanced Topics

### Differential Backups

Create differential backups (changes only):

```bash
# Differential backup (since last full)
soulrecall backup create <canister-id> --type differential

# Compare backup sizes
soulrecall backup diff <backup-1> <backup-2>
```

### Cross-Region Storage

Store backups in multiple Arweave regions:

```bash
# Upload to multiple regions
soulrecall archive upload <backup-id> --regions us-west,eu-west

# Download from nearest region
soulrecall archive download <tx-id> --region nearest
```

### Backup Verification

Automatically verify backup integrity:

```bash
# Enable automatic verification
soulrecall config set --verify-backups true

# Verification includes:
# - Checksum validation
# - Size verification
# - Sample data restore test
```

## Next Steps

- [ ] Read [Wallet Guide](./wallets.md) for Arweave funding
- [ ] Read [Deployment Guide](./deployment.md) for canister deployment
- [ ] Read [Troubleshooting](./troubleshooting.md) for backup issues
- [ ] Explore [Web Dashboard](./webapp.md) for UI-based backup management
