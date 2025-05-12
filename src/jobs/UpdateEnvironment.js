import fs from 'node:fs'
import readline from 'node:readline'

import { BitbucketApi } from '../remote/BitbucketApi.js'
import { checkCurrentProject } from './checkCurrentProject.js'
import { backupEnvironment } from '../utils/backupEnvironment.js'
import { IGNORED_VARIABLES } from '../consts/index.js'

export class UpdateEnvironmentJob {
  constructor(config) {
    this.api = new BitbucketApi(config)
  }

  async execute({ id, envFile, ignoreCurrentProject, ignoreBkp }) {
    if (!ignoreCurrentProject) {
      await checkCurrentProject()
    }

    return new Promise(resolve => {
      const file = readline.createInterface({
        input: fs.createReadStream(envFile),
      })

      const toUpdateVariables = []

      file.on('line', async line => {
        if (!this._lineIsValid(line)) return
        const env = this._getVariableForLine(line)
        if (env && !IGNORED_VARIABLES.includes(env.key)) {
          toUpdateVariables.push(env)
        }
      })

      file.on('close', async () => {
        await this._executeJob({
          envId: id,
          toUpdateVariables,
          ignoreBkp,
          envFile,
        })
        resolve()
      })
    })
  }

  async _executeJob({ envId, toUpdateVariables, ignoreBkp, envFile }) {
    try {
      const { values: bitbucketVariables } = await this.api.listVariables(envId)

      if (!ignoreBkp) {
        backupEnvironment({
          originalEnvs: bitbucketVariables,
          originalEnvFile: envFile,
          envId,
        })
      }

      const resume = {}

      for (const variable of toUpdateVariables) {
        const status = await this._createOrUpdateVariable(
          envId,
          variable,
          bitbucketVariables
        )
        resume[variable.key] = status
      }

      const toDeleteEnvs = this._getDeletedVariables(
        bitbucketVariables,
        toUpdateVariables
      )

      for (const variable of toDeleteEnvs) {
        await this._deleteVariable(envId, variable)
        resume[variable.key] = 'deleted'
      }

      console.table(resume)
    } catch (error) {
      console.error(
        'Error on update variables',
        error.response?.data?.error?.message || error.message
      )
    }
  }

  async _createOrUpdateVariable(envId, variable, source) {
    const sourceVariable = source.find(x => x.key === variable.key)

    if (!sourceVariable) {
      await this.api.createVariable(envId, {
        type: 'pipeline_variable',
        secured: false,
        ...variable,
      })

      return 'created'
    } else if (String(sourceVariable.value) !== String(variable.value)) {
      await this.api.updateVariable(envId, {
        ...sourceVariable,
        ...variable,
      })

      return 'updated'
    }

    return 'unchanged'
  }

  async _deleteVariable(envId, variable) {
    await this.api.deleteVariable(envId, variable.uuid)
  }

  _getDeletedVariables(source, received) {
    const receivedKeys = received.map(env => env.key)
    return source.filter(
      env =>
        !receivedKeys.includes(env.key) && !IGNORED_VARIABLES.includes(env.key)
    )
  }

  _lineIsValid(line) {
    return (
      Boolean(line.trim()) &&
      !line.startsWith('#') &&
      line.split('=').length >= 2
    )
  }

  _getVariableForLine(line) {
    const index = line.indexOf('=')

    const key = line.substring(0, index).trim()
    const value = line.substring(index + 1).trim()

    if (!String(key) || !String(value)) return null

    return {
      key,
      value,
    }
  }
}
