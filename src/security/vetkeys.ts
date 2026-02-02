/**
 * VetKeys Integration for Encryption/Decryption
 *
 * This module provides encryption and decryption capabilities using
 * VetKeys (Verifiable Encryption Keys) for threshold key derivation.
 *
 * This is a stub implementation that simulates VetKeys functionality.
 * In a full implementation, this would integrate with the actual
 * VetKeys canister on the Internet Computer.
 */

import * as crypto from 'node:crypto';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import type {
  EncryptedData,
  EncryptionResult,
  EncryptionOptions,
  SeedPhrase,
  DerivedKey,
  VetKeysOptions,
  EncryptionAlgorithm,
  KeyDerivationMethod,
} from './types.js';

/**
 * Default encryption algorithm
 */
const DEFAULT_ALGORITHM: EncryptionAlgorithm = 'aes-256-gcm';

/**
 * Default key derivation method
 */
const DEFAULT_KEY_DERIVATION: KeyDerivationMethod = 'pbkdf2';

/**
 * Default PBKDF2 iterations
 */
const DEFAULT_PBKDF2_ITERATIONS = 100000;

/**
 * Key length in bytes (256 bits = 32 bytes)
 */
const KEY_LENGTH = 32;

/**
 * IV length in bytes (for AES-GCM)
 */
const IV_LENGTH = 12;

/**
 * Salt length in bytes
 */
const SALT_LENGTH = 32;

/**
 * Validate BIP39 seed phrase
 */
export function validateSeedPhrase(seedPhrase: string): boolean {
  try {
    return validateMnemonic(seedPhrase);
  } catch {
    return false;
  }
}

/**
 * Derive encryption key from seed phrase
 *
 * This implements PBKDF2 key derivation. In a full VetKeys implementation,
 * this would use threshold key derivation from the VetKeys canister.
 */
export async function deriveKeyFromSeedPhrase(
  seedPhrase: SeedPhrase,
  options: VetKeysOptions & { salt?: string } = {}
): Promise<DerivedKey> {
  // Validate seed phrase
  if (!validateSeedPhrase(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }

  // Generate or use provided salt
  const salt = options.salt ?? crypto.randomBytes(SALT_LENGTH).toString('hex');

  // Convert seed phrase to binary seed
  const seed = mnemonicToSeedSync(seedPhrase);

  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(
    seed,
    Buffer.from(salt, 'hex'),
    DEFAULT_PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  return {
    key: key.toString('hex'),
    salt,
    method: 'pbkdf2',
    iterations: DEFAULT_PBKDF2_ITERATIONS,
  };
}

/**
 * Encrypt data using derived key
 */
export async function encryptData(
  data: string | Buffer,
  seedPhrase: SeedPhrase,
  options: EncryptionOptions = {}
): Promise<EncryptionResult> {
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;
  void (options.keyDerivation ?? DEFAULT_KEY_DERIVATION);

  const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  const originalSize = dataBuffer.length;

  // Derive encryption key
  const derivedKey = await deriveKeyFromSeedPhrase(seedPhrase, {
    salt: options.salt,
  });

  const key = Buffer.from(derivedKey.key, 'hex');

  // Generate IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Encrypt
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const ciphertext = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);

  // Get auth tag for AEAD modes
  const authTag =
    algorithm === 'aes-256-gcm' && 'getAuthTag' in cipher
      ? (cipher as { getAuthTag(): Buffer }).getAuthTag()
      : undefined;

  const encrypted: EncryptedData = {
    algorithm,
    iv: iv.toString('hex'),
    salt: derivedKey.salt,
    ciphertext: ciphertext.toString('hex'),
    authTag: authTag?.toString('hex'),
    keyDerivation: derivedKey.method,
    iterations: derivedKey.iterations,
    encryptedAt: new Date().toISOString(),
  };

  return {
    encrypted,
    originalSize,
    encryptedSize: ciphertext.length,
  };
}

/**
 * Decrypt data using seed phrase
 */
export async function decryptData(
  encrypted: EncryptedData,
  seedPhrase: SeedPhrase
): Promise<Buffer> {
  // Validate seed phrase
  if (!validateSeedPhrase(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }

  // Derive decryption key
  const derivedKey = await deriveKeyFromSeedPhrase(seedPhrase, {
    salt: encrypted.salt,
  });

  const key = Buffer.from(derivedKey.key, 'hex');
  const iv = Buffer.from(encrypted.iv, 'hex');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');

  // Decrypt
  const decipher = crypto.createDecipheriv(encrypted.algorithm, key, iv);

  // Set auth tag for AEAD modes
  if (encrypted.authTag && 'setAuthTag' in decipher) {
    (decipher as { setAuthTag(tag: Buffer): void }).setAuthTag(
      Buffer.from(encrypted.authTag, 'hex')
    );
  }

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return plaintext;
}

/**
 * Encrypt JSON object
 */
export async function encryptJSON<T = unknown>(
  data: T,
  seedPhrase: SeedPhrase,
  options?: EncryptionOptions
): Promise<EncryptionResult> {
  const json = JSON.stringify(data);
  return encryptData(json, seedPhrase, options);
}

/**
 * Decrypt to JSON object
 */
export async function decryptJSON<T = unknown>(
  encrypted: EncryptedData,
  seedPhrase: SeedPhrase
): Promise<T> {
  const plaintext = await decryptData(encrypted, seedPhrase);
  const json = plaintext.toString('utf-8');
  return JSON.parse(json) as T;
}

/**
 * Generate a new BIP39 seed phrase
 */
export function generateSeedPhrase(): string {
  return generateMnemonic(128);
}

/**
 * VetKeys client for threshold key derivation
 *
 * In a full implementation, this would communicate with the VetKeys
 * canister to perform threshold key derivation.
 */
export class VetKeysClient {
  constructor(options: VetKeysOptions = {}) {
    void options.vetKeysCanisterId;
  }

  /**
   * Derive encryption key using VetKeys threshold protocol
   *
   * Stub implementation - uses PBKDF2 for now.
   */
  async deriveThresholdKey(
    seedPhrase: SeedPhrase,
    derivationPath?: string
  ): Promise<DerivedKey> {
    return deriveKeyFromSeedPhrase(seedPhrase, { derivationPath });
  }

  /**
   * Verify that encrypted data was created with VetKeys
   *
   * Stub implementation - always returns true for now.
   */
  async verifyEncryption(_encrypted: EncryptedData): Promise<boolean> {
    return true;
  }
}

/**
 * Create a VetKeys client instance
 */
export function createVetKeysClient(options?: VetKeysOptions): VetKeysClient {
  return new VetKeysClient(options);
}
