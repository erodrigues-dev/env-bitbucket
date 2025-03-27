#! /usr/bin/env node
import { program } from 'commander'
import { ListEnvironmentsJob } from '../jobs/ListEnvironments.js'
import { SetConfiguration } from '../jobs/SetConfigurations.js'
import { UpdateEnvironmentJob } from '../jobs/UpdateEnvironment.js'
import { getConfig } from '../config/config.js'
import { ListVariablesJob } from '../jobs/ListVariables.js'

program.description(`
  # Bitbucket Environment CLI

  You need call config before use this cli
`)

program
  .command('version')
  .description('Show cli version')
  .alias('v')
  .action(async () => {
    const {
      default: { version },
    } = await import('../../package.json', { with: { type: 'json' } })
    console.log(`Version: ${version}`)
  })

program
  .command('config')
  .description('Set configurations for Bitbucket')
  .option('-w, --workspace <VALUE>', 'Set bitbucket workspace')
  .option('-r, --repository <VALUE>', 'Set bitbucket repository name')
  .option('-t, --token <VALUE>', 'Set bitbucket token')
  .action(async opts => {
    await new SetConfiguration().execute(opts)
  })

program
  .command('env:list')
  .description('List environments')
  .action(async () => {
    console.log('\nList environments wait...\n')
    const config = await getConfig()
    await new ListEnvironmentsJob(config).execute()
  })

program
  .command('env:list:variables <environmentId>')
  .description('List environment variables')
  .action(async environmentId => {
    console.log('\nList environment variables wait...\n')
    const config = await getConfig()
    await new ListVariablesJob(config).execute(environmentId)
  })

program
  .command('env:update')
  .description('Update environment')
  .requiredOption('--id <VALUE>', 'Environment UUID')
  .requiredOption('--env-file <VALUE>', 'Path do env file')
  .action(async opts => {
    console.log('\nUpdate Environments wait...\n')
    const config = await getConfig()
    await new UpdateEnvironmentJob(config).execute(opts)
  })

program.parse()
