import { createReadStream, statSync } from 'fs'
import { basename } from 'path'
import * as https from 'https'
import * as http from 'http'
import type { CmsConfig, Release, ReleaseAsset, CreateReleaseInput, CmsResult } from '../shared/cms-types'

// ── Generic HTTP helper ──────────────────────────────────────────────────────

interface HttpOptions {
  method: string
  url: string
  headers: Record<string, string>
  body?: string | Buffer
}

function httpRequest(opts: HttpOptions): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(opts.url)
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: opts.method,
        headers: opts.headers
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf-8') }))
      }
    )
    req.on('error', reject)
    if (opts.body) req.write(opts.body)
    req.end()
  })
}

// Stream a file directly to an upload endpoint (avoids loading whole file in memory)
function uploadFileStream(
  url: string,
  filePath: string,
  headers: Record<string, string>
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const stat = statSync(filePath)
    const allHeaders = { ...headers, 'Content-Length': String(stat.size) }
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: allHeaders
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf-8') }))
      }
    )
    req.on('error', reject)
    createReadStream(filePath).pipe(req)
  })
}

// ── GitHub provider ──────────────────────────────────────────────────────────

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'electronjs-autoupdate-cms'
  }
}

function normalizeGithubRelease(r: Record<string, unknown>): Release {
  const assets = ((r.assets as Record<string, unknown>[]) ?? []).map((a) => ({
    id: String(a.id),
    name: String(a.name),
    size: Number(a.size),
    downloadUrl: String(a.browser_download_url),
    contentType: String(a.content_type),
    downloadCount: Number(a.download_count)
  }))
  return {
    id: String(r.id),
    tagName: String(r.tag_name),
    name: String(r.name ?? r.tag_name),
    body: String(r.body ?? ''),
    isDraft: Boolean(r.draft),
    isPrerelease: Boolean(r.prerelease),
    createdAt: String(r.created_at),
    assets
  }
}

async function githubListReleases(cfg: CmsConfig): Promise<CmsResult<Release[]>> {
  try {
    const res = await httpRequest({
      method: 'GET',
      url: `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/releases?per_page=20`,
      headers: githubHeaders(cfg.token)
    })
    if (res.status !== 200) {
      return { success: false, error: `GitHub API error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true, data: JSON.parse(res.body).map(normalizeGithubRelease) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

async function githubCreateRelease(cfg: CmsConfig, input: CreateReleaseInput): Promise<CmsResult<Release>> {
  try {
    const body = JSON.stringify({
      tag_name: input.tagName,
      name: input.name,
      body: input.body,
      draft: input.isDraft,
      prerelease: input.isPrerelease
    })
    const res = await httpRequest({
      method: 'POST',
      url: `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/releases`,
      headers: { ...githubHeaders(cfg.token), 'Content-Type': 'application/json' },
      body
    })
    if (res.status !== 201) {
      return { success: false, error: `GitHub API error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true, data: normalizeGithubRelease(JSON.parse(res.body)) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

async function githubUploadAsset(cfg: CmsConfig, releaseId: string, filePath: string): Promise<CmsResult<ReleaseAsset>> {
  try {
    const name = encodeURIComponent(basename(filePath))
    const url = `https://uploads.github.com/repos/${cfg.owner}/${cfg.repo}/releases/${releaseId}/assets?name=${name}`
    const res = await uploadFileStream(url, filePath, {
      ...githubHeaders(cfg.token),
      'Content-Type': 'application/octet-stream'
    })
    if (res.status !== 201) {
      return { success: false, error: `Upload error ${res.status}: ${parseError(res.body)}` }
    }
    const a = JSON.parse(res.body)
    return {
      success: true,
      data: {
        id: String(a.id),
        name: String(a.name),
        size: Number(a.size),
        downloadUrl: String(a.browser_download_url),
        contentType: String(a.content_type),
        downloadCount: 0
      }
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

async function githubDeleteAsset(cfg: CmsConfig, assetId: string): Promise<CmsResult> {
  try {
    const res = await httpRequest({
      method: 'DELETE',
      url: `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/releases/assets/${assetId}`,
      headers: githubHeaders(cfg.token)
    })
    if (res.status !== 204) {
      return { success: false, error: `Delete error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ── GitLab provider ──────────────────────────────────────────────────────────

function gitlabHeaders(token: string): Record<string, string> {
  return {
    'PRIVATE-TOKEN': token,
    'User-Agent': 'electronjs-autoupdate-cms'
  }
}

function gitlabProjectId(cfg: CmsConfig): string {
  return encodeURIComponent(`${cfg.owner}/${cfg.repo}`)
}

function normalizeGitlabRelease(r: Record<string, unknown>): Release {
  const links = ((r.assets as Record<string, unknown>)?.links as Record<string, unknown>[]) ?? []
  const sources = ((r.assets as Record<string, unknown>)?.sources as Record<string, unknown>[]) ?? []
  const allAssets: ReleaseAsset[] = [
    ...links.map((l) => ({
      id: String(l.id),
      name: String(l.name),
      size: 0,
      downloadUrl: String(l.url),
      contentType: String(l.link_type ?? 'other'),
      downloadCount: 0
    })),
    ...sources.map((s) => ({
      id: `source-${s.format}`,
      name: `Source (${s.format})`,
      size: 0,
      downloadUrl: String(s.url),
      contentType: 'application/zip',
      downloadCount: 0
    }))
  ]
  return {
    id: String(r.tag_name),
    tagName: String(r.tag_name),
    name: String(r.name ?? r.tag_name),
    body: String(r.description ?? ''),
    isDraft: false,
    isPrerelease: false,
    createdAt: String(r.created_at),
    assets: allAssets
  }
}

async function gitlabListReleases(cfg: CmsConfig): Promise<CmsResult<Release[]>> {
  try {
    const pid = gitlabProjectId(cfg)
    const res = await httpRequest({
      method: 'GET',
      url: `${cfg.gitlabBaseUrl}/api/v4/projects/${pid}/releases?per_page=20`,
      headers: gitlabHeaders(cfg.token)
    })
    if (res.status !== 200) {
      return { success: false, error: `GitLab API error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true, data: JSON.parse(res.body).map(normalizeGitlabRelease) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

async function gitlabCreateRelease(cfg: CmsConfig, input: CreateReleaseInput): Promise<CmsResult<Release>> {
  try {
    const pid = gitlabProjectId(cfg)
    const body = JSON.stringify({
      tag_name: input.tagName,
      name: input.name,
      description: input.body
    })
    const res = await httpRequest({
      method: 'POST',
      url: `${cfg.gitlabBaseUrl}/api/v4/projects/${pid}/releases`,
      headers: { ...gitlabHeaders(cfg.token), 'Content-Type': 'application/json' },
      body
    })
    if (res.status !== 201 && res.status !== 200) {
      return { success: false, error: `GitLab API error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true, data: normalizeGitlabRelease(JSON.parse(res.body)) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// GitLab: upload to Generic Package Registry, then create a release link
async function gitlabUploadAsset(cfg: CmsConfig, releaseTag: string, filePath: string): Promise<CmsResult<ReleaseAsset>> {
  try {
    const pid = gitlabProjectId(cfg)
    const fileName = basename(filePath)
    const packageName = cfg.repo
    const version = releaseTag.replace(/^v/, '')

    // Upload via Generic Package Registry
    const uploadUrl = `${cfg.gitlabBaseUrl}/api/v4/projects/${pid}/packages/generic/${packageName}/${version}/${encodeURIComponent(fileName)}`
    const uploadRes = await uploadFileStream(uploadUrl, filePath, {
      ...gitlabHeaders(cfg.token),
      'Content-Type': 'application/octet-stream'
    })
    if (uploadRes.status !== 201 && uploadRes.status !== 200) {
      return { success: false, error: `Upload error ${uploadRes.status}: ${parseError(uploadRes.body)}` }
    }

    const downloadUrl = `${cfg.gitlabBaseUrl}/${cfg.owner}/${cfg.repo}/-/package_files/${packageName}/${version}/${fileName}`

    // Create release link
    const linkBody = JSON.stringify({ name: fileName, url: downloadUrl, link_type: 'package' })
    const linkRes = await httpRequest({
      method: 'POST',
      url: `${cfg.gitlabBaseUrl}/api/v4/projects/${pid}/releases/${releaseTag}/assets/links`,
      headers: { ...gitlabHeaders(cfg.token), 'Content-Type': 'application/json' },
      body: linkBody
    })
    if (linkRes.status !== 201 && linkRes.status !== 200) {
      return { success: false, error: `Link error ${linkRes.status}: ${parseError(linkRes.body)}` }
    }
    const link = JSON.parse(linkRes.body)
    return {
      success: true,
      data: {
        id: String(link.id),
        name: fileName,
        size: statSync(filePath).size,
        downloadUrl: String(link.url),
        contentType: 'application/octet-stream',
        downloadCount: 0
      }
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

async function gitlabDeleteAsset(cfg: CmsConfig, releaseTag: string, assetId: string): Promise<CmsResult> {
  try {
    const pid = gitlabProjectId(cfg)
    const res = await httpRequest({
      method: 'DELETE',
      url: `${cfg.gitlabBaseUrl}/api/v4/projects/${pid}/releases/${releaseTag}/assets/links/${assetId}`,
      headers: gitlabHeaders(cfg.token)
    })
    if (res.status !== 200 && res.status !== 204) {
      return { success: false, error: `Delete error ${res.status}: ${parseError(res.body)}` }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ── Public router ────────────────────────────────────────────────────────────

function parseError(body: string): string {
  try {
    const j = JSON.parse(body)
    return j.message ?? j.error ?? body.slice(0, 120)
  } catch {
    return body.slice(0, 120)
  }
}

export async function cmsListReleases(cfg: CmsConfig): Promise<CmsResult<Release[]>> {
  return cfg.provider === 'github' ? githubListReleases(cfg) : gitlabListReleases(cfg)
}

export async function cmsCreateRelease(cfg: CmsConfig, input: CreateReleaseInput): Promise<CmsResult<Release>> {
  return cfg.provider === 'github' ? githubCreateRelease(cfg, input) : gitlabCreateRelease(cfg, input)
}

export async function cmsUploadAsset(cfg: CmsConfig, releaseId: string, filePath: string): Promise<CmsResult<ReleaseAsset>> {
  return cfg.provider === 'github'
    ? githubUploadAsset(cfg, releaseId, filePath)
    : gitlabUploadAsset(cfg, releaseId, filePath)
}

export async function cmsDeleteAsset(cfg: CmsConfig, releaseId: string, assetId: string): Promise<CmsResult> {
  return cfg.provider === 'github'
    ? githubDeleteAsset(cfg, assetId)
    : gitlabDeleteAsset(cfg, releaseId, assetId)
}
