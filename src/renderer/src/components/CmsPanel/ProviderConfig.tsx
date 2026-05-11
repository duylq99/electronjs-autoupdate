import { useState } from 'react'
import { GitBranch, GitFork, Eye, EyeOff, Plug, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CmsConfig } from '../../../../shared/cms-types'

interface Props {
  config: CmsConfig
  loading: boolean
  onUpdate: (patch: Partial<CmsConfig>) => void
  onSave: (config: CmsConfig) => void
  onConnect: (config: CmsConfig) => void
}

export function ProviderConfig({ config, loading, onUpdate, onSave, onConnect }: Props): JSX.Element {
  const [showToken, setShowToken] = useState(false)
  const isValid = config.token.trim() && config.owner.trim() && config.repo.trim()

  return (
    <div className="max-w-xl">
      <p className="eyebrow text-ink opacity-50 mb-xl">Step 1 — Configure Provider</p>

      {/* Provider toggle */}
      <div className="flex gap-xs mb-xl">
        {(['github', 'gitlab'] as const).map((p) => {
          const Icon = p === 'github' ? GitBranch : GitFork
          return (
            <button
              key={p}
              onClick={() => onUpdate({ provider: p })}
              className={cn(
                'rounded-pill px-lg font-sans text-body-sm font-[480] transition-all',
                'py-[7px] border flex items-center gap-xs',
                config.provider === p
                  ? 'bg-primary text-canvas border-primary'
                  : 'bg-canvas text-ink border-hairline hover:border-ink'
              )}
            >
              <Icon size={14} strokeWidth={1.5} />
              {p === 'github' ? 'GitHub' : 'GitLab'}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-md">
        {/* Token */}
        <div>
          <label className="caption text-ink opacity-50 block mb-xs">
            {config.provider === 'github' ? 'GitHub' : 'GitLab'} Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={config.token}
              onChange={(e) => onUpdate({ token: e.target.value })}
              placeholder={config.provider === 'github' ? 'ghp_...' : 'glpat-...'}
              className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-md top-1/2 -translate-y-1/2 text-ink opacity-40 hover:opacity-80"
            >
              {showToken
                ? <EyeOff size={15} strokeWidth={1.5} />
                : <Eye size={15} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Owner + repo */}
        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="caption text-ink opacity-50 block mb-xs">
              {config.provider === 'github' ? 'Owner (username/org)' : 'Namespace'}
            </label>
            <input
              type="text"
              value={config.owner}
              onChange={(e) => onUpdate({ owner: e.target.value })}
              placeholder="your-username"
              className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div>
            <label className="caption text-ink opacity-50 block mb-xs">Repository</label>
            <input
              type="text"
              value={config.repo}
              onChange={(e) => onUpdate({ repo: e.target.value })}
              placeholder="my-repo"
              className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        </div>

        {/* GitLab base URL */}
        {config.provider === 'gitlab' && (
          <div>
            <label className="caption text-ink opacity-50 block mb-xs">GitLab Base URL</label>
            <input
              type="text"
              value={config.gitlabBaseUrl}
              onChange={(e) => onUpdate({ gitlabBaseUrl: e.target.value })}
              placeholder="https://gitlab.com"
              className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-sm pt-sm">
          <button
            className="btn-primary flex items-center gap-xs"
            disabled={!isValid || loading}
            onClick={() => onConnect(config)}
          >
            <Plug size={14} strokeWidth={2} />
            {loading ? 'Connecting…' : 'Connect & Load Releases'}
          </button>
          <button
            className="btn-secondary flex items-center gap-xs"
            disabled={loading}
            onClick={() => onSave(config)}
          >
            <Save size={14} strokeWidth={1.5} />
            Save Config
          </button>
        </div>
      </div>
    </div>
  )
}
