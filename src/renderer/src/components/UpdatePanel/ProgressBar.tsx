import { cn } from '@/lib/utils'
import { formatBytes, formatSpeed } from '@/lib/utils'
import type { DownloadProgressInfo } from '../../../../shared/types'

interface ProgressBarProps {
  progress: DownloadProgressInfo
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-sm', className)}>
      <div className="flex justify-between items-center">
        <span className="font-sans text-body-sm font-[320] text-ink opacity-60">
          {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
        </span>
        <span className="font-sans text-body-sm font-[480] text-ink">
          {formatSpeed(progress.bytesPerSecond)}
        </span>
      </div>

      <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-ink rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, progress.percent)}%` }}
        />
      </div>

      <div className="text-right">
        <span className="font-sans text-body-sm font-[480] text-ink">
          {progress.percent}%
        </span>
      </div>
    </div>
  )
}
