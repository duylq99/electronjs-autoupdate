import {
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
  Rocket
} from 'lucide-react'
import { useAutoUpdate } from '@/hooks/useAutoUpdate'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: string }): JSX.Element {
  const map: Record<string, { icon: JSX.Element; bg: string }> = {
    idle:          { icon: <Info size={18} strokeWidth={1.5} />,         bg: 'bg-surface-soft text-ink' },
    checking:      { icon: <RefreshCw size={18} strokeWidth={2} className="animate-spin" />, bg: 'bg-surface-soft text-ink' },
    available:     { icon: <Download size={18} strokeWidth={1.5} />,     bg: 'bg-ink text-canvas' },
    'not-available': { icon: <CheckCircle2 size={18} strokeWidth={1.5} />, bg: 'bg-block-mint text-ink' },
    downloading:   { icon: <Download size={18} strokeWidth={2} className="animate-bounce" />, bg: 'bg-surface-soft text-ink' },
    ready:         { icon: <Rocket size={18} strokeWidth={1.5} />,       bg: 'bg-ink text-canvas' },
    error:         { icon: <AlertCircle size={18} strokeWidth={1.5} />,  bg: 'bg-block-coral text-ink' }
  }
  const { icon, bg } = map[status] ?? map.idle
  return (
    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', bg)}>
      {icon}
    </div>
  )
}

export function UpdatePanel(): JSX.Element {
  const {
    status, currentVersion, availableVersion, releaseNotes,
    progress, error, checkForUpdates, downloadUpdate, installAndRestart
  } = useAutoUpdate()

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  return (
    <div className="max-w-2xl mx-auto">
      {/* Version badge */}
      <div className="flex items-center gap-sm mb-xl">
        <span className="eyebrow text-ink opacity-60">Current Version</span>
        <span className="font-mono text-body-sm font-[400] bg-ink/8 text-ink px-sm py-xxs rounded-sm">
          v{currentVersion || '—'}
        </span>
      </div>

      {/* Card */}
      <div className="bg-canvas rounded-lg border border-hairline p-xxl" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between gap-lg mb-xl">
          <div>
            <h2 className="font-sans text-headline font-[540] text-ink mb-sm">
              {status === 'idle'          && 'Software Updates'}
              {status === 'checking'      && 'Checking for Updates…'}
              {status === 'available'     && `Version ${availableVersion} Available`}
              {status === 'not-available' && "You're up to date"}
              {status === 'downloading'   && 'Downloading Update…'}
              {status === 'ready'         && 'Ready to Install'}
              {status === 'error'         && 'Update Failed'}
            </h2>
            <p className="font-sans text-body font-[320] text-ink opacity-60">
              {status === 'idle'          && 'Check for the latest version of this application.'}
              {status === 'checking'      && 'Connecting to update server…'}
              {status === 'available'     && 'A new version is available for download.'}
              {status === 'not-available' && `v${currentVersion} is the latest version.`}
              {status === 'downloading'   && 'Please wait while the update is downloaded.'}
              {status === 'ready'         && 'The update will be installed when you restart.'}
              {status === 'error'         && (error || 'An error occurred while checking for updates.')}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Release notes */}
        {status === 'available' && releaseNotes && (
          <div className="mb-xl p-lg bg-surface-soft rounded-md">
            <p className="eyebrow text-ink opacity-40 mb-sm">Release Notes</p>
            <p className="font-sans text-body-sm font-[320] text-ink opacity-80">{releaseNotes}</p>
          </div>
        )}

        {/* Progress */}
        {status === 'downloading' && progress && <div className="mb-xl"><ProgressBar progress={progress} /></div>}
        {status === 'downloading' && !progress && (
          <div className="mb-xl h-1.5 bg-ink/10 rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full animate-pulse w-1/3" />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-sm">
          {(status === 'idle' || status === 'not-available' || status === 'error') && (
            <button className="btn-primary flex items-center gap-xs" onClick={checkForUpdates} disabled={!isElectron}>
              <RefreshCw size={16} strokeWidth={2} />
              {status === 'error' ? 'Retry' : 'Check for Updates'}
            </button>
          )}

          {status === 'checking' && (
            <button className="btn-primary flex items-center gap-xs" disabled>
              <RefreshCw size={16} strokeWidth={2} className="animate-spin" />
              Checking…
            </button>
          )}

          {status === 'available' && (
            <>
              <button className="btn-primary flex items-center gap-xs" onClick={downloadUpdate}>
                <Download size={16} strokeWidth={2} />
                Download Update
              </button>
              <button className="btn-secondary" onClick={checkForUpdates}>Check Again</button>
            </>
          )}

          {status === 'downloading' && (
            <button className="btn-primary flex items-center gap-xs" disabled>
              <Download size={16} strokeWidth={2} className="animate-bounce" />
              Downloading…
            </button>
          )}

          {status === 'ready' && (
            <>
              <button className="btn-primary flex items-center gap-xs" onClick={installAndRestart}>
                <Rocket size={16} strokeWidth={1.5} />
                Install &amp; Restart
              </button>
              <button className="btn-secondary flex items-center gap-xs">
                <RotateCcw size={14} strokeWidth={1.5} />
                Later
              </button>
            </>
          )}
        </div>

        {!isElectron && (
          <p className="mt-lg font-mono text-caption text-ink opacity-40 uppercase tracking-widest">
            Running in browser — Electron IPC not available
          </p>
        )}
      </div>
    </div>
  )
}
