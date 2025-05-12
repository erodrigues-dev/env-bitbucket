import fs from 'node:fs'

export function backupEnvironment({ originalEnvs, originalEnvFile, envId }) {
  const content = [
    '# Created by evb-cli',
    `# Environment: ${envId}`,
    `# Date: ${new Date().toISOString()}`,
    '# ------------------------------',
    ...originalEnvs.map(({ key, value }) => `${key}=${value}`),
  ].join('\n')

  fs.writeFileSync(`${originalEnvFile}.bkp`, content, 'utf8')
}
