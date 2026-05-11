export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'

export interface DownloadProgressInfo {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

export interface UpdateCheckResponse {
  status: UpdateStatus
  version?: string
  releaseNotes?: string
  error?: string
}

export interface UpdateStatusEvent {
  status: UpdateStatus
  version?: string
  releaseNotes?: string
  progress?: DownloadProgressInfo
  error?: string
}
