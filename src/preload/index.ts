import { contextBridge, ipcRenderer } from 'electron'
import type { UpdateCheckResponse, UpdateStatusEvent } from '../shared/types'
import type { CmsConfig, CreateReleaseInput, CmsResult, Release, ReleaseAsset } from '../shared/cms-types'

const electronAPI = {
  // ── Auto-update ────────────────────────────────────────────────────────────
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  checkForUpdates: (): Promise<UpdateCheckResponse> => ipcRenderer.invoke('check-for-updates'),

  downloadUpdate: (): void => ipcRenderer.send('download-update'),

  installAndRestart: (): void => ipcRenderer.send('install-and-restart'),

  onUpdateStatus: (callback: (event: UpdateStatusEvent) => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: UpdateStatusEvent): void => callback(data)
    ipcRenderer.on('update-status', listener)
    return () => ipcRenderer.removeListener('update-status', listener)
  },

  // ── CMS ────────────────────────────────────────────────────────────────────
  cmsGetConfig: (): Promise<CmsConfig> => ipcRenderer.invoke('cms:get-config'),

  cmsSaveConfig: (config: CmsConfig): Promise<CmsResult> => ipcRenderer.invoke('cms:save-config', config),

  cmsListReleases: (config: CmsConfig): Promise<CmsResult<Release[]>> =>
    ipcRenderer.invoke('cms:list-releases', config),

  cmsCreateRelease: (config: CmsConfig, input: CreateReleaseInput): Promise<CmsResult<Release>> =>
    ipcRenderer.invoke('cms:create-release', config, input),

  cmsPickFile: (): Promise<string | null> => ipcRenderer.invoke('cms:pick-file'),

  cmsUploadAsset: (config: CmsConfig, releaseId: string, filePath: string): Promise<CmsResult<ReleaseAsset>> =>
    ipcRenderer.invoke('cms:upload-asset', config, releaseId, filePath),

  cmsDeleteAsset: (config: CmsConfig, releaseId: string, assetId: string): Promise<CmsResult> =>
    ipcRenderer.invoke('cms:delete-asset', config, releaseId, assetId)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
