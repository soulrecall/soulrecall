/**
 * Types for ICP tool integration (ic-wasm, icp-cli)
 *
 * Provides TypeScript interfaces for all external tool operations.
 */

// ─── Tool Detection ────────────────────────────────────────────────────────

/** Names of external tools that can be detected */
export type ToolName = 'ic-wasm' | 'icp' | 'dfx';

/** Result of detecting a single tool */
export interface ToolInfo {
  /** Tool name */
  name: ToolName;
  /** Whether the tool is installed and reachable */
  available: boolean;
  /** Absolute path to the binary (if found) */
  path?: string;
  /** Semver version string (if available) */
  version?: string;
}

/** Combined detection result for all tools */
export interface ToolchainStatus {
  icWasm: ToolInfo;
  icp: ToolInfo;
  dfx: ToolInfo;
  /** Preferred deployment tool based on availability */
  preferredDeployTool: 'icp' | 'dfx' | null;
  /** Whether ic-wasm optimization is available */
  canOptimize: boolean;
}

// ─── ic-wasm Types ─────────────────────────────────────────────────────────

/** Optimization level for ic-wasm optimize (maps to wasm-opt levels) */
export type IcWasmOptLevel = 'O0' | 'O1' | 'O2' | 'O3' | 'O4' | 'Os' | 'Oz';

/** Options for ic-wasm optimize command */
export interface IcWasmOptimizeOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path */
  output: string;
  /** Optimization level */
  level?: IcWasmOptLevel;
}

/** Options for ic-wasm shrink command */
export interface IcWasmShrinkOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path */
  output: string;
}

/** Options for ic-wasm resource command */
export interface IcWasmResourceOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path */
  output: string;
  /** Resource limit name */
  name: string;
  /** Resource limit value */
  value: string;
}

/** Metadata visibility */
export type MetadataVisibility = 'public' | 'private';

/** Options for ic-wasm metadata command */
export interface IcWasmMetadataOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path (for set operations) */
  output?: string;
  /** Metadata key name */
  name: string;
  /** Metadata value (for set operations, string data via -d) */
  data?: string;
  /** Metadata file path (for set operations, file data via -f) */
  file?: string;
  /** Metadata visibility */
  visibility?: MetadataVisibility;
}

/** Options for ic-wasm check-endpoints command */
export interface IcWasmCheckEndpointsOptions {
  /** Input WASM file path */
  input: string;
  /** Path to Candid .did interface file */
  candidInterface: string;
}

/** Options for ic-wasm instrument command */
export interface IcWasmInstrumentOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path */
  output: string;
}

/** Result of an ic-wasm command execution */
export interface IcWasmResult {
  /** Whether the command succeeded */
  success: boolean;
  /** stdout from the command */
  stdout: string;
  /** stderr from the command */
  stderr: string;
  /** Exit code */
  exitCode: number;
}

/** Result of ic-wasm info command */
export interface IcWasmInfo {
  /** Raw info output text */
  raw: string;
  /** Parsed sections (best effort) */
  sections?: Record<string, string>;
}

/** Result of an optimization operation with metrics */
export interface OptimizationResult {
  /** Whether optimization succeeded */
  success: boolean;
  /** Path to the optimized WASM */
  outputPath: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Optimized file size in bytes */
  optimizedSize: number;
  /** Size reduction as a percentage (0-100) */
  reductionPercent: number;
  /** Duration of the optimization in milliseconds */
  durationMs: number;
  /** Any warnings from the tool */
  warnings: string[];
  /** Error message if failed */
  error?: string;
}

/** Combined optimization pipeline options */
export interface OptimizationPipelineOptions {
  /** Input WASM file path */
  input: string;
  /** Output WASM file path */
  output: string;
  /** Run ic-wasm optimize (default true if ic-wasm available) */
  optimize?: boolean;
  /** Optimization level for wasm-opt */
  optimizeLevel?: IcWasmOptLevel;
  /** Run ic-wasm shrink (default true) */
  shrink?: boolean;
  /** Set resource limits */
  resourceLimits?: Record<string, string>;
  /** Validate against Candid interface */
  candidInterface?: string;
  /** Inject metadata */
  metadata?: Array<{ name: string; data: string; visibility?: MetadataVisibility }>;
}

/** Result of the full optimization pipeline */
export interface OptimizationPipelineResult {
  /** Whether the entire pipeline succeeded */
  success: boolean;
  /** Path to the final optimized WASM */
  outputPath: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Final file size in bytes */
  finalSize: number;
  /** Size reduction as a percentage (0-100) */
  reductionPercent: number;
  /** Total duration in milliseconds */
  totalDurationMs: number;
  /** Per-step results */
  steps: Array<{
    step: string;
    success: boolean;
    durationMs: number;
    sizeAfter?: number;
    error?: string;
  }>;
  /** Validation result (if Candid interface provided) */
  validationPassed?: boolean;
  /** Collected warnings */
  warnings: string[];
}

// ─── icp-cli Types ─────────────────────────────────────────────────────────

/** Environment name for icp-cli */
export type IcpEnvironment = 'local' | 'ic' | string;

/** Deploy mode for icp deploy */
export type IcpDeployMode = 'auto' | 'install' | 'reinstall' | 'upgrade';

/** Common options shared across icp-cli commands */
export interface IcpCommonOptions {
  /** Override environment */
  environment?: IcpEnvironment;
  /** Override project root */
  projectRoot?: string;
  /** Run as a different identity */
  identity?: string;
  /** Password file for encrypted identity */
  identityPasswordFile?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/** Options for icp build command */
export interface IcpBuildOptions extends IcpCommonOptions {
  /** Canister names to build (omit for all) */
  canisters?: string[];
}

/** Options for icp deploy command */
export interface IcpDeployOptions extends IcpCommonOptions {
  /** Deploy mode */
  mode?: IcpDeployMode;
  /** Canister names to deploy (omit for all) */
  canisters?: string[];
}

/** Options for icp canister status command */
export interface IcpCanisterStatusOptions extends IcpCommonOptions {
  /** Canister ID or name */
  canister: string;
}

/** Options for icp canister call command */
export interface IcpCanisterCallOptions extends IcpCommonOptions {
  /** Canister ID or name */
  canister: string;
  /** Method name */
  method: string;
  /** Arguments (Candid text format) */
  args?: string;
}

/** Options for icp cycles balance command */
export interface IcpCyclesBalanceOptions extends IcpCommonOptions {
  /** Canister ID */
  canister: string;
}

/** Options for icp cycles mint command */
export interface IcpCyclesMintOptions extends IcpCommonOptions {
  /** Amount to mint */
  amount: string;
}

/** Options for icp cycles transfer command */
export interface IcpCyclesTransferOptions extends IcpCommonOptions {
  /** Amount to transfer */
  amount: string;
  /** Destination canister ID */
  to: string;
}

/** Options for icp identity list */
export interface IcpIdentityListOptions extends IcpCommonOptions {}

/** Options for icp identity new */
export interface IcpIdentityNewOptions extends IcpCommonOptions {
  /** Identity name */
  name: string;
}

/** Options for icp identity export */
export interface IcpIdentityExportOptions extends IcpCommonOptions {
  /** Identity name */
  name: string;
}

/** Options for icp identity import */
export interface IcpIdentityImportOptions extends IcpCommonOptions {
  /** Identity name */
  name: string;
  /** PEM file path */
  pemFile: string;
}

/** Options for icp network start */
export interface IcpNetworkStartOptions extends IcpCommonOptions {
  /** Network name (default: local) */
  name?: string;
}

/** Options for icp network stop */
export interface IcpNetworkStopOptions extends IcpCommonOptions {
  /** Network name (default: local) */
  name?: string;
}

/** Options for icp sync command */
export interface IcpSyncOptions extends IcpCommonOptions {}

/** Options for icp token balance */
export interface IcpTokenBalanceOptions extends IcpCommonOptions {
  /** Canister ID of the token ledger */
  canister?: string;
}

/** Options for icp token transfer */
export interface IcpTokenTransferOptions extends IcpCommonOptions {
  /** Amount to transfer */
  amount: string;
  /** Recipient principal or account ID */
  to: string;
  /** Token canister ID (for ICRC-1 tokens) */
  canister?: string;
}

/** Options for icp environment list */
export interface IcpEnvironmentListOptions extends IcpCommonOptions {}

/** Result of an icp-cli command execution */
export interface IcpCliResult {
  /** Whether the command succeeded */
  success: boolean;
  /** stdout from the command */
  stdout: string;
  /** stderr from the command */
  stderr: string;
  /** Exit code */
  exitCode: number;
}

// ─── Environment Configuration ─────────────────────────────────────────────

/** Network type in icp.yaml configuration */
export interface IcpNetworkConfig {
  type: 'local' | 'ic';
  replicaCount?: number;
}

/** Cycles configuration in icp.yaml */
export interface IcpCyclesConfig {
  initial?: string;
}

/** Single environment definition in icp.yaml */
export interface IcpEnvironmentConfig {
  network: IcpNetworkConfig;
  cycles?: IcpCyclesConfig;
  identity?: string;
}

/** Optimization configuration in icp.yaml */
export interface IcpOptimizationConfig {
  level?: number;
  shrink?: boolean;
  removeDebug?: boolean;
  wasmOptFlags?: string[];
}

/** Top-level icp.yaml configuration */
export interface IcpProjectConfig {
  environments?: Record<string, IcpEnvironmentConfig>;
  optimization?: IcpOptimizationConfig;
}

// ─── Monitoring Types (Phase 2) ────────────────────────────────────────────

/** Canister health status */
export type CanisterHealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/** Alert severity levels */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/** Canister status info from monitoring */
export interface CanisterStatusInfo {
  canisterId: string;
  status: string;
  memorySize?: bigint;
  cycles?: bigint;
  moduleHash?: string;
  controllers?: string[];
  health: CanisterHealthStatus;
}

/** Monitoring alert */
export interface MonitoringAlert {
  severity: AlertSeverity;
  message: string;
  canisterId: string;
  metric: string;
  value: string;
  threshold: string;
  timestamp: Date;
}

/** Health check thresholds */
export interface HealthThresholds {
  /** Cycles below this value trigger a warning */
  cyclesWarning?: bigint;
  /** Cycles below this value trigger a critical alert */
  cyclesCritical?: bigint;
  /** Memory usage above this percentage triggers a warning (0-100) */
  memoryWarningPercent?: number;
  /** Memory usage above this percentage triggers a critical alert (0-100) */
  memoryCriticalPercent?: number;
}
