/**
 * Types for security operations
 */

/**
 * Encryption algorithm used for agent state
 */
export type EncryptionAlgorithm = 'aes-256-gcm' | 'chacha20-poly1305';

/**
 * Key derivation method
 */
export type KeyDerivationMethod = 'vetkd' | 'pbkdf2' | 'scrypt';

/**
 * Encrypted data container
 */
export interface EncryptedData {
  /** Encryption algorithm used */
  algorithm: EncryptionAlgorithm;
  /** IV (Initialization Vector) for encryption */
  iv: string;
  /** Salt used for key derivation */
  salt: string;
  /** Encrypted ciphertext */
  ciphertext: string;
  /** Authentication tag for AEAD modes */
  authTag?: string;
  /** Key derivation method */
  keyDerivation: KeyDerivationMethod;
  /** Number of iterations for key derivation */
  iterations?: number;
  /** Timestamp of encryption */
  encryptedAt: string;
}

/**
 * Result of encryption operation
 */
export interface EncryptionResult {
  /** Encrypted data */
  encrypted: EncryptedData;
  /** Original data size in bytes */
  originalSize: number;
  /** Encrypted data size in bytes */
  encryptedSize: number;
}

/**
 * Options for encryption
 */
export interface EncryptionOptions {
  /** Encryption algorithm to use */
  algorithm?: EncryptionAlgorithm;
  /** Key derivation method */
  keyDerivation?: KeyDerivationMethod;
  /** Number of iterations for PBKDF2 */
  pbkdf2Iterations?: number;
  /** Salt for key derivation (auto-generated if not provided) */
  salt?: string;
}

/**
 * Seed phrase (BIP39 mnemonic)
 */
export type SeedPhrase = string;

/**
 * Derived key container
 */
export interface DerivedKey {
  /** The derived key as hex string */
  key: string;
  /** Salt used for derivation */
  salt: string;
  /** Derivation method used */
  method: KeyDerivationMethod;
  /** Iterations used (if applicable) */
  iterations?: number;
}

/**
 * VetKeys options
 */
export interface VetKeysOptions {
  /** Canister ID for VetKeys service */
  vetKeysCanisterId?: string;
  /** Derivation path for the key */
  derivationPath?: string;
  /** Threshold for multi-party computation */
  threshold?: number;
}
