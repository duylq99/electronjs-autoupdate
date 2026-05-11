import { useEffect } from 'react'
import { Settings, Package, PlusCircle, X, ChevronRight, RefreshCw, Tag, AlertTriangle, CheckCircle2, KeyRound, Globe, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCms } from '@/hooks/useCms'
import { ProviderConfig } from './ProviderConfig'
import { CreateReleaseForm } from './CreateReleaseForm'
import { ReleaseDetail } from './ReleaseDetail'
import type { Release } from '../../../../shared/cms-types'

function parseApiError(raw: string): { title: string; detail: string; icon: typeof AlertTriangle } {
  if (/401/.test(raw)) return { title: 'Invalid token', detail: 'The access token was rejected. Check that it is correct and not expired.', icon: KeyRound }
  if (/403/.test(raw)) return { title: 'Permission denied', detail: 'The token does not have sufficient scope to access this repository.', icon: ShieldX }
  if (/404/.test(raw)) return { title: 'Repository not found', detail: 'Check that the owner and repository name are correct, and that the token can access it.', icon: Globe }
  if (/422/.test(raw)) return { title: 'Validation error', detail: raw.replace(/.*?:\s*/, ''), icon: AlertTriangle }
  return { title: 'Request failed', detail: raw, icon: AlertTriangle }
}

function AlertBanner({ message, type, onDismiss }: { message: string; type: 'error' | 'success'; onDismiss: () => void }): JSX.Element {
  if (type === 'success') {
    return (
      <div className="flex items-start gap-md rounded-md border border-block-mint bg-block-mint/40 px-lg py-md mb-xl">
        <CheckCircle2 size={16} strokeWidth={2} className="text-semantic-success mt-[2px] flex-shrink-0" />
        <p className="font-sans text-body-sm font-[400] text-ink flex-1">{message}</p>
        <button onClick={onDismiss} className="flex-shrink-0 text-ink opacity-30 hover:opacity-70 transition-opacity">
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    )
  }

  const { title, detail, icon: Icon } = parseApiError(message)
  return (
    <div className="rounded-md border border-block-coral/60 bg-block-coral/20 px-lg py-md mb-xl">
      <div className="flex items-start justify-between gap-md mb-xs">
        <div className="flex items-center gap-xs">
          <Icon size={15} strokeWidth={2} className="text-accent-magenta flex-shrink-0" />
          <span className="font-sans text-body-sm font-[500] text-ink">{title}</span>
        </div>
        <button onClick={onDismiss} className="flex-shrink-0 text-ink opacity-30 hover:opacity-70 transition-opacity">
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <p className="font-sans text-body-sm font-[320] text-ink opacity-70 pl-[23px]">{detail}</p>
    </div>
  )
}

function ReleaseRow({ release, onClick }: { release: Release; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-lg bg-canvas border border-hairline rounded-md px-lg py-md hover:border-ink/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all text-left group"
    >
      <div className="flex items-center gap-md min-w-0">
        <div className="w-9 h-9 bg-surface-soft rounded-md flex items-center justify-center flex-shrink-0">
          <Tag size={15} strokeWidth={1.5} className="text-ink opacity-60" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-sm">
            <span className="font-sans text-body-sm font-[480] text-ink truncate">{release.name}</span>
            {release.isDraft && (
              <span className="caption bg-surface-soft text-ink opacity-60 px-xs py-[2px] rounded-xs flex-shrink-0">Draft</span>
            )}
            {release.isPrerelease && (
              <span className="caption bg-block-coral/30 text-ink opacity-60 px-xs py-[2px] rounded-xs flex-shrink-0">Pre</span>
            )}
          </div>
          <p className="font-mono text-caption text-ink opacity-40 mt-xxs">
            {release.tagName} · {new Date(release.createdAt).toLocaleDateString()} · {release.assets.length} asset{release.assets.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
    </button>
  )
}

const TABS = [
  { id: 'config' as const,         label: 'Config',       icon: Settings },
  { id: 'releases' as const,       label: 'Releases',     icon: Package },
  { id: 'create-release' as const, label: 'New Release',  icon: PlusCircle }
]

export function CmsPanel(): JSX.Element {
  const cms = useCms()
  const isElectron = !!window.electronAPI

  useEffect(() => {
    if (!isElectron) return
    const init = async () => {
      const api = window.electronAPI!
      const cfg = await api.cmsGetConfig()
      cms.updateConfig(cfg)
      if (cfg.token.trim() && cfg.owner.trim() && cfg.repo.trim()) {
        cms.fetchReleases(cfg)
      }
    }
    init()
  }, [isElectron])

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-lg mb-xxl">
        <div>
          <p className="eyebrow text-ink opacity-50 mb-xs">Release Manager</p>
          <h2
            className="font-sans font-[340] text-ink"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.64px', lineHeight: '1.15' }}
          >
            Manage releases &<br />file assets
          </h2>
        </div>

        {/* Tabs */}
        <div className="hidden md:flex gap-xs flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => cms.setView(id)}
              className={cn(
                'rounded-pill px-lg font-sans text-body-sm font-[480] transition-all py-[7px] border flex items-center gap-xs',
                cms.view === id
                  ? 'bg-primary text-canvas border-primary'
                  : 'bg-canvas text-ink border-hairline hover:border-ink/50'
              )}
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert messages */}
      {cms.error && <AlertBanner message={cms.error} type="error" onDismiss={cms.clearMessages} />}
      {cms.successMsg && <AlertBanner message={cms.successMsg} type="success" onDismiss={cms.clearMessages} />}

      {!isElectron && (
        <p className="caption text-ink opacity-40 mb-xl">Running in browser — Electron IPC not available</p>
      )}

      {/* Views */}
      {cms.view === 'config' && (
        <ProviderConfig
          config={cms.config}
          loading={cms.loading}
          onUpdate={cms.updateConfig}
          onSave={cms.saveConfig}
          onConnect={cms.fetchReleases}
        />
      )}

      {cms.view === 'releases' && !cms.selectedRelease && (
        <div>
          <div className="flex items-center justify-between mb-lg">
            <p className="font-sans text-body font-[320] text-ink opacity-60">
              {cms.releases.length} release{cms.releases.length !== 1 ? 's' : ''} · {cms.config.owner}/{cms.config.repo}
            </p>
            <div className="flex gap-sm">
              <button
                className="btn-secondary flex items-center gap-xs"
                onClick={() => cms.fetchReleases(cms.config)}
                disabled={cms.loading}
                style={{ fontSize: '14px', padding: '5px 14px 7px' }}
              >
                <RefreshCw size={13} strokeWidth={2} className={cms.loading ? 'animate-spin' : ''} />
                {cms.loading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                className="btn-primary flex items-center gap-xs"
                onClick={() => cms.setView('create-release')}
                style={{ fontSize: '14px', padding: '6px 14px' }}
              >
                <PlusCircle size={13} strokeWidth={2} />
                New Release
              </button>
            </div>
          </div>

          {cms.releases.length === 0 ? (
            <div className="border border-dashed border-hairline rounded-lg p-xxl text-center">
              <Package size={32} strokeWidth={1} className="text-ink opacity-20 mx-auto mb-lg" />
              <p className="font-sans text-body font-[320] text-ink opacity-40 mb-lg">No releases found</p>
              <button className="btn-primary flex items-center gap-xs mx-auto" onClick={() => cms.setView('create-release')}>
                <PlusCircle size={14} strokeWidth={2} />
                Create first release
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-xs">
              {cms.releases.map((r: Release) => (
                <ReleaseRow key={r.id} release={r} onClick={() => cms.selectRelease(r)} />
              ))}
            </div>
          )}
        </div>
      )}

      {cms.view === 'releases' && cms.selectedRelease && (
        <ReleaseDetail
          release={cms.selectedRelease}
          loading={cms.loading}
          onUpload={cms.uploadAsset}
          onDelete={cms.deleteAsset}
          onBack={() => cms.selectRelease(null)}
        />
      )}

      {cms.view === 'create-release' && (
        <CreateReleaseForm
          loading={cms.loading}
          onSubmit={cms.createRelease}
          onCancel={() => cms.setView('releases')}
        />
      )}
    </div>
  )
}
