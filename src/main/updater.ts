import { app, BrowserWindow } from 'electron'
import { autoUpdater, UpdateCheckResult } from 'electron-updater'
import { loadCmsConfig } from './cms-storage'
import type { UpdateStatus, UpdateCheckResponse, DownloadProgressInfo } from '../shared/types'

function sendStatus(win: BrowserWindow, status: UpdateStatus, payload?: object): void {
  if (win.isDestroyed()) return
  win.webContents.send('update-status', { status, ...payload })
}

// For private GitLab repos, inject the stored token as a request header so
// electron-updater can download latest.yml and the installer without 401.
function applyGitLabAuth(): void {
  try {
    const cfg = loadCmsConfig()
    if (cfg.provider === 'gitlab' && cfg.token) {
      autoUpdater.requestHeaders = { 'PRIVATE-TOKEN': cfg.token }
    }
  } catch {
    // No stored config — public repo or GitHub, skip
  }
}

export function initAutoUpdater(win: BrowserWindow): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  applyGitLabAuth()

  autoUpdater.on('checking-for-update', () => {
    sendStatus(win, 'checking')
  })

  autoUpdater.on('update-available', (info) => {
    sendStatus(win, 'available', {
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : ''
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendStatus(win, 'not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    const p: DownloadProgressInfo = {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    }
    sendStatus(win, 'downloading', { progress: p })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus(win, 'ready', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    sendStatus(win, 'error', { error: err.message })
  })
}

export async function checkForUpdates(): Promise<UpdateCheckResponse> {
  if (!app.isPackaged) {
    return { status: 'not-available' }
  }
  try {
    const result: UpdateCheckResult | null = await autoUpdater.checkForUpdates()
    if (!result) return { status: 'not-available' }
    return { status: 'checking' }
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate()
}

export function installAndRestart(): void {
  autoUpdater.quitAndInstall(false, true)
}
