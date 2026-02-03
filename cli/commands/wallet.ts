/**
 * Wallet Command
 *
 * Main wallet management command for AgentVault.
 * Provides CLI interface for wallet operations.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import {
  generateWallet,
  importWalletFromPrivateKey,
  importWalletFromSeed,
  importWalletFromMnemonic,
  getWallet,
  listAgentWallets,
  hasWallet,
  removeWallet,
} from '../../src/wallet/index.js';
import {
  CkEthProvider,
} from '../../src/wallet/providers/cketh-provider.js';

/**
 * Create wallet command
 */
export function walletCommand(): Command {
  const command = new Command('wallet');

  command
    .description('Manage agent wallets (ckETH, Polkadot, Solana)')
    .argument('<subcommand>', 'wallet subcommand to execute')
    .option('-a, --agent-id <id>', 'agent ID (required)')
    .action(async (subcommand, options) => {
      await executeWalletCommand(subcommand, options);
    });

  return command;
}

/**
 * Execute wallet subcommand
 */
async function executeWalletCommand(
  subcommand: string,
  options: { agentId?: string }
): Promise<void> {
  if (!options.agentId) {
    console.error(chalk.red('Error: --agent-id is required'));
    process.exit(1);
  }

  switch (subcommand) {
    case 'connect':
      await handleConnect(options.agentId!);
      break;
    case 'disconnect':
      await handleDisconnect(options.agentId!);
      break;
    case 'balance':
      await handleBalance(options.agentId!);
      break;
    case 'send':
      await handleSend(options.agentId!);
      break;
    case 'list':
      await handleList(options.agentId!);
      break;
    default:
      console.error(chalk.red(`Unknown subcommand: ${subcommand}`));
      console.log();
      console.log(chalk.cyan('Available subcommands:'));
      console.log('  connect    - Connect or create a wallet');
      console.log('  disconnect - Disconnect wallet');
      console.log('  balance   - Check wallet balance');
      console.log('  send      - Send transaction');
      console.log('  list      - List all wallets');
      console.log('  sign      - Sign transaction');
      console.log('  history   - Get transaction history');
      process.exit(1);
  }
}

/**
 * Handle wallet connect/create
 */
async function handleConnect(agentId: string): Promise<void> {
  console.log(chalk.bold('\n🔑 Wallet Connect\n'));

  const { method } = await inquirer.prompt<{ method: string }>([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to create the wallet?',
      choices: [
        { name: 'generate', value: 'Generate new wallet (recommended)' },
        { name: 'seed', value: 'Import from seed phrase' },
        { name: 'private-key', value: 'Import from private key' },
      ],
    },
  ]);

  const { chain } = await inquirer.prompt<{ chain: string }>([
    {
      type: 'list',
      name: 'chain',
      message: 'Which blockchain?',
      choices: [
        { name: 'cketh', value: 'ckETH (Ethereum on ICP)' },
        { name: 'polkadot', value: 'Polkadot' },
        { name: 'solana', value: 'Solana' },
      ],
    },
  ]);

  let wallet;

  if (method === 'generate') {
    wallet = generateWallet(agentId, chain);
    console.log(chalk.green('✓'), 'New wallet generated');
  } else if (method === 'seed') {
    const { seedPhrase, derivationPath } = await inquirer.prompt<{
      seedPhrase: string;
      derivationPath: string;
    }>([
      {
        type: 'password',
        name: 'seedPhrase',
        message: 'Enter seed phrase (BIP39):',
        validate: (input) => input.split(' ').length >= 12,
      },
      {
        type: 'input',
        name: 'derivationPath',
        message: 'Derivation path (optional):',
        default: '',
      },
    ]);

    wallet = importWalletFromSeed(
      agentId,
      chain,
      seedPhrase,
      derivationPath || undefined
    );
    console.log(chalk.green('✓'), 'Wallet imported from seed phrase');
  } else if (method === 'private-key') {
    const { privateKey } = await inquirer.prompt<{ privateKey: string }>([
      {
        type: 'password',
        name: 'privateKey',
        message: 'Enter private key (hex):',
        validate: (input) => /^0x[0-9a-fA-F]{64}$/.test(input),
      },
    ]);

    wallet = importWalletFromPrivateKey(agentId, chain, privateKey);
    console.log(chalk.green('✓'), 'Wallet imported from private key');
  }

  // Display wallet info
  console.log();
  console.log(chalk.cyan('Wallet Info:'));
  console.log(`  ID:       ${wallet.id}`);
  console.log(`  Chain:    ${wallet.chain}`);
  console.log(`  Address:  ${wallet.address}`);
  console.log(`  Created:  ${new Date(wallet.createdAt).toISOString()}`);

  // Test connection to provider
  const spinner = ora('Testing provider connection...').start();

  try {
    const provider = new CkEthProvider({
      chain: chain as any,
      rpcUrl: CkEthProvider.getDefaultRpcUrl(),
      isTestnet: false,
    });

    await provider.connect();
    const balance = await provider.getBalance(wallet.address);

    spinner.succeed('Provider connected');

    console.log();
    console.log(chalk.cyan('Balance:'));
    console.log(`  ${balance.amount} ${balance.denomination}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    spinner.fail(`Provider connection failed: ${message}`);
  }
}

/**
 * Handle wallet disconnect
 */
async function handleDisconnect(agentId: string): Promise<void> {
  const wallets = listAgentWallets(agentId);

  if (wallets.length === 0) {
    console.log(chalk.yellow('No wallets found for this agent'));
    return;
  }

  const { walletId } = await inquirer.prompt<{ walletId: string }>([
    {
      type: 'list',
      name: 'walletId',
      message: 'Select wallet to disconnect:',
      choices: wallets,
    },
  ]);

  removeWallet(agentId, walletId);
  console.log(chalk.green('✓'), 'Wallet disconnected');
}

/**
 * Handle wallet balance query
 */
async function handleBalance(agentId: string): Promise<void> {
  const wallets = listAgentWallets(agentId);

  if (wallets.length === 0) {
    console.log(chalk.yellow('No wallets found for this agent'));
    return;
  }

  const { walletId } = await inquirer.prompt<{ walletId: string }>([
    {
      type: 'list',
      name: 'walletId',
      message: 'Select wallet:',
      choices: wallets,
    },
  ]);

  const wallet = getWallet(agentId, walletId);

  if (!wallet) {
    console.log(chalk.red('Wallet not found'));
    return;
  }

  const spinner = ora('Fetching balance...').start();

  try {
    const provider = new CkEthProvider({
      chain: wallet.chain as any,
      rpcUrl: CkEthProvider.getDefaultRpcUrl(),
      isTestnet: false,
    });

    await provider.connect();
    const balance = await provider.getBalance(wallet.address);

    spinner.succeed('Balance fetched');

    console.log();
    console.log(chalk.cyan('Balance:'));
    console.log(`  Address:  ${wallet.address}`);
    console.log(`  Amount:  ${balance.amount} ${balance.denomination}`);
    console.log(`  Block:   ${balance.blockNumber}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    spinner.fail(`Failed to fetch balance: ${message}`);
  }
}

/**
 * Handle wallet send transaction
 */
async function handleSend(agentId: string): Promise<void> {
  const wallets = listAgentWallets(agentId);

  if (wallets.length === 0) {
    console.log(chalk.yellow('No wallets found for this agent'));
    return;
  }

  const { walletId } = await inquirer.prompt<{ walletId: string }>([
    {
      type: 'list',
      name: 'walletId',
      message: 'Select wallet:',
      choices: wallets,
    },
  ]);

  const wallet = getWallet(agentId, walletId);

  if (!wallet) {
    console.log(chalk.red('Wallet not found'));
    return;
  }

  const { toAddress, amount } = await inquirer.prompt<{
    toAddress: string;
    amount: string;
  }>([
    {
      type: 'input',
      name: 'toAddress',
      message: 'Recipient address:',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Amount to send:',
      validate: (input) => parseFloat(input) > 0,
    },
  ]);

  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Send ${amount} to ${toAddress}?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\nTransaction cancelled'));
    return;
  }

  const spinner = ora('Sending transaction...').start();

  try {
    const provider = new CkEthProvider({
      chain: wallet.chain as any,
      rpcUrl: CkEthProvider.getDefaultRpcUrl(),
      isTestnet: false,
    });

    await provider.connect();
    const tx = await provider.sendTransaction(wallet.address, {
      to: toAddress,
      amount,
      chain: wallet.chain as any,
    });

    spinner.succeed('Transaction sent');

    console.log();
    console.log(chalk.cyan('Transaction:'));
    console.log(`  Hash:     ${tx.hash}`);
    console.log(`  From:     ${tx.from}`);
    console.log(`  To:       ${tx.to}`);
    console.log(`  Amount:   ${tx.amount}`);
    console.log(`  Status:   ${tx.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    spinner.fail(`Failed to send transaction: ${message}`);
  }
}

/**
 * Handle wallet list
 */
async function handleList(agentId: string): Promise<void> {
  const wallets = listAgentWallets(agentId);

  if (wallets.length === 0) {
    console.log(chalk.yellow('No wallets found for this agent'));
    return;
  }

  console.log();
  console.log(chalk.cyan(`Wallets for agent: ${agentId}`));
  console.log();

  for (const walletId of wallets) {
    const wallet = getWallet(agentId, walletId);

    if (wallet) {
      console.log(chalk.white(walletId));
      console.log(`  Chain:    ${wallet.chain}`);
      console.log(`  Address:  ${wallet.address}`);
      console.log(`  Created:  ${new Date(wallet.createdAt).toISOString()}`);
      console.log();
    }
  }
}
