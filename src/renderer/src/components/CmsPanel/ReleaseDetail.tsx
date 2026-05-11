import { ArrowLeft, Upload, FileText, X, Download, Tag, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils'
import type { Release } from '../../../../shared/cms-types'

interface Props {
  release: Release
  loading: boolean
  onUpload: (release: Release) => void
  onDelete: (release: Release, assetId: string) => void
  onBack: () => void
}

export function ReleaseDetail({ release, loading, onUpload, onDelete, onBack }: Props): JSX.Element {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-md mb-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-xs font-sans text-body-sm font-[480] text-ink opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Releases
        </button>
        <span className="text-ink opacity-20">/</span>
        <span className="font-mono text-body-sm text-ink">{release.tagName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-lg mb-xl">
        <div>
          <h3 className="font-sans text-headline font-[540] text-ink">{release.name}</h3>
          <div className="flex flex-wrap items-center gap-sm mt-sm">
            {release.isDraft && (
              <span className="caption bg-surface-soft text-ink px-sm py-xxs rounded-sm">Draft</span>
            )}
            {release.isPrerelease && (
              <span className="caption bg-block-coral text-ink px-sm py-xxs rounded-sm">Pre-release</span>
            )}
            <span className="flex items-center gap-xs caption text-ink opacity-40">
              <Tag size={11} strokeWidth={1.5} />
              {release.tagName}
            </span>
            <span className="flex items-center gap-xs caption text-ink opacity-40">
              <Calendar size={11} strokeWidth={1.5} />
              {new Date(release.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          className="btn-primary flex items-center gap-xs flex-shrink-0"
          onClick={() => onUpload(release)}
          disabled={loading}
        >
          <Upload size={14} strokeWidth={2} />
          {loading ? 'Uploading…' : 'Upload File'}
        </button>
      </div>

      {/* Release notes */}
      {release.body && (
        <div className="bg-surface-soft rounded-md p-lg mb-xl">
          <p className="caption text-ink opacity-40 mb-sm">Release Notes</p>
          <p className="font-sans text-body-sm font-[320] text-ink whitespace-pre-wrap">{release.body}</p>
        </div>
      )}

      {/* Assets */}
      <div>
        <p className="eyebrow text-ink opacity-50 mb-md">Assets ({release.assets.length})</p>

        {release.assets.length === 0 ? (
          <div className="border border-dashed border-hairline rounded-lg p-xxl text-center">
            <Upload size={28} strokeWidth={1} className="text-ink opacity-20 mx-auto mb-lg" />
            <p className="font-sans text-body font-[320] text-ink opacity-40 mb-lg">No assets yet</p>
            <button className="btn-secondary flex items-center gap-xs mx-auto" onClick={() => onUpload(release)} disabled={loading}>
              <Upload size={14} strokeWidth={2} />
              Upload first file
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            {release.assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between gap-lg bg-canvas border border-hairline rounded-md px-lg py-md hover:border-ink/30 transition-colors group"
              >
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-8 h-8 bg-surface-soft rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText size={14} strokeWidth={1.5} className="text-ink opacity-50" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-body-sm font-[480] text-ink truncate">{asset.name}</p>
                    <p className="font-mono text-caption text-ink opacity-40">
                      {asset.size > 0 ? formatBytes(asset.size) : '—'}
                      {asset.downloadCount > 0 && ` · ${asset.downloadCount} downloads`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-xs flex-shrink-0">
                  <button
                    onClick={() => window.open(asset.downloadUrl)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-xs font-sans text-body-sm font-[480] text-ink hover:opacity-60 px-sm py-xxs"
                  >
                    <Download size={13} strokeWidth={2} />
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(release, asset.id)}
                    disabled={loading}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      'w-8 h-8 flex items-center justify-center rounded-full',
                      'hover:bg-block-coral/40 text-ink disabled:opacity-30'
                    )}
                    title="Delete asset"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning: latest.yml reminder */}
        <div className="mt-lg flex items-start gap-sm bg-block-cream rounded-md px-lg py-md">
          <AlertCircle size={15} strokeWidth={1.5} className="text-ink opacity-50 flex-shrink-0 mt-[2px]" />
          <p className="font-sans text-body-sm font-[320] text-ink opacity-60">
            Remember to include <code className="font-mono bg-ink/8 px-xs rounded-xs">latest.yml</code> in this release so electron-updater can detect the update.
          </p>
        </div>
      </div>
    </div>
  )
}
