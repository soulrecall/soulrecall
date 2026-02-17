# SoulRecall v1.0 comprehensive tutorial

This tutorial walks from local setup to deployment, monitoring, and backup operations.

## Outcome

By the end, you will:

- initialize an SoulRecall project,
- package and deploy an agent,
- inspect runtime status,
- perform backup and recovery-oriented validation.

## Prerequisites

- Node.js 18+
- npm
- `dfx` installed (for local ICP workflows)
- Terminal access

## Step 1 — Install and verify CLI

```bash
npm install -g soulrecall
soulrecall --help
```

Repository workflow alternative:

```bash
git clone https://github.com/soulrecall/soulrecall.git
cd soulrecall
npm install
npm run build
node dist/cli/index.js --help
```

## Step 2 — Create your first project

```bash
soulrecall init demo-agent
cd demo-agent
```

You should see project scaffolding and `.soulrecall/` configuration.

## Step 3 — Start a local ICP environment

```bash
dfx start --background
```

Confirm replica health:

```bash
dfx ping
```

## Step 4 — Package your agent

```bash
soulrecall package ./
```

Packaging compiles assets and prepares deployment artifacts.

## Step 5 — Deploy to local canister

```bash
soulrecall deploy --network local
```

Record the generated canister ID.

## Step 6 — Inspect runtime status

```bash
soulrecall status
soulrecall info
soulrecall health
```

Use this triad for baseline observability after each deployment.

## Step 7 — Execute and inspect state

```bash
soulrecall exec --canister-id <YOUR_CANISTER_ID> "run a simple task"
soulrecall show --canister-id <YOUR_CANISTER_ID>
```

## Step 8 — Backup strategy

Create a backup snapshot:

```bash
soulrecall backup --canister-id <YOUR_CANISTER_ID>
```

Recommended pattern:

- pre-deploy backup,
- post-deploy verification,
- periodic scheduled backups.

## Step 9 — Recovery drill

Fetch state for local reconstruction testing:

```bash
soulrecall fetch --canister-id <YOUR_CANISTER_ID>
```

Validate recovered state against expected behavior and logs.

## Step 10 — Production readiness checklist

- [ ] Deployment process documented and repeatable
- [ ] Health checks integrated into monitoring
- [ ] Backup cadence agreed and automated
- [ ] Recovery drill runbook tested
- [ ] Rollback strategy prepared

## Common pitfalls

1. **Skipping `dfx` setup**: deployment commands need an ICP environment.
2. **No backup before deploy**: increases recovery risk.
3. **No post-deploy health checks**: issues remain undetected longer.

## Where to go next

- Wallet management: `docs/user/wallets.md`
- Backup details: `docs/user/backups.md`
- Deployment specifics: `docs/user/deployment.md`
- Troubleshooting: `docs/user/troubleshooting.md`
