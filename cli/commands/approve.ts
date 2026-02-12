import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import {
  createApprovalRequest,
  signApprovalRequest,
  rejectApprovalRequest,
  listApprovalRequests,
  listPendingApprovals,
  deleteApprovalRequest,
  isApproved,
  getApprovalSummary,
  cleanupExpiredRequests,
  type ApprovalConfig,
} from '../../src/security/index.js';

const approveCmd = new Command('approve');

approveCmd
  .description('[Experimental] Manage multi-signature approval workflows')
  .action(async () => {
    console.log(chalk.yellow('[Experimental] This feature is under active development and may change.'));
    console.log(chalk.yellow('Please specify a subcommand: create, list, sign, reject, delete, or cleanup'));
    console.log(chalk.gray(`\nExamples:
  ${chalk.cyan('agentvault approve create deploy <agent-name> "Description"')}${chalk.gray('  Create approval request')}
  ${chalk.cyan('agentvault approve list')}${chalk.gray('                     List all requests')}
  ${chalk.cyan('agentvault approve sign <request-id>')}${chalk.gray('             Sign a request')}
  ${chalk.cyan('agentvault approve reject <request-id>')}${chalk.gray('          Reject a request')}
  ${chalk.cyan('agentvault approve pending <signer>')}${chalk.gray('          Show pending requests')}`));
  });

approveCmd
  .command('create')
  .description('Create a new approval request')
  .argument('<type>', 'Request type: deploy, upgrade, transfer, config_change, rollback')
  .argument('<agent-name>', 'Agent name')
  .argument('<description>', 'Description of the change')
  .option('--proposed-by <name>', 'Proposer name', 'admin')
  .option('--policy <policy>', 'Approval policy: all, majority, quorum', 'majority')
  .option('--required <number>', 'Number of required approvals')
  .option('--timeout <ms>', 'Approval timeout in milliseconds', '86400000')
  .option('--signers <count>', 'Number of allowed signers', '3')
  .action(async (type, agentName, description, options) => {
    const spinner = ora(`Creating approval request...`).start();

    try {
      const config: ApprovalConfig = {
        policy: options.policy as any,
        requiredApprovals: options.required ? parseInt(options.required, 10) : undefined,
        approvalTimeoutMs: parseInt(options.timeout, 10),
        allowedSigners: Array.from({ length: parseInt(options.signers, 10) }, (_, i) => `signer${i + 1}`),
      };

      const request = createApprovalRequest(
        type as any,
        agentName,
        description,
        options.proposedBy,
        config,
      );

      spinner.succeed(chalk.green(`Approval request created: ${request.id}`));
      console.log(chalk.gray(`Type: ${request.type}`));
      console.log(chalk.gray(`Policy: ${request.policy}`));
      console.log(chalk.gray(`Required approvals: ${request.requiredApprovals}`));
      console.log(chalk.gray(`Expires: ${request.expiresAt?.toLocaleString()}`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create approval request'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('list')
  .description('List approval requests')
  .option('--agent <name>', 'Filter by agent name')
  .option('--status <status>', 'Filter by status: pending, approved, rejected, expired')
  .action(async (options) => {
    const spinner = ora('Loading approval requests...').start();

    try {
      const requests = listApprovalRequests(options.agent, options.status as any);

      spinner.succeed(chalk.green(`Found ${requests.length} request(s)`));

      if (requests.length === 0) {
        console.log(chalk.gray('No approval requests found'));
        return;
      }

      for (const req of requests) {
        const statusColor = {
          pending: chalk.yellow,
          approved: chalk.green,
          rejected: chalk.red,
          expired: chalk.gray,
        }[req.status] || chalk.gray;

        const progress = `${req.approvals.length}/${req.requiredApprovals}`;

        console.log(`\n${chalk.bold(req.id)}`);
        console.log(`  Type: ${req.type}`);
        console.log(`  Agent: ${req.agentName}`);
        console.log(`  Status: ${statusColor(req.status)} ${progress}`);
        console.log(`  Proposed by: ${req.proposedBy}`);
        console.log(`  Description: ${req.description}`);

        if (req.approvals.length > 0) {
          console.log('  Signatures:');
          for (const sig of req.approvals) {
            console.log(`    - ${sig.signer} (${sig.timestamp.toLocaleString()})`);
            if (sig.comment) {
              console.log(`      ${chalk.gray(sig.comment)}`);
            }
          }
        }
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to list approval requests'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('sign')
  .description('Sign an approval request')
  .argument('<request-id>', 'Request ID to sign')
  .argument('<signer>', 'Signer name')
  .option('--comment <text>', 'Comment on signature')
  .action(async (requestId, signer, options) => {
    const spinner = ora(`Signing request ${requestId}...`).start();

    try {
      const success = signApprovalRequest(requestId, signer, options.comment);

      if (success) {
        const approved = isApproved(requestId);
        spinner.succeed(chalk.green(`Request signed by ${signer}`));
        if (approved) {
          console.log(chalk.green('\n✓ Request is now approved!'));
        } else {
          const summary = getApprovalSummary(requestId);
          if (summary) {
            console.log(chalk.gray(`Approvals: ${summary.approved}/${summary.required}`));
          }
        }
      } else {
        spinner.fail(chalk.red('Failed to sign request'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to sign request'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('reject')
  .description('Reject an approval request')
  .argument('<request-id>', 'Request ID to reject')
  .argument('<signer>', 'Signer name')
  .option('--reason <text>', 'Rejection reason')
  .action(async (requestId, signer, options) => {
    const spinner = ora(`Rejecting request ${requestId}...`).start();

    try {
      const success = rejectApprovalRequest(requestId, signer, options.reason);

      if (success) {
        spinner.succeed(chalk.green(`Request rejected by ${signer}`));
      } else {
        spinner.fail(chalk.red('Failed to reject request'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to reject request'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('pending')
  .description('List pending approvals for a signer')
  .argument('<signer>', 'Signer name')
  .action(async (signer) => {
    const spinner = ora(`Loading pending approvals for ${signer}...`).start();

    try {
      const requests = listPendingApprovals(signer);

      spinner.succeed(chalk.green(`Found ${requests.length} pending request(s)`));

      if (requests.length === 0) {
        console.log(chalk.gray('No pending requests'));
        return;
      }

      for (const req of requests) {
        console.log(`\n${chalk.bold(req.id)}`);
        console.log(`  Type: ${req.type}`);
        console.log(`  Agent: ${req.agentName}`);
        console.log(`  Description: ${req.description}`);
        console.log(`  Required: ${req.requiredApprovals}`);
        console.log(`  Current: ${req.approvals.length}`);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to list pending approvals'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('delete')
  .description('Delete an approval request')
  .argument('<request-id>', 'Request ID to delete')
  .action(async (requestId) => {
    const spinner = ora(`Deleting request ${requestId}...`).start();

    try {
      const success = deleteApprovalRequest(requestId);

      if (success) {
        spinner.succeed(chalk.green(`Request deleted: ${requestId}`));
      } else {
        spinner.fail(chalk.red('Failed to delete request'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to delete request'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

approveCmd
  .command('cleanup')
  .description('Clean up expired requests')
  .action(async () => {
    const spinner = ora('Cleaning up expired requests...').start();

    try {
      const cleaned = cleanupExpiredRequests();

      if (cleaned > 0) {
        spinner.succeed(chalk.green(`Marked ${cleaned} expired request(s)`));
      } else {
        spinner.info(chalk.gray('No expired requests to clean'));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to cleanup'));
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

export { approveCmd };
