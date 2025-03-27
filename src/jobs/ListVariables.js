import { BitbucketApi } from '../remote/BitbucketApi.js'

export class ListVariablesJob {
  constructor(config) {
    this.api = new BitbucketApi(config)
  }

  async execute(environmentId) {
    try {
      const { values } = await this.api.listVariables(environmentId)

      for (const variable of values) {
        console.log(`${variable.key}=${variable.value}`)
      }
    } catch (error) {
      console.error(
        'Error on list variables',
        error.response?.data?.error?.message || error.message
      )
    }
  }
}
