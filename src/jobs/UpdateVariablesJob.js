import fs from 'node:fs';
import readline from 'node:readline';

import { BitbucketApi } from '../remote/BitbucketApi.js';

export class UpdateVariableJob {
  constructor({ environmentId, envFilePath }) {
    if (!environmentId) throw new Error('environmentId is required');
    if (!envFilePath) throw new Error('envFilePath is required');

    this.environmentId = environmentId;
    this.envFilePath = envFilePath;
    this.api = new BitbucketApi();
  }

  get ignoredEnvs() {
    return [
      'NODE_ENV',
      'K8S_CLUSTER_NAME',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
    ];
  }

  execute() {
    return new Promise((resolve) => {
      const file = readline.createInterface({
        input: fs.createReadStream(this.envFilePath),
      });

      const toUpdateEnvs = [];

      file.on('line', async (line) => {
        if (!this._lineIsValid(line)) return;
        const env = this._getEnvForLine(line);
        if (env && !this.ignoredEnvs.includes(env.key)) {
          toUpdateEnvs.push(env);
        }
      });

      file.on('close', async () => {
        await this._executeJob(toUpdateEnvs);
        resolve();
      });
    });
  }

  async _executeJob(toUpdateEnvs) {
    const { values: bitbucketEnvs } = await this.api.listVariables(
      this.environmentId
    );
    const toDeleteEnvs = this._getDeletedEnvs(bitbucketEnvs, toUpdateEnvs);

    this._logHeader('Update ENVs');

    if (toUpdateEnvs.length === 0) {
      console.log('\nNo ENVs to update\n\n');
    }

    for (const env of toUpdateEnvs) {
      console.log(`\n------${env.key}-------`);
      await this._createOrUpdateEnv(env, bitbucketEnvs);
    }

    this._logHeader('Delete ENVs');

    if (toDeleteEnvs.length === 0) {
      console.log('\nNo ENVs to delete\n\n');
    }

    for (const env of toDeleteEnvs) {
      console.log(`\n------${env.key}-------`);
      await this._deleteEnv(env);
    }

    console.log('\n#################################\n');
  }

  async _createOrUpdateEnv(env, source) {
    try {
      console.log(`Processing key: ${env.key}`);

      const sourceEnv = source.find((x) => x.key === env.key);

      if (!sourceEnv) {
        const created = await this.api.createVariable(this.environmentId, {
          type: 'pipeline_variable',
          secured: false,
          ...env,
        });

        console.log('Result: created variable', created.uuid);
      } else if (String(sourceEnv.value) !== String(env.value)) {
        const updated = await this.api.updateVariable(this.environmentId, {
          ...sourceEnv,
          ...env,
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

  async _deleteEnv(env) {
    try {
      await this.api.deleteVariable(this.environmentId, env.uuid);
      console.log('Result: deleted');
    } catch (error) {
      console.log(
        `Result: Error`,
        error.response?.data?.error?.detail || error.message
      );
    }
  }

  _getDeletedEnvs(source, received) {
    const receivedKeys = received.map((env) => env.key);
    return source.filter(
      (env) =>
        !receivedKeys.includes(env.key) && !this.ignoredEnvs.includes(env.key)
    );
  }

  _lineIsValid(line) {
    return (
      Boolean(line.trim()) &&
      !line.startsWith('#') &&
      line.split('=').length === 2
    );
  }

  _getEnvForLine(line) {
    const [key, value] = line.split('=').map((p) => p.trim());

    if (!String(key) || !String(value)) return null;

    return {
      key,
      value,
    };
  }

  _logHeader(header) {
    const pad = '#'.repeat(10);
    const length = '#'.repeat(header.length);
    console.log('\n');
    console.log(`${pad}#${length}#${pad}`);
    console.log(`${pad} ${header} ${pad}`);
    console.log(`${pad}#${length}#${pad}`);
    console.log('\n');
  }
}
