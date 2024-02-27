import { BitbucketApi } from '../remote/BitbucketApi.js';

export class ListVariablesJob {
  constructor(config) {
    this.api = new BitbucketApi(config);
  }

  async execute(environmentId) {
    const { values } = await this.api.listVariables(environmentId);

    for (const variable of values) {
      console.log(`${variable.key}=${variable.value}`);
    }
  }
}
