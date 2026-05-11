import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { CmsConfig } from '../shared/cms-types'
import { DEFAULT_CMS_CONFIG } from '../shared/cms-types'

function configPath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'cms-config.json')
}

export function loadCmsConfig(): CmsConfig {
  try {
    const raw = readFileSync(configPath(), 'utf-8')
    return { ...DEFAULT_CMS_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CMS_CONFIG }
  }
}

export function saveCmsConfig(config: CmsConfig): void {
  writeFileSync(configPath(), JSON.stringify(config, null, 2), 'utf-8')
}
