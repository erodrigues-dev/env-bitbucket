import { updateConfig } from '../config/config.js'

export class SetConfiguration {
  async execute({ token, workspace, repository }) {
    const config = {
      token,
      workspace,
      repository,
    }

    updateConfig(config)
  }
}
