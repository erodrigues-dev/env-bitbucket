import { getConfig } from '../config/config.js'
import { readCurrentPackageJson } from '../utils/readCurrentPackageJson.js'

export async function checkCurrentProject() {
  if (Boolean(process.env.EVB_IGNORE_CURRENT_PROJECT)) {
    return
  }

  const currentPackage = readCurrentPackageJson()
  const config = await getConfig()

  if (currentPackage.name !== config.repository) {
    console.error(
      'The current project does not match the configured repository.'
    )

    process.exit(1)
  }
}
