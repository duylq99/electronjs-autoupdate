import { useEffect } from 'react'
import { Settings, Package, PlusCircle, X, ChevronRight, RefreshCw, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCms } from '@/hooks/useCms'
import { ProviderConfig } from './ProviderConfig'
import { CreateReleaseForm } from './CreateReleaseForm'
import { ReleaseDetail } from './ReleaseDetail'
import type { Release } from '../../../../shared/cms-types'

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
    if (isElectron) cms.loadConfig()
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
      {(cms.error || cms.successMsg) && (
        <div className={cn(
          'rounded-md px-lg py-md mb-xl flex items-start justify-between gap-md',
          cms.error ? 'bg-block-coral/30' : 'bg-block-mint/50'
        )}>
          <p className="font-sans text-body-sm font-[320] text-ink">{cms.error ?? cms.successMsg}</p>
          <button onClick={cms.clearMessages} className="flex-shrink-0 text-ink opacity-40 hover:opacity-80">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

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
