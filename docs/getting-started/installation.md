# Installation

This guide covers installing SoulRecall on your system.

## Prerequisites

Before installing SoulRecall, ensure you have:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| npm | 9+ | Package manager |
| dfx | Latest | ICP SDK for canister deployment |
| TypeScript | 5.7+ | Type checking |

### Installing dfx

```bash
# Install dfx (Internet Computer SDK)
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Verify installation
dfx --version
```

### Verifying Node.js

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# If needed, install via nvm
nvm install 18
nvm use 18
```

## Installation Methods

### Option 1: npm Global Install (Recommended)

Install SoulRecall globally from npm:

```bash
npm install -g soulrecall
```

Verify installation:

```bash
soulrecall --version
soulrecall --help
```

### Option 2: From Source

For development or latest features:

```bash
# Clone the repository
git clone https://github.com/soulrecall/soulrecall.git
cd soulrecall

# Install dependencies
npm install

# Build the project
npm run build

# Run CLI directly
node dist/cli/index.js --help

# Or link globally
npm link
soulrecall --help
```

### Option 3: npx (No Install)

Run without installing:

```bash
npx soulrecall --help
npx soulrecall init my-agent
```

## Post-Installation Setup

### 1. Configure ICP Identity

```bash
# Create default identity
dfx identity new default

# Use the identity
dfx identity use default

# Verify
dfx identity whoami
```

### 2. Set Environment Variables (Optional)

Create a `.env` file or export variables:

```bash
# ICP Configuration
export ICP_LOCAL_URL=http://127.0.0.1:4943
export ICP_MAINNET_URL=https://ic0.app

# Ethereum RPC (for wallet features)
export ETHEREUM_RPC_URL=https://eth.example.com
export INFURA_API_KEY=your-key

# Solana RPC
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Polkadot RPC
export POLKADOT_RPC_URL=wss://rpc.polkadot.io
```

### 3. Verify Installation

```bash
# Check CLI
soulrecall --version

# Initialize test project
soulrecall init test-project
cd test-project

# Verify project structure
ls -la .soulrecall/
```

## Development Setup

For contributing to SoulRecall:

```bash
# Clone and install
git clone https://github.com/soulrecall/soulrecall.git
cd soulrecall
npm install

# Run in development mode
npm run dev

# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Upgrading

### From npm

```bash
npm update -g soulrecall
```

### From Source

```bash
cd soulrecall
git pull origin main
npm install
npm run build
```

## Uninstallation

```bash
# Remove global install
npm uninstall -g soulrecall

# Or unlink if installed from source
npm unlink -g soulrecall
```

## Troubleshooting

### dfx not found

```bash
# Add dfx to PATH
export PATH="$HOME/bin:$PATH"

# Or reinstall
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

### Permission denied

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use sudo (not recommended)
sudo npm install -g soulrecall
```

### Build fails from source

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Quick Start](./quick-start.md) - Deploy your first agent
- [Configuration](./configuration.md) - Configure agent settings
- [Tutorial](../user/tutorial-v1.0.md) - Comprehensive walkthrough
