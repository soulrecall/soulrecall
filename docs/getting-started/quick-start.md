# Quick Start // Initial Sync Sequence

Deploy your first SoulRecall entity in under 10 minutes.

:::note Prerequisites
- Node.js 18+
- `dfx` installed and reachable in PATH
- SoulRecall CLI installed (`npm install -g soulrecall`)
:::

## 1. Initialize Project Vessel

```bash
soulrecall init my-first-agent
cd my-first-agent
```

This creates a baseline project with config, source, and package metadata.

## 2. Activate Local ICP Runtime

```bash
dfx start --background
dfx ping
```

## 3. Package Entity Artifacts

```bash
soulrecall package ./
```

This compiles the agent and prepares deterministic deployment output.

## 4. Deploy to Local Network

```bash
soulrecall deploy --network local
```

Capture the emitted canister ID from command output.

## 5. Verify Operational State

```bash
soulrecall status
soulrecall info
soulrecall health
```

## 6. Execute a Task

```bash
soulrecall exec --canister-id <YOUR_CANISTER_ID> "hello world"
```

## 7. Read and Preserve State

```bash
soulrecall show --canister-id <YOUR_CANISTER_ID>
soulrecall backup --canister-id <YOUR_CANISTER_ID>
```

:::tip Divine Efficiency
Automate `status`, `health`, and `backup` checks in your local CI before promoting deployments.
:::

## Next Protocols

| Goal | Guide |
| --- | --- |
| Complete operational walkthrough | [Tutorial](/docs/user/tutorial-v1.0) |
| Mainnet deployment strategy | [Deployment Guide](/docs/user/deployment) |
| Multi-chain wallet operations | [Wallet Guide](/docs/user/wallets) |
| Full command surface | [CLI Reference](/docs/cli/reference) |

## Common Command Set

```bash
# List all local agents
soulrecall list

# View runtime logs
soulrecall logs <canister-id>

# Fetch state for local reconstruction
soulrecall fetch --canister-id <canister-id>

# Inspect cycle balance
soulrecall cycles balance <canister-id>
```

## Help

```bash
soulrecall --help
soulrecall <command> --help
```

See [Troubleshooting](/docs/user/troubleshooting) when commands fail or outputs diverge.
