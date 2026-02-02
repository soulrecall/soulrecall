/**
 * Rebuild command - Rebuild local agent from canister state
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { deserializeState } from '../../src/packaging/serializer.js';
import { compileToWasm } from '../../src/packaging/compiler.js';

export interface RebuildCommandOptions {
  output?: string;
  force?: boolean;
  skipCompile?: boolean;
}

export interface RebuildAnswers {
  confirm: boolean;
}

/**
 * Execute rebuild command
 */
export async function executeRebuild(
  stateFile: string,
  options: RebuildCommandOptions
): Promise<void> {
  const resolvedPath = path.resolve(stateFile);

  // Validate state file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`State file not found: ${resolvedPath}`);
  }

  const spinner = ora('Reading agent state...').start();

  try {
    // Read and deserialize state
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const state = deserializeState(content);

    spinner.succeed('Agent state loaded successfully!');

    console.log();
    console.log(chalk.cyan('Agent Configuration:'));
    console.log(`  Name:        ${chalk.bold(state.config.name)}`);
    console.log(`  Type:        ${state.config.type}`);
    console.log(`  Source:      ${state.config.sourcePath}`);
    console.log(`  Version:     ${state.config.version ?? 'N/A'}`);

    console.log();
    console.log(chalk.cyan('State Info:'));
    console.log(`  Memories:    ${state.memories.length}`);
    console.log(`  Tasks:       ${state.tasks.length}`);
    console.log(`  Context:     ${state.context.size} entries`);

    // Check if source directory exists
    if (!fs.existsSync(state.config.sourcePath)) {
      console.log();
      console.log(chalk.yellow('⚠'), 'Source directory not found:', state.config.sourcePath);
      console.log();
      console.log('You need to provide the source code to rebuild the agent.');
      console.log('Options:');
      console.log('  1. Clone the original repository');
      console.log('  2. Provide a new source directory');

      const { sourcePath } = await inquirer.prompt<{ sourcePath: string }>([
        {
          type: 'input',
          name: 'sourcePath',
          message: 'Enter path to agent source directory:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Source path is required';
            }
            return true;
          },
        },
      ]);

      state.config.sourcePath = path.resolve(sourcePath);
    }

    // Confirm rebuild
    if (!options.force) {
      const { confirm } = await inquirer.prompt<RebuildAnswers>([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Rebuild agent with this configuration?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('\nRebuild cancelled.'));
        return;
      }
    }

    // Skip compilation if requested
    if (options.skipCompile) {
      console.log();
      console.log(chalk.green('✓'), 'Rebuild skipped compilation step.');
      console.log();
      console.log(chalk.cyan('Agent state ready for use:'));
      console.log('  Memories can be restored');
      console.log('  Tasks can be resumed');
      console.log('  Context is preserved');
      return;
    }

    // Compile agent to WASM
    const compileSpinner = ora('Compiling agent to WASM...').start();
    try {
      const result = await compileToWasm(state.config, path.dirname(resolvedPath));

      compileSpinner.succeed(`Agent compiled successfully!`);

      console.log();
      console.log(chalk.cyan('Output Files:'));
      console.log(`  WASM:  ${result.wasmPath}`);
      console.log(`  WAT:   ${result.watPath}`);
      console.log(`  State: ${result.statePath}`);

      console.log();
      console.log(chalk.green('✓'), 'Agent rebuilt successfully!');
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log('  1. Test the rebuilt agent locally');
      console.log('  2. Deploy with:', chalk.bold('agentvault deploy'));
    } catch (error) {
      compileSpinner.fail('Compilation failed');
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    spinner.fail(`Rebuild failed: ${message}`);
    throw error;
  }
}

/**
 * Create rebuild command
 */
export function rebuildCommand(): Command {
  const command = new Command('rebuild');

  command
    .description('Rebuild local agent from canister state')
    .argument('<state-file>', 'agent state file (JSON)')
    .option('-o, --output <path>', 'output directory for rebuilt agent')
    .option('-f, --force', 'skip confirmation prompts')
    .option('--skip-compile', 'skip WASM compilation')
    .action(async (stateFile: string, options: RebuildCommandOptions) => {
      console.log(chalk.bold('\n🔧 AgentVault Rebuild\n'));

      try {
        await executeRebuild(stateFile, options);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`\nError: ${message}`));
        process.exit(1);
      }
    });

  return command;
}
