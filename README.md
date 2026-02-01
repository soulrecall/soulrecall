# AgentVault

Persistent On-Chain AI Agent Platform - Sovereign, Reconstructible, Autonomous

## Overview

AgentVault is an open-source CLI and canister system that enables true autonomy for local AI agents. It solves the fundamental problem of agent state persistence and execution reliability by migrating from fragile local file storage to immutable, sovereign Internet Computer (ICP) canisters.

**Core value proposition:** Any user can fully rebuild and resume their agent on a clean OS install using only chain data and a seed phrase.

## Features

- **Agent Packaging** - Compile local AI agents to WASM for on-chain deployment
- **Canister Deployment** - Deploy agents to ICP canisters with persistent state
- **State Reconstruction** - Fetch, decrypt, and rebuild agents from chain data
- **Cross-Chain Support** - Native interoperability with Ethereum, Bitcoin, Solana via Chain Fusion
- **Security-First** - VetKeys threshold key derivation for encrypted secrets

## Supported Agents

- Clawdbot (Claude Code)
- Goose
- Cline
- Generic agents

## Requirements

- Node.js 18+
- dfx (Internet Computer SDK)

## Installation

```bash
npm install -g agentvault
```

## Quick Start

```bash
# Package an agent for deployment
agentvault package ./path/to/agent

# Deploy to ICP canister
agentvault deploy my-agent

# Fetch and rebuild agent from chain
agentvault fetch my-agent
agentvault decrypt my-agent
agentvault rebuild my-agent
```

## Documentation

See the [docs](./docs) directory for detailed documentation.

## License

MIT License - see [LICENSE](./LICENSE) for details.
