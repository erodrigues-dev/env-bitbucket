import fs from 'node:fs'

export function readInternalPackageJson() {
  const path = new URL('../../package.json', import.meta.url).pathname
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}
