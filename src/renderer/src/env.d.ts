/// <reference types="vite/client" />

import type { UpdateCheckResponse, UpdateStatusEvent } from '../../shared/types'
import type { CmsConfig, CreateReleaseInput, CmsResult, Release, ReleaseAsset } from '../../shared/cms-types'

interface ElectronAPI {
  // Auto-update
  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<UpdateCheckResponse>
  downloadUpdate: () => void
  installAndRestart: () => void
  onUpdateStatus: (callback: (event: UpdateStatusEvent) => void) => () => void

  // CMS
  cmsGetConfig: () => Promise<CmsConfig>
  cmsSaveConfig: (config: CmsConfig) => Promise<CmsResult>
  cmsListReleases: (config: CmsConfig) => Promise<CmsResult<Release[]>>
  cmsCreateRelease: (config: CmsConfig, input: CreateReleaseInput) => Promise<CmsResult<Release>>
  cmsPickFile: () => Promise<string | null>
  cmsUploadAsset: (config: CmsConfig, releaseId: string, filePath: string) => Promise<CmsResult<ReleaseAsset>>
  cmsDeleteAsset: (config: CmsConfig, releaseId: string, assetId: string) => Promise<CmsResult>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
