# Deployment Guide

This guide covers deploying AI agents to the Internet Computer using SoulRecall.

## Overview

SoulRecall supports two deployment modes:

1. **Local Deployment** - Deploy to local ICP replica (development/testing)
2. **Production Deployment** - Deploy to main ICP network

## Configuration Files

### agent.yaml

Main agent configuration file located at project root:

```yaml
name: My Agent
description: Description of your agent
entry: src/index.ts
memory: 256
compute: medium
cycles: 1000000000000
routing:
  - canister-a-id
  - canister-b-id
```

### icp.yaml

ICP network configuration for deployment settings:

```yaml
environments:
  local:
    network:
      type: local
    replicaCount: 4
    cycles:
      initial: 100T
  production:
    network:
      type: ic
    replicaCount: 20
    cycles:
      initial: 500T
      refillThreshold: 100T

optimization:
  level: 3
  shrink: true
  removeDebug: true
```

## Local Deployment

Deploy to local ICP for development and testing:

```bash
# Deploy to local network
soulrecall deploy --network local
```

### Local Deployment Process

1. **Validation** - Checks project structure and dependencies
2. **Compilation** - Compiles TypeScript to WASM
3. **Optimization** - Applies WASM optimizations (size, debug removal)
4. **Canister Creation** - Creates canister on local network
5. **Code Installation** - Installs WASM on canister
6. **Verification** - Verifies deployment success

### Local Development Workflow

```bash
# 1. Start local replica
dfx start --background

# 2. Deploy agent
soulrecall deploy --network local

# 3. Test with canister ID
soulrecall exec <canister-id> "test input"

# 4. View logs
soulrecall logs <canister-id>
```

## Production Deployment

Deploy to main ICP network for public access:

```bash
# Deploy to production
soulrecall deploy --network ic
```

### Production Deployment Process

1. **Pre-deployment Check** - Verifies cycles balance, network connectivity
2. **Compilation** - Full production build with optimizations
3. **Canister Creation** - Creates new canister on mainnet
4. **Code Installation** - Installs WASM with initial cycles allocation
5. **Controller Setup** - Configures your identity as controller
6. **Post-deployment** - Verifies canister health and connectivity

### Cycles Management

```bash
# Add cycles to canister
soulrecall cycles top-up <canister-id> --amount 1000000000000

# Check canister cycles
soulrecall cycles balance <canister-id>

# View cycles history
soulrecall cycles history <canister-id>
```

## Upgrades

Upgrade an existing deployed canister:

```bash
# Upgrade canister with new code
soulrecall deploy --canister-id <existing-id> --upgrade
```

### Upgrade Strategies

**Zero-downtime Upgrade:**
1. Deploy new code with same canister ID
2. ICP handles code upgrade atomically
3. Minimal downtime (typically `<30 seconds`)

**Blue-Green Deployment:**
1. Deploy new canister
2. Switch DNS after verification
3. Remove old canister after stabilization

## Environment Variables

Configure deployment behavior with environment variables:

```bash
# ICP network
export ICP_NETWORK=ic

# Custom host
export ICP_HOST=https://custom.icp.host

# Wallet identity
export ICP_IDENTITY=my-wallet
```

### Environment File (`.env`)

```env
ICP_NETWORK=ic
ICP_HOST=https://ic0.app
SOUL_RECALL_DEBUG=false
```

## Troubleshooting Deployments

### Compilation Errors

**TypeScript compilation failed:**
```bash
# Check TypeScript version
npx tsc --version

# Check for type errors
npx tsc --noEmit
```

**WASM build failed:**
```bash
# Verify Rust toolchain
rustc --version
wasm-pack --version

# Clean build cache
rm -rf .soulrecall/wasm-cache
```

### Canister Errors

**Insufficient cycles:**
```bash
# Check balance
soulrecall cycles balance

# Add more cycles
soulrecall cycles top-up <canister-id> --amount 5000000000000
```

**Controller permission denied:**
```bash
# Verify identity
dfx identity whoami

# Set controller
soulrecall canister set-controller <canister-id> --principal <your-principal>
```

### Network Issues

**Connection timeout:**
```bash
# Check network status
soulrecall network status

# Test connectivity
curl -I https://ic0.app

# Use custom network endpoint
soulrecall deploy --network ic --host https://alternate.icp.host
```

**Deployment stuck:**
```bash
# Cancel stuck deployment
soulrecall cancel <deployment-id>

# Check deployment logs
soulrecall logs <deployment-id>
```

## Verification

After deployment, verify your canister:

```bash
# Check canister status
soulrecall status <canister-id>

# Run health check
soulrecall health <canister-id>

# View recent logs
soulrecall logs <canister-id> --last 100
```

## Rollback

Rollback to previous deployment if issues occur:

```bash
# List available rollbacks
soulrecall rollback list <canister-id>

# Perform rollback
soulrecall rollback <canister-id> --version 2
```

### Rollback Process

1. Select previous deployment version
2. Download backup if available
3. Reinstall backup code
4. Verify canister health
5. Update routing if needed

## Best Practices

### Before Deployment

- [ ] Test agent locally with `soulrecall test`
- [ ] Ensure sufficient cycles (minimum 1T recommended)
- [ ] Review and optimize agent code size
- [ ] Backup existing canister if upgrading
- [ ] Verify network connectivity

### During Deployment

- [ ] Use verbose mode for debugging: `--verbose`
- [ ] Monitor deployment progress: `soulrecall logs <deployment-id>`
- [ ] Verify canister health post-deployment
- [ ] Record deployment ID for rollback reference

### After Deployment

- [ ] Set up monitoring with `soulrecall monitor`
- [ ] Configure alerts for canister health
- [ ] Create initial backup
- [ ] Document canister ID and access methods

## Advanced Topics

### Batched Deployments

Deploy multiple canisters in dependency order:

```bash
soulrecall deploy --batch canisters.json
```

### Multi-network Deployment

Deploy to multiple networks simultaneously:

```bash
soulrecall deploy --networks local,ic
```

### Custom Deployment Scripts

Create deployment scripts for complex workflows:

```bash
# deploy-all.sh
#!/bin/bash
soulrecall deploy --network local --config staging.yaml
soulrecall deploy --network ic --config production.yaml
```

## Next Steps

- [ ] Read [Wallet Guide](./wallets.md) for cycles management
- [ ] Read [Backup Guide](./backups.md) for backup strategies
- [ ] Explore [Web Dashboard](./webapp.md) for UI-based management
- [ ] Review [Security Best Practices](../dev/security.md)
