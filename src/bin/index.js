#! /usr/bin/env node
import { program } from 'commander'
import { getConfig } from '../config/config.js'
import { GetConfiguration } from '../jobs/GetConfigurations.js'
import { ListEnvironmentsJob } from '../jobs/ListEnvironments.js'
import { ListVariablesJob } from '../jobs/ListVariables.js'
import { SetConfiguration } from '../jobs/SetConfigurations.js'
import { UpdateEnvironmentJob } from '../jobs/UpdateEnvironment.js'
import { useCurrentProject } from '../jobs/useCurrentProject.js'
import { readInternalPackageJson } from '../utils/readInternalPackageJson.js'

program.description(`
  # Bitbucket Environment CLI

  Alias: evb

  You need call 'config' before use this cli
`)

program
  .command('version')
  .description('Show cli version')
  .alias('v')
  .action(async () => {
    const internal = readInternalPackageJson()
    console.log(`Version: ${internal.version}`)
  })

program
  .command('config')
  .description('Set configurations for Bitbucket')
  .option('-w, --workspace <VALUE>', 'Set bitbucket workspace')
  .option('-r, --repository <VALUE>', 'Set bitbucket repository name')
  .option('-t, --token <VALUE>', 'Set bitbucket token')
  .option('--show [true]', 'Show current configurations')
  .action(async opts => {
    if (opts.show) {
      await new GetConfiguration().execute()
      return
    }

    await new SetConfiguration().execute(opts)
  })

program
  .command('use')
  .description('Set current project name as config repository')
  .action(async () => await useCurrentProject())

program
  .command('env:list')
  .description('List environments')
  .option(
    '--ignore-current-project [true]',
    'Ignore current project validation'
  )
  .action(async opts => {
    const config = await getConfig()
    await new ListEnvironmentsJob(config).execute(opts)
  })

program
  .command('env:list:variables <environmentId>')
  .description('List environment variables')
  .option(
    '--ignore-current-project [true]',
    'Ignore current project validation'
  )
  .action(async (environmentId, opts) => {
    const config = await getConfig()
    await new ListVariablesJob(config).execute({ environmentId, ...opts })
  })

program
  .command('env:update')
  .description('Update environment')
  .requiredOption('--id <VALUE>', 'Environment UUID')
  .requiredOption('--env-file <VALUE>', 'Path do env file')
  .option('--ignore-bkp [true]', 'Backup current environment')
  .option(
    '--ignore-current-project [true]',
    'Ignore current project validation'
  )
  .action(async opts => {
    const config = await getConfig()
    await new UpdateEnvironmentJob(config).execute(opts)
  })

program.parse()
