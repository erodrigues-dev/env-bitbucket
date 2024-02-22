import 'dotenv/config.js';
import process from 'node:process';

import { BitbucketApi } from '../remote/BitbucketApi.js';

const envId = process.argv[2];
const api = new BitbucketApi();

const result = await api.listVariables(envId);

for (const env of result.values) {
  console.log('-----');
  console.log(`Env: ${env.key}`);
  console.log(`value: ${env.value}`);
  console.log(`uuid: ${env.uuid}`);
}
