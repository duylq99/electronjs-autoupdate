#!/usr/bin/env node
/**
 * Upload electron-builder artifacts to GitLab Generic Package Registry.
 *
 * Required env vars:
 *   GITLAB_PROJECT_ID  — numeric project ID (find in Project → Settings → General)
 *   GITLAB_TOKEN       — personal access token with api + write_registry scopes
 *
 * Optional:
 *   GITLAB_BASE_URL    — default https://gitlab.com  (for self-hosted)
 *
 * Usage:
 *   node scripts/publish-gitlab.mjs
 *
 * Run AFTER electron-builder completes (npm run build → then this script).
 * Or chain: npm run dist:gitlab
 */

import { readFileSync, createReadStream, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'
import * as https from 'https'
import * as http from 'http'

// ── Config ───────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.GITLAB_PROJECT_ID
const TOKEN = process.env.GITLAB_TOKEN
const BASE_URL = (process.env.GITLAB_BASE_URL || 'https://gitlab.com').replace(/\/$/, '')

if (!PROJECT_ID || !TOKEN) {
  console.error('❌  GITLAB_PROJECT_ID and GITLAB_TOKEN are required.')
  process.exit(1)
}

// Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const version = pkg.version
const releaseDir = join('release', version)

// ── Helpers ──────────────────────────────────────────────────────────────────

function uploadFile(filePath, packageVersion = 'latest') {
  const name = basename(filePath)
  const url = `${BASE_URL}/api/v4/projects/${PROJECT_ID}/packages/generic/electron-releases/${packageVersion}/${encodeURIComponent(name)}`
  const stat = statSync(filePath)

  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'PUT',
        headers: {
          'PRIVATE-TOKEN': TOKEN,
          'Content-Type': 'application/octet-stream',
          'Content-Length': stat.size
        }
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8')
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ name, status: res.statusCode })
          } else {
            reject(new Error(`HTTP ${res.statusCode} uploading ${name}: ${body.slice(0, 200)}`))
          }
        })
      }
    )
    req.on('error', reject)
    createReadStream(filePath).pipe(req)
  })
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Files to upload: latest.yml + all installers (exe, dmg, AppImage)
const UPLOAD_EXTENSIONS = ['.exe', '.dmg', '.AppImage', '.yml', '.yaml', '.blockmap']

let files
try {
  files = readdirSync(releaseDir)
    .filter((f) => UPLOAD_EXTENSIONS.some((ext) => f.endsWith(ext)))
    .filter((f) => !f.startsWith('builder-'))
    .map((f) => join(releaseDir, f))
} catch {
  console.error(`❌  Release directory not found: ${releaseDir}`)
  console.error('   Run "npm run build" first.')
  process.exit(1)
}

if (files.length === 0) {
  console.error(`❌  No artifacts found in ${releaseDir}`)
  process.exit(1)
}

console.log(`\n📦  Publishing v${version} → GitLab project ${PROJECT_ID}`)
console.log(`🔗  ${BASE_URL}/api/v4/projects/${PROJECT_ID}/packages/generic/electron-releases/latest/\n`)

for (const file of files) {
  process.stdout.write(`   Uploading ${basename(file)}… `)
  try {
    // Upload to both "latest" slot (for electron-updater) and versioned slot (for history)
    await uploadFile(file, 'latest')
    await uploadFile(file, version)
    console.log('✓')
  } catch (err) {
    console.log('✗')
    console.error(`   ${err.message}`)
    process.exit(1)
  }
}

console.log(`\n✅  Done. electron-updater will check:`)
console.log(`   ${BASE_URL}/api/v4/projects/${PROJECT_ID}/packages/generic/electron-releases/latest/latest.yml\n`)
