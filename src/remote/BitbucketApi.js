import axios from 'axios'

export class BitbucketApi {
  constructor(config) {
    if (!config.token || !config.workspace || !config.repository) {
      throw new Error('Invalid settings please use config command')
    }

    this._api = axios.create({
      baseURL: `https://api.bitbucket.org/2.0/repositories/${config.workspace}/${config.repository}`,
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    })
  }

  async listEnvironments() {
    const { data } = await this._api.get('/environments')
    return data
  }

  async listVariables(environmentId) {
    const { data } = await this._api.get(
      `/deployments_config/environments/${environmentId}/variables`,
      {
        params: {
          page: 1,
          pagelen: 1000,
        },
      }
    )

    return data
  }

  async createVariable(environmentId, variable) {
    const { data } = await this._api.post(
      `/deployments_config/environments/${environmentId}/variables`,
      variable
    )

    return data
  }

  async updateVariable(environmentId, variable) {
    const { data } = await this._api.put(
      `/deployments_config/environments/${environmentId}/variables/${variable.uuid}`,
      variable
    )

    return data
  }

  async deleteVariable(environmentId, variableId) {
    await this._api.delete(
      `/deployments_config/environments/${environmentId}/variables/${variableId}`
    )
  }
}
