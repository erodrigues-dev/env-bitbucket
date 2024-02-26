import 'dotenv/config.js';
import { BitbucketApi } from '../remote/BitbucketApi.js';

const api = new BitbucketApi();

const envs = await api.listEnvironments();

for (const env of envs.values) {
  console.log(`------------------`);
  console.log(`Name: ${env.name}`);
  console.log(`uuid: ${env.uuid}`);
}
