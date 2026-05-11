import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  installAndRestart
} from './updater'
import { loadCmsConfig, saveCmsConfig } from './cms-storage'
import { cmsListReleases, cmsCreateRelease, cmsUploadAsset, cmsDeleteAsset } from './cms-api'
import type { CmsConfig, CreateReleaseInput } from '../shared/cms-types'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (app.isPackaged) {
    initAutoUpdater(mainWindow)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.demo.electronjs-autoupdate')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function registerIpcHandlers(): void {
  ipcMain.handle('get-app-version', () => app.getVersion())

  ipcMain.handle('check-for-updates', () => checkForUpdates())

  ipcMain.on('download-update', () => downloadUpdate())

  ipcMain.on('install-and-restart', () => installAndRestart())

  // CMS handlers
  ipcMain.handle('cms:get-config', () => loadCmsConfig())

  ipcMain.handle('cms:save-config', (_e, config: CmsConfig) => {
    saveCmsConfig(config)
    return { success: true }
  })

  ipcMain.handle('cms:list-releases', (_e, config: CmsConfig) => cmsListReleases(config))

  ipcMain.handle('cms:create-release', (_e, config: CmsConfig, input: CreateReleaseInput) =>
    cmsCreateRelease(config, input)
  )

  ipcMain.handle('cms:pick-file', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Select file to upload',
      properties: ['openFile']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('cms:upload-asset', (_e, config: CmsConfig, releaseId: string, filePath: string) =>
    cmsUploadAsset(config, releaseId, filePath)
  )

  ipcMain.handle('cms:delete-asset', (_e, config: CmsConfig, releaseId: string, assetId: string) =>
    cmsDeleteAsset(config, releaseId, assetId)
  )
}
