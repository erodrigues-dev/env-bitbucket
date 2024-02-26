import { BitbucketApi } from '../remote/BitbucketApi.js';

export class ListEnvironmentsJob {
  constructor(config) {
    this.api = new BitbucketApi(config);
  }

  async execute() {
    const result = await this.api.listEnvironments();

    const envs = result.values
      .map((env) => ({
        name: env.name,
        uuid: env.uuid,
      }))
      .sort((a, b) => (a.name < b.name ? -1 : 1));

    for (const env of envs) {
      console.log(`------------------`);
      console.log(`Name: ${env.name}`);
      console.log(`Uuid: ${env.uuid}`);
    }
  }
}
