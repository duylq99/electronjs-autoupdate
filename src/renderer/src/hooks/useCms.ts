import { useState, useCallback } from 'react'
import type { CmsConfig, Release, CreateReleaseInput } from '../../../shared/cms-types'
import { DEFAULT_CMS_CONFIG } from '../../../shared/cms-types'

type CmsView = 'config' | 'releases' | 'create-release'

interface CmsState {
  config: CmsConfig
  view: CmsView
  releases: Release[]
  selectedRelease: Release | null
  loading: boolean
  error: string | null
  successMsg: string | null
}

export function useCms() {
  const api = window.electronAPI

  const [state, setState] = useState<CmsState>({
    config: DEFAULT_CMS_CONFIG,
    view: 'config',
    releases: [],
    selectedRelease: null,
    loading: false,
    error: null,
    successMsg: null
  })

  const setPartial = (patch: Partial<CmsState>) =>
    setState((s) => ({ ...s, ...patch }))

  const clearMessages = () => setPartial({ error: null, successMsg: null })

  // ── Config ──────────────────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    if (!api) return
    const cfg = await api.cmsGetConfig()
    setPartial({ config: cfg })
  }, [api])

  const saveConfig = useCallback(async (config: CmsConfig) => {
    if (!api) return
    clearMessages()
    await api.cmsSaveConfig(config)
    setPartial({ config, successMsg: 'Configuration saved.' })
  }, [api])

  // ── Releases ────────────────────────────────────────────────────────────────

  const fetchReleases = useCallback(async (config: CmsConfig) => {
    if (!api) return
    clearMessages()
    setPartial({ loading: true })
    const result = await api.cmsListReleases(config)
    if (result.success) {
      setPartial({ releases: result.data ?? [], loading: false, view: 'releases' })
    } else {
      setPartial({ loading: false, error: result.error ?? 'Failed to fetch releases' })
    }
  }, [api])

  const createRelease = useCallback(async (input: CreateReleaseInput) => {
    if (!api) return
    clearMessages()
    setPartial({ loading: true })
    const result = await api.cmsCreateRelease(state.config, input)
    if (result.success && result.data) {
      setPartial({
        releases: [result.data, ...state.releases],
        loading: false,
        view: 'releases',
        successMsg: `Release "${result.data.name}" created.`
      })
    } else {
      setPartial({ loading: false, error: result.error ?? 'Failed to create release' })
    }
  }, [api, state.config, state.releases])

  // ── Assets ──────────────────────────────────────────────────────────────────

  const uploadAsset = useCallback(async (release: Release) => {
    if (!api) return
    clearMessages()
    const filePath = await api.cmsPickFile()
    if (!filePath) return

    setPartial({ loading: true })
    const result = await api.cmsUploadAsset(state.config, release.id, filePath)
    if (result.success && result.data) {
      const updated = state.releases.map((r) =>
        r.id === release.id ? { ...r, assets: [...r.assets, result.data!] } : r
      )
      setPartial({
        releases: updated,
        selectedRelease: { ...release, assets: [...release.assets, result.data] },
        loading: false,
        successMsg: `"${result.data.name}" uploaded successfully.`
      })
    } else {
      setPartial({ loading: false, error: result.error ?? 'Upload failed' })
    }
  }, [api, state.config, state.releases])

  const deleteAsset = useCallback(async (release: Release, assetId: string) => {
    if (!api) return
    clearMessages()
    setPartial({ loading: true })
    const result = await api.cmsDeleteAsset(state.config, release.id, assetId)
    if (result.success) {
      const updatedAssets = release.assets.filter((a) => a.id !== assetId)
      const updated = state.releases.map((r) =>
        r.id === release.id ? { ...r, assets: updatedAssets } : r
      )
      setPartial({
        releases: updated,
        selectedRelease: { ...release, assets: updatedAssets },
        loading: false,
        successMsg: 'Asset deleted.'
      })
    } else {
      setPartial({ loading: false, error: result.error ?? 'Delete failed' })
    }
  }, [api, state.config, state.releases])

  return {
    ...state,
    loadConfig,
    saveConfig,
    fetchReleases,
    createRelease,
    uploadAsset,
    deleteAsset,
    setView: (view: CmsView) => setPartial({ view }),
    selectRelease: (r: Release | null) => setPartial({ selectedRelease: r }),
    updateConfig: (patch: Partial<CmsConfig>) =>
      setPartial({ config: { ...state.config, ...patch } }),
    clearMessages
  }
}
