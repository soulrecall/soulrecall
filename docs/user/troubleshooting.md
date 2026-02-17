# Troubleshooting

This guide covers common issues and solutions when using SoulRecall.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Deployment Issues](#deployment-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [Network Issues](#network-issues)

## Installation Issues

### npm install fails

**Problem:** `npm ERR!` during installation

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Use specific Node version
nvm install 18

# Install without optional dependencies
npm install --no-optional

# Check network connectivity
npm config set registry https://registry.npmjs.org/
```

### dfx not found

**Problem:** `command not found: dfx`

**Solutions:**

```bash
# Install dfx
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Add to PATH
export PATH="$HOME/bin:$PATH"

# Verify installation
dfx --version
```

### Permission denied errors

**Problem:** `EACCES: permission denied` when running commands

**Solutions:**

```bash
# Run with sudo (use caution)
sudo npm install -g soulrecall

# Fix file permissions
chmod +x ./dist/cli/index.js

# Use proper ownership
sudo chown -R $USER:$USER ~/.soulrecall
```

## Configuration Issues

### agent.yaml not found

**Problem:** `Error: agent.yaml not found`

**Solutions:**

```bash
# Initialize new project
soulrecall init <project-name>

# Check current directory
ls -la

# Create minimal agent.yaml
cat > agent.yaml <<EOF
name: My Agent
entry: src/index.ts
EOF
```

### Invalid configuration

**Problem:** `Error: Invalid configuration value`

**Solutions:**

```bash
# Validate configuration
soulrecall validate

# Show example config
soulrecall init --example

# Use schema documentation
docs/user/deployment.md
```

### Wallet not found

**Problem:** `Error: No wallet configured`

**Solutions:**

```bash
# Create new wallet
soulrecall wallet create

# Import existing wallet
soulrecall wallet import --mnemonic

# Check wallet storage
ls -la ~/.soulrecall/wallets
```

## Deployment Issues

### Insufficient cycles

**Problem:** `Error: Insufficient cycles to deploy`

**Solutions:**

```bash
# Check balance
soulrecall wallet balance

# Request from faucet
soulrecall wallet faucet

# Purchase cycles
soulrecall wallet purchase --amount 1000000000000

# Deploy with less cycles
soulrecall deploy --cycles 500000000000
```

### Canister creation failed

**Problem:** `Error: Failed to create canister`

**Solutions:**

```bash
# Check network status
soulrecall network status

# Verify identity
dfx identity whoami

# Try alternative network
soulrecall deploy --network local

# Check for rate limits
soulrecall status
```

### Code installation failed

**Problem:** `Error: Failed to install code`

**Solutions:**

```bash
# Verify WASM file
ls -lh dist/*.wasm

# Recompile
soulrecall package

# Manual compilation
npx tsc && npx esbuild

# Check WASM magic bytes
xxd dist/agent.wasm
```

### Deployment timeout

**Problem:** `Error: Deployment timed out`

**Solutions:**

```bash
# Increase timeout
soulrecall deploy --timeout 600

# Use background deployment
soulrecall deploy --background

# Check canister status
soulrecall status <canister-id>
```

## Runtime Issues

### Canister not responding

**Problem:** Canister deployed but not responding to queries

**Solutions:**

```bash
# Check canister status
soulrecall status <canister-id>

# Restart canister
soulrecall restart <canister-id>

# Check health endpoint
soulrecall health <canister-id>

# View logs for errors
soulrecall logs <canister-id>
```

### Out of memory

**Problem:** `Error: Canister out of memory`

**Solutions:**

```bash
# Increase memory allocation
soulrecall upgrade <canister-id> --memory 512

# Optimize agent code
soulrecall optimize --target <project-path>

# Restart canister
soulrecall restart <canister-id>

# Clear stable memory (if applicable)
soulrecall exec <canister-id> "clear"
```

### Transaction failed

**Problem:** Transaction sent but failed on-chain

**Solutions:**

```bash
# Check transaction status
soulrecall wallet tx <tx-id>

# View failure reason
soulrecall wallet tx <tx-id> --details

# Retry transaction
soulrecall wallet retry <tx-id>

# Check fees
soulrecall wallet fees --network icp
```

## Performance Issues

### Slow performance

**Problem:** Dashboard or CLI operations are slow

**Solutions:**

```bash
# Clear cache
soulrecall cache clear

# Check disk space
df -h ~/.soulrecall

# Optimize database
soulrecall db optimize

# Reduce log verbosity
soulrecall config set --log-level warn
```

### High memory usage

**Problem:** SoulRecall consuming too much memory

**Solutions:**

```bash
# Check memory usage
ps aux | grep soulrecall

# Limit concurrent operations
soulrecall config set --max-concurrent 5

# Clear history
soulrecall history clear

# Restart services
pkill -HUP soulrecall
```

### Database lock errors

**Problem:** `Error: Database locked`

**Solutions:**

```bash
# Check for running processes
ps aux | grep soulrecall

# Kill stale processes
pkill -9 soulrecall

# Remove lock file
rm -f ~/.soulrecall/*.lock

# Restart
soulrecall restart
```

## Network Issues

### Connection refused

**Problem:** `ECONNREFUSED: Connection refused`

**Solutions:**

```bash
# Check if service is running
soulrecall status

# Check port availability
netstat -an | grep 4943

# Check firewall
ufw status  # Linux
sudo ufw allow 4943/tcp

# Try alternative host
soulrecall network status --host https://ic0.app
```

### DNS resolution failed

**Problem:** `Error: Unable to resolve host`

**Solutions:**

```bash
# Check DNS resolution
nslookup ic0.app

# Use alternative DNS
echo "8.8.8.8" | sudo tee /etc/resolv.conf

# Use direct IP
soulrecall config set --icp-host http://205.171.201.22
```

### Timeout errors

**Problem:** Operations timing out after default timeout

**Solutions:**

```bash
# Increase timeout globally
soulrecall config set --timeout 300

# Increase per-command timeout
soulrecall deploy --timeout 600

# Use longer retries
soulrecall config set --retries 5
```

## Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Enable debug mode
soulrecall --debug <command>

# Set debug level
soulrecall config set --log-level debug

# Enable verbose output
soulrecall --verbose <command>

# Save logs to file
soulrecall logs <canister-id> > debug.log 2>&1
```

## Getting Help

### Built-in Help

```bash
# General help
soulrecall --help

# Command-specific help
soulrecall deploy --help

# List available commands
soulrecall --list-commands
```

### Issue Reporting

Report bugs and issues:

```bash
# Collect diagnostic information
soulrecall doctor

# Create bug report
soulrecall bug-report --output bug-report.txt

# Submit to GitHub
gh issue create --title "Issue Title" --body @bug-report.txt
```

### Community Support

Get help from the community:

- **GitHub Issues:** https://github.com/your-org/soulrecall/issues
- **Discord:** https://discord.gg/soulrecall
- **Forum:** https://forum.dfinity.org/
- **Documentation:** https://soulrecall.cloud/docs

## Recovery Procedures

### Recover from failed deployment

```bash
# List available rollbacks
soulrecall rollback list <canister-id>

# Rollback to previous version
soulrecall rollback <canister-id> --version <version-number>
```

### Emergency canister stop

```bash
# Force stop canister
soulrecall stop <canister-id> --force

# Delete canister (caution: irreversible)
soulrecall delete <canister-id> --confirm
```

## Advanced Troubleshooting

### Enable verbose logging

```bash
# Set environment variable
export SOULRECALL_DEBUG=true

# Enable all log categories
soulrecall config set --log-categories all

# Set max log level
soulrecall config set --log-level trace
```

### Inspect canister state

```bash
# Query canister status
soulrecall status <canister-id>

# Query canister info
soulrecall info <canister-id>

# Dump canister heap
soulrecall exec <canister-id> "debug.heapDump()"
```

### Network diagnostics

```bash
# Test network connectivity
soulrecall network test

# Measure latency
soulrecall network ping --count 10

# Test with different hosts
soulrecall network test --host ic0.app
soulrecall network test --host gateway.ic0.app
```

## Preventive Measures

### Regular backups

```bash
# Schedule automatic backups
soulrecall backup schedule --all --frequency daily

# Backup before major changes
soulrecall backup create --all --pre-change
```

### Health monitoring

```bash
# Enable continuous monitoring
soulrecall monitor start --interval 60

# Set up alerts
soulrecall alert configure --email admin@example.com
soulrecall alert configure --webhook https://hooks.example.com
```

### Resource limits

```bash
# Set memory limits
soulrecall config set --max-memory 4GB

# Set CPU limits
soulrecall config set --max-cpu 80%

# Set disk limits
soulrecall config set --max-disk 10GB
```

## Next Steps

- [ ] Check [Getting Started Guide](./getting-started.md)
- [ ] Review [Deployment Guide](./deployment.md)
- [ ] Read [Web Dashboard Guide](./webapp.md)
- [ ] Report unresolved issues via GitHub
