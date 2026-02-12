# Quick Start

Get AgentVault running in 5 minutes.

## Prerequisites

- Node.js 18+
- dfx installed
- AgentVault CLI (`npm install -g agentvault`)

## 1. Initialize Project

```bash
agentvault init my-first-agent
cd my-first-agent
```

This creates:

```
my-first-agent/
├── .agentvault/
│   └── config.yaml    # Agent configuration
├── src/
│   └── index.ts       # Agent entry point
└── package.json
```

## 2. Start Local ICP

```bash
dfx start --background
```

Verify:

```bash
dfx ping
```

## 3. Package Agent

```bash
agentvault package ./
```

This compiles your agent and prepares deployment artifacts.

## 4. Deploy

```bash
agentvault deploy --network local
```

Note the canister ID from the output.

## 5. Verify

```bash
# Check status
agentvault status

# View details
agentvault info

# Run health check
agentvault health
```

## 6. Execute Task

```bash
agentvault exec --canister-id <YOUR_CANISTER_ID> "hello world"
```

## 7. View State

```bash
agentvault show --canister-id <YOUR_CANISTER_ID>
```

## 8. Create Backup

```bash
agentvault backup --canister-id <YOUR_CANISTER_ID>
```

## What's Next?

| Goal | Guide |
|------|-------|
| Learn all features | [Tutorial](../user/tutorial-v1.0.md) |
| Deploy to mainnet | [Deployment Guide](../user/deployment.md) |
| Manage wallets | [Wallet Guide](../user/wallets.md) |
| All CLI commands | [CLI Reference](../cli/reference.md) |

## Common Commands

```bash
# List all agents
agentvault list

# View logs
agentvault logs <canister-id>

# Fetch state for local rebuild
agentvault fetch --canister-id <canister-id>

# View canister cycles
agentvault cycles balance <canister-id>
```

## Need Help?

```bash
agentvault --help
agentvault <command> --help
```

See [Troubleshooting](../user/troubleshooting.md) for common issues.
