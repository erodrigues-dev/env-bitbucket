import { getConfig } from '../config/config.js'

export class GetConfiguration {
  async execute() {
    const config = await getConfig()

    console.log('Current configurations:', config)
  }
}
