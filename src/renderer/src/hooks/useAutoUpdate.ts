import { useState, useEffect, useCallback, useRef } from 'react'
import type { UpdateStatus, UpdateStatusEvent, DownloadProgressInfo } from '../../../shared/types'

interface AutoUpdateState {
  status: UpdateStatus
  currentVersion: string
  availableVersion?: string
  releaseNotes?: string
  progress?: DownloadProgressInfo
  error?: string
}

interface AutoUpdateActions {
  checkForUpdates: () => void
  downloadUpdate: () => void
  installAndRestart: () => void
}

const INITIAL_STATE: AutoUpdateState = {
  status: 'idle',
  currentVersion: ''
}

export function useAutoUpdate(): AutoUpdateState & AutoUpdateActions {
  const [state, setState] = useState<AutoUpdateState>(INITIAL_STATE)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    api.getAppVersion().then((version) => {
      setState((s) => ({ ...s, currentVersion: version }))
    })

    const cleanup = api.onUpdateStatus((event: UpdateStatusEvent) => {
      setState((s) => ({
        ...s,
        status: event.status,
        availableVersion: event.version ?? s.availableVersion,
        releaseNotes: event.releaseNotes ?? s.releaseNotes,
        progress: event.progress ?? (event.status === 'downloading' ? s.progress : undefined),
        error: event.error
      }))

      if (event.status !== 'checking') {
        isCheckingRef.current = false
      }
    })

    return cleanup
  }, [])

  const checkForUpdates = useCallback(async () => {
    const api = window.electronAPI
    if (!api || isCheckingRef.current) return

    isCheckingRef.current = true
    setState((s) => ({ ...s, status: 'checking', error: undefined }))

    const result = await api.checkForUpdates()

    if (result.status === 'error') {
      isCheckingRef.current = false
      setState((s) => ({ ...s, status: 'error', error: result.error }))
    } else if (result.status === 'not-available') {
      isCheckingRef.current = false
      setState((s) => ({ ...s, status: 'not-available' }))
    }
  }, [])

  const downloadUpdate = useCallback(() => {
    const api = window.electronAPI
    if (!api) return
    setState((s) => ({ ...s, status: 'downloading', progress: undefined }))
    api.downloadUpdate()
  }, [])

  const installAndRestart = useCallback(() => {
    const api = window.electronAPI
    if (!api) return
    api.installAndRestart()
  }, [])

  return { ...state, checkForUpdates, downloadUpdate, installAndRestart }
}
