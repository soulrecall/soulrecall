# CLI Reference

Complete reference for all SoulRecall CLI commands.

## Global Options

```bash
soulrecall [options] <command>

Options:
  -V, --version          Output version number
  -h, --help             Display help
  --debug                Enable debug mode
  --config <path>        Path to config file
  --network <network>    Network (local, ic)
  --verbose              Verbose output
```

## Core Commands

### init

Initialize a new SoulRecall project.

```bash
soulrecall init [options] <project-name>

Options:
  -t, --template <name>  Use a template (default, minimal)
  --force                Overwrite existing directory

Examples:
  soulrecall init my-agent
  soulrecall init my-agent --template minimal
```

### package

Package agent directory to WASM.

```bash
soulrecall package [options] <path>

Options:
  -o, --output <dir>     Output directory
  --optimize             Enable optimizations
  --no-optimize          Disable optimizations

Examples:
  soulrecall package ./
  soulrecall package ./my-agent --output ./dist
```

### deploy

Deploy agent to ICP canister.

```bash
soulrecall deploy [options]

Options:
  -n, --network <network>  Network (local, ic)
  --canister-id <id>       Upgrade existing canister
  --cycles <amount>        Cycles to allocate
  --upgrade                Upgrade mode
  --no-verify              Skip post-deployment verification
  --timeout <ms>           Deployment timeout

Examples:
  soulrecall deploy --network local
  soulrecall deploy --network ic --cycles 2000000000000
  soulrecall deploy --canister-id abcde-aaaab --upgrade
```

### exec

Execute task on canister.

```bash
soulrecall exec [options] <task>

Options:
  -c, --canister-id <id>   Canister ID (required)
  --timeout <ms>           Execution timeout
  --async                  Execute asynchronously

Examples:
  soulrecall exec --canister-id abcde-aaaab "analyze data"
  soulrecall exec -c abcde-aaaab "process input" --async
```

### show

Show agent state.

```bash
soulrecall show [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --format <format>        Output format (json, table)
  --field <field>          Show specific field

Examples:
  soulrecall show --canister-id abcde-aaaab
  soulrecall show -c abcde-aaaab --format json
```

### fetch

Download agent state from canister.

```bash
soulrecall fetch [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  -o, --output <path>      Output file path
  --include-memory         Include memory dump

Examples:
  soulrecall fetch --canister-id abcde-aaaab
  soulrecall fetch -c abcde-aaaab -o ./state.json
```

### status

Display project status.

```bash
soulrecall status [options]

Options:
  -c, --canister-id <id>   Specific canister ID
  --json                   JSON output

Examples:
  soulrecall status
  soulrecall status --canister-id abcde-aaaab
```

### list

List all agents.

```bash
soulrecall list [options]

Options:
  --format <format>        Output format (table, json, ids)
  --filter <pattern>       Filter by name pattern
  --network <network>      Filter by network

Examples:
  soulrecall list
  soulrecall list --format json
  soulrecall list --filter "my-*"
```

---

## Wallet Commands

### wallet

Manage agent wallets.

```bash
soulrecall wallet [command] [options]

Subcommands:
  create                  Create new wallet
  list                    List wallets
  balance                 Check wallet balance
  export                  Export wallet
  import                  Import wallet
  delete                  Delete wallet
  sign                    Sign transaction
  transfer                Transfer tokens

Options:
  --chain <chain>         Chain type (icp, ethereum, solana, polkadot)
  --wallet-id <id>        Wallet ID

Examples:
  soulrecall wallet create --chain ethereum
  soulrecall wallet list
  soulrecall wallet balance --wallet-id wallet-123
  soulrecall wallet transfer --to <address> --amount 1.5
```

### wallet create

Create a new wallet.

```bash
soulrecall wallet create [options]

Options:
  --chain <chain>         Chain type (required)
  --agent-id <id>         Associate with agent
  --name <name>           Wallet name

Examples:
  soulrecall wallet create --chain ethereum
  soulrecall wallet create --chain solana --name "main-sol"
```

### wallet import

Import existing wallet.

```bash
soulrecall wallet import [options]

Options:
  --chain <chain>         Chain type
  --mnemonic              Import from mnemonic
  --private-key           Import from private key
  --file <path>           Import from file

Examples:
  soulrecall wallet import --chain ethereum --mnemonic
  soulrecall wallet import --chain solana --private-key
```

### wallet export

Export wallet for backup.

```bash
soulrecall wallet export [options] <wallet-id>

Options:
  --format <format>       Output format (json, mnemonic)
  --show                  Show sensitive data

Examples:
  soulrecall wallet export wallet-123 --format json
  soulrecall wallet export wallet-123 --show --format mnemonic
```

### identity

Manage ICP identities.

```bash
soulrecall identity [command] [options]

Subcommands:
  list                    List identities
  create                  Create new identity
  use                     Switch identity
  export                  Export identity
  import                  Import identity
  whoami                  Show current identity

Examples:
  soulrecall identity list
  soulrecall identity create my-identity
  soulrecall identity use my-identity
  soulrecall identity whoami
```

### cycles

Manage canister cycles.

```bash
soulrecall cycles [command] [options]

Subcommands:
  balance                 Check cycles balance
  top-up                  Top-up canister cycles
  transfer                Transfer cycles
  history                 View cycles history

Examples:
  soulrecall cycles balance <canister-id>
  soulrecall cycles top-up <canister-id> --amount 1000000000000
  soulrecall cycles history <canister-id>
```

### tokens

Query token balances.

```bash
soulrecall tokens [options]

Options:
  --chain <chain>         Chain type
  --address <address>     Wallet address
  --token <token>         Token symbol or canister ID

Examples:
  soulrecall tokens --chain ethereum
  soulrecall tokens --chain solana --address <address>
  soulrecall tokens --chain icp --token ckBTC
```

---

## Monitoring Commands

### monitor

Monitor canister health.

```bash
soulrecall monitor [options]

Options:
  -c, --canister-id <id>   Canister ID
  --interval <ms>          Check interval (default: 5000)
  --alert                  Enable alerts
  --webhook <url>          Alert webhook URL

Examples:
  soulrecall monitor --canister-id abcde-aaaab
  soulrecall monitor -c abcde-aaaab --interval 10000 --alert
```

### health

Run health checks.

```bash
soulrecall health [options]

Options:
  -c, --canister-id <id>   Canister ID
  --detailed               Detailed health report
  --json                   JSON output

Examples:
  soulrecall health
  soulrecall health --canister-id abcde-aaaab --detailed
```

### info

Get canister information.

```bash
soulrecall info [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --json                   JSON output

Examples:
  soulrecall info --canister-id abcde-aaaab
  soulrecall info -c abcde-aaaab --json
```

### stats

View canister statistics.

```bash
soulrecall stats [options]

Options:
  -c, --canister-id <id>   Canister ID
  --period <period>        Time period (1h, 24h, 7d, 30d)
  --format <format>        Output format (table, json)

Examples:
  soulrecall stats --canister-id abcde-aaaab
  soulrecall stats -c abcde-aaaab --period 24h
```

### logs

View canister logs.

```bash
soulrecall logs [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  -n, --lines <n>          Number of lines (default: 100)
  -f, --follow             Follow log output
  --level <level>          Filter by level (debug, info, warn, error)
  --since <time>           Show logs since time

Examples:
  soulrecall logs --canister-id abcde-aaaab
  soulrecall logs -c abcde-aaaab -f
  soulrecall logs -c abcde-aaaab --level error --since 1h
```

---

## Backup Commands

### backup

Backup agent data.

```bash
soulrecall backup [command] [options]

Subcommands:
  create                  Create backup
  list                    List backups
  restore                 Restore from backup
  delete                  Delete backup
  export                  Export backup
  schedule                Schedule backups

Options:
  -c, --canister-id <id>   Canister ID
  -o, --output <path>      Output path
  --no-canister-state      Skip fetching canister state

Examples:
  soulrecall backup --canister-id abcde-aaaab
  soulrecall backup export my-agent -o ./backup.json
  soulrecall backup list --canister-id abcde-aaaab
```

### rebuild

Rebuild agent from state.

```bash
soulrecall rebuild [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --state-file <path>      State file path
  --verify                 Verify after rebuild

Examples:
  soulrecall rebuild --canister-id abcde-aaaab
  soulrecall rebuild -c abcde-aaaab --state-file ./state.json
```

---

## Deployment Commands

### promote

Promote canister between environments.

```bash
soulrecall promote [options] <agent-name>

Options:
  -f, --from <env>         Source environment
  -t, --to <env>           Target environment
  --target-canister <id>   Target canister ID
  --blue-green             Enable blue-green deployment
  -w, --wasm-path <path>   Path to WASM file
  --skip-deploy            Skip actual deploy, only update history

Examples:
  soulrecall promote my-agent --from staging --to production
  soulrecall promote my-agent -f local -t staging --blue-green
  soulrecall promote my-agent -f staging -t prod -w ./dist/agent.wasm
```

### rollback

Rollback canister deployment.

```bash
soulrecall rollback [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --version <n>            Version to rollback to
  --list                   List available versions
  --force                  Force rollback without confirmation

Examples:
  soulrecall rollback --canister-id abcde-aaaab --list
  soulrecall rollback -c abcde-aaaab --version 3
```

---

## Advanced Commands

### inference

Query AI inference services (Bittensor).

```bash
soulrecall inference [options]

Options:
  --prompt <text>          Prompt text
  --model <model>          Model identifier
  --network <network>      Network endpoint
  --timeout <ms>           Request timeout

Examples:
  soulrecall inference --prompt "Hello, world"
  soulrecall inference --prompt "Analyze this" --model text-generation
```

### archive

Archive to Arweave.

```bash
soulrecall archive [command] [options]

Subcommands:
  upload                  Upload to Arweave
  download                Download from Arweave
  status                  Check archive status
  list                    List archives
  estimate                Estimate cost

Examples:
  soulrecall archive upload ./backup.json
  soulrecall archive status <tx-id>
  soulrecall archive estimate --size 1048576
```

### approve

Multi-signature approvals.

```bash
soulrecall approve [command] [options]

Subcommands:
  create                  Create approval request
  list                    List pending approvals
  sign                    Sign approval request
  status                  Check approval status

Options:
  --request-id <id>       Request ID
  --signer <id>           Signer ID

Examples:
  soulrecall approve create --request "Deploy to production"
  soulrecall approve list
  soulrecall approve sign --request-id req-123
```

### profile

Profile canister performance.

```bash
soulrecall profile [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --duration <ms>          Profile duration
  --output <path>          Output file

Examples:
  soulrecall profile --canister-id abcde-aaaab
  soulrecall profile -c abcde-aaaab --duration 60000
```

### trace

View execution traces.

```bash
soulrecall trace [options]

Options:
  -c, --canister-id <id>   Canister ID (required)
  --limit <n>              Number of traces
  --format <format>        Output format (table, json)

Examples:
  soulrecall trace --canister-id abcde-aaaab
  soulrecall trace -c abcde-aaaab --limit 50
```

---

## Command Summary

| Category | Commands |
|----------|----------|
| Core | `init`, `package`, `deploy`, `exec`, `show`, `fetch`, `status`, `list` |
| Wallet | `wallet`, `identity`, `cycles`, `tokens` |
| Monitoring | `monitor`, `health`, `info`, `stats`, `logs` |
| Backup | `backup`, `rebuild` |
| Deployment | `promote`, `rollback` |
| Advanced | `inference`, `archive`, `approve`, `profile`, `trace` |

## Getting Help

```bash
# General help
soulrecall --help

# Command-specific help
soulrecall <command> --help

# Examples
soulrecall deploy --help
soulrecall wallet --help
```
