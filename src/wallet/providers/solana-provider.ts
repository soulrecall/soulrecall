/**
 * Solana Wallet Provider (Stub)
 *
 * Stub provider for Solana wallet operations.
 * TODO: Implement full Solana provider with @solana/web3.js
 */

import type {
  Balance,
  Transaction,
  TransactionRequest,
  SignedTransaction,
} from '../types.js';
import { BaseWalletProvider } from './base-provider.js';

/**
 * Solana provider
 */
export class SolanaProvider extends BaseWalletProvider {
  async connect(): Promise<void> {
    // TODO: Implement connection to Solana RPC
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async getBalance(_address: string): Promise<Balance> {
    return {
      amount: '0',
      denomination: 'SOL',
      chain: 'solana',
      address: _address,
    };
  }

  async sendTransaction(
    _from: string,
    _request: TransactionRequest
  ): Promise<Transaction> {
    throw new Error('Solana provider not fully implemented yet');
  }

  async signTransaction(
    _tx: any,
    _privateKey: string
  ): Promise<SignedTransaction> {
    throw new Error('Solana provider not fully implemented yet');
  }

  async getTransactionHistory(_address: string): Promise<Transaction[]> {
    return [];
  }

  validateAddress(address: string): boolean {
    // Basic Base58 validation (32-44 bytes)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  async estimateFee(_request: TransactionRequest): Promise<string> {
    return '0.000005';
  }

  async getBlockNumber(): Promise<number> {
    return 0;
  }

  async getTransaction(_txHash: string): Promise<Transaction | null> {
    return null;
  }
}
