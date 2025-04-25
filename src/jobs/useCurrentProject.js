import process from 'node:process'
import { SetConfiguration } from './SetConfigurations.js'
import { readCurrentPackageJson } from '../utils/readCurrentPackageJson.js'

export async function useCurrentProject() {
  const currentPackage = readCurrentPackageJson()

  if (!currentPackage) {
    console.error('No package.json found in the current directory.')
    process.exit(1)
  }

  const { name } = currentPackage

  console.log('Using current project:', name)

  const config = new SetConfiguration()
  await config.execute({ repository: name })
}
