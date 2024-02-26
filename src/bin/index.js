#! /usr/bin/env node
import { program } from 'commander';
import { ListEnvironmentsJob } from '../jobs/ListEnvironments.js';
import { SetConfiguration } from '../jobs/SetConfigurations.js';
import { UpdateEnvironmentJob } from '../jobs/UpdateEnvironment.js';
import { getConfig } from '../config/config.js';

program.description(`
  # Bitbucket Environment CLI

  You need call config before use this cli
`);

program
  .command('config')
  .description('Set configurations for Bitbucket')
  .requiredOption('-w, --workspace <VALUE>', 'Set bitbucket workspace')
  .requiredOption('-r, --repository <VALUE>', 'Set bitbucket repository name')
  .requiredOption('-t, --token <VALUE>', 'Set bitbucket token')
  .action(async (opts) => {
    await new SetConfiguration().execute(opts);
  });

program
  .command('list:envs')
  .description('List environments')
  .action(async () => {
    console.log('\nList environments wait...\n');
    const config = await getConfig();
    await new ListEnvironmentsJob(config).execute();
  });

program
  .command('update:env')
  .description('Update environment')
  .requiredOption('--id <VALUE>', 'Environment UUID')
  .requiredOption('--env-file <VALUE>', 'Path do env file')
  .action(async (opts) => {
    console.log('\nUpdate Environments wait...\n');
    const config = await getConfig();
    await new UpdateEnvironmentJob(config).execute(opts);
  });

program.parse();
