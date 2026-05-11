export type CmsProvider = 'github' | 'gitlab'

export interface CmsConfig {
  provider: CmsProvider
  token: string
  owner: string
  repo: string
  gitlabBaseUrl: string
}

export const DEFAULT_CMS_CONFIG: CmsConfig = {
  provider: 'github',
  token: '',
  owner: '',
  repo: '',
  gitlabBaseUrl: 'https://gitlab.com'
}

export interface ReleaseAsset {
  id: string
  name: string
  size: number
  downloadUrl: string
  contentType: string
  downloadCount: number
}

export interface Release {
  id: string
  tagName: string
  name: string
  body: string
  isDraft: boolean
  isPrerelease: boolean
  createdAt: string
  assets: ReleaseAsset[]
}

export interface CreateReleaseInput {
  tagName: string
  name: string
  body: string
  isDraft: boolean
  isPrerelease: boolean
}

export interface CmsResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
