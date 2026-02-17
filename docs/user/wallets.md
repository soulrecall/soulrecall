# Wallet Guide

This guide covers wallet management, transactions, and cycles in SoulRecall.

## Overview

SoulRecall supports multi-chain wallets:
- **ICP (Internet Computer)** - Primary wallet for canister operations
- **Polkadot** - For cross-chain transactions
- **Solana** - For DeFi and DApp interactions

## Wallet Types

### Local Wallet

Encrypted wallet stored locally on disk:

```bash
# Create local wallet
soulrecall wallet create

# Features:
# - Encrypted storage (AES-256)
# - Hardware wallet compatibility
# - Multiple accounts support
```

### Hardware Wallet

Connect hardware wallet (Ledger, etc.):

```bash
# Connect hardware wallet
soulrecall wallet connect --hardware

# Features:
# - Private key never leaves device
# - Transaction signing on device
# - Firmware updates required
```

## Creating Wallets

### ICP Wallet

```bash
# Create new ICP wallet
soulrecall wallet create --network icp

# Output: Wallet ID and principal
```

### Importing Wallet

Import existing wallet from mnemonic or private key:

```bash
# Import from mnemonic
soulrecall wallet import --mnemonic

# Import from private key
soulrecall wallet import --private-key
```

## Wallet Commands

### List Wallets

View all connected wallets:

```bash
soulrecall wallet list
```

### Wallet Balance

Check wallet balance:

```bash
# Check all wallets
soulrecall wallet balance

# Check specific wallet
soulrecall wallet balance <wallet-id>
```

### Sign Transaction

Sign a transaction with wallet:

```bash
# Sign transaction
soulrecall wallet sign <wallet-id> --transaction <tx-payload>

# Options:
# --hardware     - Use hardware wallet
# --broadcast   - Broadcast after signing
```

### Transaction History

View transaction history:

```bash
# View all transactions
soulrecall wallet history

# View wallet-specific
soulrecall wallet history <wallet-id>

# Filter by type
soulrecall wallet history --type send
soulrecall wallet history --type receive
```

### Export Wallet

Export wallet keys for backup:

```bash
# Export to JSON
soulrecall wallet export <wallet-id> --format json

# Export to mnemonic (use with caution)
soulrecall wallet export <wallet-id> --format mnemonic --show
```

## Cycles Management

### Top-up Cycles

Add cycles to wallet:

```bash
# Top-up canister
soulrecall wallet top-up <canister-id> --amount 1000000000000

# Options:
# --network icp      - Target network
# --auto-refill     - Enable auto-refill
```

### Transfer Cycles

Transfer cycles between wallets:

```bash
# Transfer cycles
soulrecall wallet transfer --from <wallet-id> --to <wallet-id> --amount 1000000000000
```

### Multi-send

Send cycles to multiple recipients:

```bash
# Batch transfer
soulrecall wallet multi-send --input transfers.json

# Input format:
# {
#   "transfers": [
#     { "to": "recipient-1", "amount": 1000000000000 },
#     { "to": "recipient-2", "amount": 5000000000000 }
#   ]
# }
```

### Process Queue

View and process pending transaction queue:

```bash
# View queue
soulrecall wallet queue

# Process queue
soulrecall wallet queue --process

# Clear failed transactions
soulrecall wallet queue --clear-failed
```

## Cross-Chain Operations

### Polkadot

```bash
# Create Polkadot wallet
soulrecall wallet create --chain polkadot

# Check balance
soulrecall wallet balance <wallet-id> --chain polkadot

# Transfer tokens
soulrecall wallet transfer --chain polkadot --to <address> --amount 1000
```

### Solana

```bash
# Create Solana wallet
soulrecall wallet create --chain solana

# Check balance
soulrecall wallet balance <wallet-id> --chain solana

# Transfer SOL
soulrecall wallet transfer --chain solana --to <address> --amount 1.5
```

## Security Best Practices

### Key Management

- [ ] **Never share mnemonics** - Store securely, never transmit
- [ ] **Use hardware wallets** - For large holdings
- [ ] **Regular backups** - Export wallet to secure location
- [ ] **Verify addresses** - Double-check before sending
- [ ] **Use test transactions** - Small amounts first

### Transaction Safety

- [ ] **Verify recipient address** - Copy-paste carefully
- [ ] **Confirm amounts** - Large transactions, double-check
- [ ] **Review transaction details** - Before broadcasting
- [ ] **Monitor confirmations** - Check on-chain status
- [ ] **Keep records** - Save transaction IDs for reference

### Recovery

**Lost mnemonic?**
```bash
# Can only recover with mnemonic
soulrecall wallet restore --mnemonic "word1 word2 word3 ..."

# No way to recover without mnemonic
```

**Lost private key?**
```bash
# Cannot recover
# Generate new wallet with remaining funds
```

## Troubleshooting

### Wallet Not Found

```bash
# List all wallets
soulrecall wallet list

# Verify wallet ID
soulrecall wallet info <wallet-id>
```

### Insufficient Balance

```bash
# Check balance
soulrecall wallet balance

# Request from faucet (testnet only)
soulrecall wallet faucet

# Purchase cycles
soulrecall wallet purchase --amount 1000000000000
```

### Transaction Failed

```bash
# Check transaction queue
soulrecall wallet queue

# Retry failed transaction
agentwallet wallet retry <tx-id>

# View error details
soulrecall wallet history <tx-id> --details
```

### Hardware Wallet Issues

```bash
# Reconnect hardware wallet
soulrecall wallet reconnect --hardware

# Check firmware
soulrecall wallet check --hardware

# Reset connection
soulrecall wallet disconnect --hardware
```

## Advanced Features

### Multi-Signature Wallets

Configure multi-sig for enhanced security:

```bash
# Create multi-sig wallet
soulrecall wallet create --multisig --signers 3 --threshold 2

# Sign transaction
soulrecall wallet sign <wallet-id> --multisig --signers-required 2
```

### Derivation Paths

Standard derivation paths for BIP-39/44:

```bash
# View derivation path
soulrecall wallet info <wallet-id> --show-derivation

# Change derivation path
soulrecall wallet set-derivation <wallet-id> --path "m/44'/223'/0'/0"
```

### Custom Networks

Add custom blockchain networks:

```bash
# Add network
soulrecall network add --name custom --rpc https://custom-rpc.com

# Use network
soulrecall deploy --network custom
```

## Integration

### ICP Canister Funding

```bash
# Top-up canister from wallet
soulrecall wallet top-up <canister-id> --wallet <wallet-id>

# Auto-refill configuration
soulrecall wallet configure <wallet-id> --auto-refill --threshold 100T
```

### DApp Integration

Connect wallet to Web3 DApps:

```bash
# Inject wallet into browser
soulrecall wallet inject --browser chrome

# Use with DApp
soulrecall wallet dapp-sign <url>
```

## Next Steps

- [ ] Read [Deployment Guide](./deployment.md) for canister funding
- [ ] Read [Troubleshooting](./troubleshooting.md) for common issues
- [ ] Explore [Security Documentation](../dev/security.md)
