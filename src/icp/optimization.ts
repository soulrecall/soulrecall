/**
 * Optimization Pipeline
 *
 * Orchestrates ic-wasm optimize, shrink, resource limiting, metadata
 * injection, and Candid validation into a single pipeline that runs
 * after WASM generation in the packaging step.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectTool } from './tool-detector.js';
import * as icwasm from './icwasm.js';
import type {
  OptimizationPipelineOptions,
  OptimizationPipelineResult,
  IcWasmOptLevel,
} from './types.js';

/**
 * Run the full optimization pipeline on a WASM file.
 *
 * Steps (in order, each optional):
 *   1. ic-wasm shrink   - remove unused functions & debug info
 *   2. ic-wasm optimize - wasm-opt transformations
 *   3. ic-wasm resource - set resource limits
 *   4. ic-wasm metadata - inject metadata sections
 *   5. ic-wasm check-endpoints - validate against Candid interface
 *
 * Each step writes to a temporary file and the final result is moved
 * to the output path. If ic-wasm is not available, the pipeline copies
 * the input to the output unchanged and reports a warning.
 *
 * @param options - Pipeline options
 * @returns Pipeline result with metrics
 */
export async function runOptimizationPipeline(
  options: OptimizationPipelineOptions,
): Promise<OptimizationPipelineResult> {
  const startTime = Date.now();
  const steps: OptimizationPipelineResult['steps'] = [];
  const warnings: string[] = [];
  let currentInput = options.input;

  // Verify input exists
  if (!fs.existsSync(options.input)) {
    return {
      success: false,
      outputPath: options.output,
      originalSize: 0,
      finalSize: 0,
      reductionPercent: 0,
      totalDurationMs: Date.now() - startTime,
      steps: [],
      warnings: [`Input file not found: ${options.input}`],
    };
  }

  const originalSize = fs.statSync(options.input).size;

  // Check if ic-wasm is available
  const icWasmTool = await detectTool('ic-wasm');
  if (!icWasmTool.available) {
    // No optimization possible - copy input to output
    fs.copyFileSync(options.input, options.output);
    warnings.push('ic-wasm not found; skipping optimization. Install with: cargo install ic-wasm');
    return {
      success: true,
      outputPath: options.output,
      originalSize,
      finalSize: originalSize,
      reductionPercent: 0,
      totalDurationMs: Date.now() - startTime,
      steps: [],
      warnings,
    };
  }

  // Create temp directory for intermediate files
  const tempDir = path.join(path.dirname(options.output), '.icp-optimize-tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  let tempCounter = 0;
  function nextTemp(): string {
    return path.join(tempDir, `step_${++tempCounter}.wasm`);
  }

  // Step 1: Shrink
  if (options.shrink !== false) {
    const stepStart = Date.now();
    const tempOut = nextTemp();
    const result = await icwasm.shrink({ input: currentInput, output: tempOut });
    const step = {
      step: 'shrink',
      success: result.success,
      durationMs: Date.now() - stepStart,
      sizeAfter: undefined as number | undefined,
      error: undefined as string | undefined,
    };
    if (result.success && fs.existsSync(tempOut)) {
      step.sizeAfter = fs.statSync(tempOut).size;
      currentInput = tempOut;
    } else {
      step.error = result.stderr || 'Shrink failed';
      warnings.push(`Shrink step failed: ${step.error}`);
    }
    steps.push(step);
  }

  // Step 2: Optimize
  if (options.optimize !== false) {
    const stepStart = Date.now();
    const tempOut = nextTemp();
    const level: IcWasmOptLevel = options.optimizeLevel ?? 'O3';
    const result = await icwasm.optimize({
      input: currentInput,
      output: tempOut,
      level,
    });
    const step = {
      step: `optimize (${level})`,
      success: result.success,
      durationMs: Date.now() - stepStart,
      sizeAfter: undefined as number | undefined,
      error: undefined as string | undefined,
    };
    if (result.success && fs.existsSync(tempOut)) {
      step.sizeAfter = fs.statSync(tempOut).size;
      currentInput = tempOut;
    } else {
      step.error = result.stderr || 'Optimize failed';
      warnings.push(`Optimize step failed: ${step.error}`);
    }
    steps.push(step);
  }

  // Step 3: Resource limits
  if (options.resourceLimits && Object.keys(options.resourceLimits).length > 0) {
    for (const [name, value] of Object.entries(options.resourceLimits)) {
      const stepStart = Date.now();
      const tempOut = nextTemp();
      const result = await icwasm.setResource({
        input: currentInput,
        output: tempOut,
        name,
        value,
      });
      const step = {
        step: `resource (${name}=${value})`,
        success: result.success,
        durationMs: Date.now() - stepStart,
        sizeAfter: undefined as number | undefined,
        error: undefined as string | undefined,
      };
      if (result.success && fs.existsSync(tempOut)) {
        step.sizeAfter = fs.statSync(tempOut).size;
        currentInput = tempOut;
      } else {
        step.error = result.stderr || 'Resource limit failed';
        warnings.push(`Resource limit '${name}' failed: ${step.error}`);
      }
      steps.push(step);
    }
  }

  // Step 4: Metadata injection
  if (options.metadata && options.metadata.length > 0) {
    for (const meta of options.metadata) {
      const stepStart = Date.now();
      const tempOut = nextTemp();
      const result = await icwasm.setMetadata({
        input: currentInput,
        output: tempOut,
        name: meta.name,
        data: meta.data,
        visibility: meta.visibility,
      });
      const step = {
        step: `metadata (${meta.name})`,
        success: result.success,
        durationMs: Date.now() - stepStart,
        sizeAfter: undefined as number | undefined,
        error: undefined as string | undefined,
      };
      if (result.success && fs.existsSync(tempOut)) {
        step.sizeAfter = fs.statSync(tempOut).size;
        currentInput = tempOut;
      } else {
        step.error = result.stderr || 'Metadata set failed';
        warnings.push(`Metadata '${meta.name}' failed: ${step.error}`);
      }
      steps.push(step);
    }
  }

  // Step 5: Candid validation (does not produce output, just validates)
  let validationPassed: boolean | undefined;
  if (options.candidInterface) {
    const stepStart = Date.now();
    const result = await icwasm.checkEndpoints({
      input: currentInput,
      candidInterface: options.candidInterface,
    });
    validationPassed = result.success;
    const step = {
      step: 'check-endpoints',
      success: result.success,
      durationMs: Date.now() - stepStart,
      sizeAfter: undefined as number | undefined,
      error: undefined as string | undefined,
    };
    if (!result.success) {
      step.error = result.stderr || 'Endpoint validation failed';
      warnings.push(`Candid validation failed: ${step.error}`);
    }
    steps.push(step);
  }

  // Move final result to output path
  if (currentInput !== options.input) {
    fs.copyFileSync(currentInput, options.output);
  } else {
    // No steps modified the file; copy input to output
    fs.copyFileSync(options.input, options.output);
  }

  const finalSize = fs.statSync(options.output).size;

  // Cleanup temp directory
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  const reductionPercent = originalSize > 0
    ? Math.round(((originalSize - finalSize) / originalSize) * 100)
    : 0;

  const allStepsSucceeded = steps.every((s) => s.success);

  return {
    success: allStepsSucceeded,
    outputPath: options.output,
    originalSize,
    finalSize,
    reductionPercent,
    totalDurationMs: Date.now() - startTime,
    steps,
    validationPassed,
    warnings,
  };
}
