import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', '..', 'config.json')

export const getConfig = async () => {
  try {
    const configJson = await fs.readFile(configPath, 'utf8')
    return JSON.parse(configJson)
  } catch (error) {
    return null
  }
}

export const setConfig = async config => {
  try {
    const content = JSON.stringify(config, null, 2)
    await fs.writeFile(configPath, content, 'utf8')
  } catch (error) {
    return null
  }
}

export const updateConfig = async config => {
  try {
    const currentConfig = await getConfig()

    for (const key of Object.keys(config)) {
      if (config[key]) {
        currentConfig[key] = config[key]
      }
    }

    await setConfig(currentConfig)
  } catch (error) {
    return null
  }
}
