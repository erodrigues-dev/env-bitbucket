import process from 'node:process'
import fs from 'node:fs'

export function readCurrentPackageJson() {
  const cwd = process.cwd()
  const path = `${cwd}/package.json`
  const existPackageJson = fs.existsSync(path)

  if (!existPackageJson) {
    return null
  }

  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}
