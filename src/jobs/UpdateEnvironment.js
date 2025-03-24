import fs from 'node:fs';
import readline from 'node:readline';

import { BitbucketApi } from '../remote/BitbucketApi.js';

export class UpdateEnvironmentJob {
  constructor(config) {
    this.api = new BitbucketApi(config);
  }

  get ignoredVariables() {
    return [
      'NODE_ENV',
      'K8S_APP_NAME',
      'K8S_CLUSTER_NAME',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
    ];
  }

  execute({ id, envFile }) {
    return new Promise((resolve) => {
      const file = readline.createInterface({
        input: fs.createReadStream(envFile),
      });

      const toUpdateVariables = [];

      file.on('line', async (line) => {
        if (!this._lineIsValid(line)) return;
        const env = this._getVariableForLine(line);
        if (env && !this.ignoredVariables.includes(env.key)) {
          toUpdateVariables.push(env);
        }
      });

      file.on('close', async () => {
        await this._executeJob(id, toUpdateVariables);
        resolve();
      });
    });
  }

  async _executeJob(envId, toUpdateVariables) {
    const { values: bitbucketVariables } = await this.api.listVariables(envId);
    const toDeleteEnvs = this._getDeletedVariables(
      bitbucketVariables,
      toUpdateVariables
    );

    this._logHeader('Update Variables');

    if (toUpdateVariables.length === 0) {
      console.log('\nNo variables to update\n\n');
    }

    for (const variable of toUpdateVariables) {
      console.log(`\n------${variable.key}-------`);
      await this._createOrUpdateVariable(envId, variable, bitbucketVariables);
    }

    this._logHeader('Delete ENVs');

    if (toDeleteEnvs.length === 0) {
      console.log('\nNo ENVs to delete\n\n');
    }

    for (const variable of toDeleteEnvs) {
      console.log(`\n------${variable.key}-------`);
      await this._deleteVariable(envId, variable);
    }

    console.log('\n---------------------------------\n');
  }

  async _createOrUpdateVariable(envId, variable, source) {
    try {
      console.log(`Processing key: ${variable.key}`);

      const sourceVariable = source.find((x) => x.key === variable.key);

      if (!sourceVariable) {
        const created = await this.api.createVariable(envId, {
          type: 'pipeline_variable',
          secured: false,
          ...variable,
        });

        console.log('Result: created variable', created.uuid);
      } else if (String(sourceVariable.value) !== String(variable.value)) {
        const updated = await this.api.updateVariable(envId, {
          ...sourceVariable,
          ...variable,
        });

        console.log('Result: updated variable', updated.uuid);
      } else {
        console.log(`Result: Is already updated`);
      }
    } catch (error) {
      console.log(
        `Result: Error`,
        error.response?.data?.error?.detail || error.message
      );
    }
  }

  async _deleteVariable(envId, variable) {
    try {
      await this.api.deleteVariable(envId, variable.uuid);
      console.log('Result: deleted');
    } catch (error) {
      console.log(
        `Result: Error`,
        error.response?.data?.error?.detail || error.message
      );
    }
  }

  _getDeletedVariables(source, received) {
    const receivedKeys = received.map((env) => env.key);
    return source.filter(
      (env) =>
        !receivedKeys.includes(env.key) &&
        !this.ignoredVariables.includes(env.key)
    );
  }

  _lineIsValid(line) {
    return (
      Boolean(line.trim()) &&
      !line.startsWith('#') &&
      line.split('=').length >= 2
    );
  }

  _getVariableForLine(line) {
    const index = line.indexOf('=');

    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();

    if (!String(key) || !String(value)) return null;

    return {
      key,
      value,
    };
  }

  _logHeader(header) {
    const pad = '-'.repeat(10);
    const length = '-'.repeat(header.length);
    console.log('\n');
    console.log(`${pad}-${length}-${pad}`);
    console.log(`${pad} ${header} ${pad}`);
    console.log(`${pad}-${length}-${pad}`);
    console.log('\n');
  }
}
