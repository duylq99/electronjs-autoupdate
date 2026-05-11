import { useState } from 'react'
import { Tag, FileText, PlusCircle, X } from 'lucide-react'
import type { CreateReleaseInput } from '../../../../shared/cms-types'

interface Props {
  loading: boolean
  onSubmit: (input: CreateReleaseInput) => void
  onCancel: () => void
}

export function CreateReleaseForm({ loading, onSubmit, onCancel }: Props): JSX.Element {
  const [form, setForm] = useState<CreateReleaseInput>({
    tagName: '',
    name: '',
    body: '',
    isDraft: true,
    isPrerelease: false
  })

  const isValid = form.tagName.trim() && form.name.trim()

  return (
    <div className="max-w-xl">
      <p className="eyebrow text-ink opacity-50 mb-xl">New Release</p>

      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="caption text-ink opacity-50 block mb-xs">Tag Name</label>
            <div className="relative">
              <Tag size={14} strokeWidth={1.5} className="absolute left-md top-1/2 -translate-y-1/2 text-ink opacity-30" />
              <input
                type="text"
                value={form.tagName}
                onChange={(e) => setForm((f) => ({ ...f, tagName: e.target.value }))}
                placeholder="v1.2.0"
                className="w-full bg-canvas border border-hairline rounded-md pl-10 pr-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="caption text-ink opacity-50 block mb-xs">Release Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Version 1.2.0"
              className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="caption text-ink opacity-50 block mb-xs flex items-center gap-xs">
            <FileText size={11} strokeWidth={1.5} />
            Release Notes
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={5}
            placeholder="What's new in this release…"
            className="w-full bg-canvas border border-hairline rounded-md px-md py-sm font-sans text-body font-[320] text-ink focus:outline-none focus:border-ink transition-colors resize-none"
          />
        </div>

        <div className="flex gap-xl">
          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDraft}
              onChange={(e) => setForm((f) => ({ ...f, isDraft: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <span className="font-sans text-body-sm font-[320] text-ink">Draft</span>
          </label>
          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrerelease}
              onChange={(e) => setForm((f) => ({ ...f, isPrerelease: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <span className="font-sans text-body-sm font-[320] text-ink">Pre-release</span>
          </label>
        </div>

        <div className="flex gap-sm pt-sm">
          <button
            className="btn-primary flex items-center gap-xs"
            disabled={!isValid || loading}
            onClick={() => onSubmit(form)}
          >
            <PlusCircle size={14} strokeWidth={2} />
            {loading ? 'Creating…' : 'Create Release'}
          </button>
          <button className="btn-secondary flex items-center gap-xs" onClick={onCancel}>
            <X size={14} strokeWidth={2} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
