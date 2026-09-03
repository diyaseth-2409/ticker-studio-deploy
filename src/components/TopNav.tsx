import { Radio, Eye, Save, Upload } from 'lucide-react'
import { useStudioStore } from '@/store/useStudioStore'

export function TopNav() {
  const saveState = useStudioStore((s) => s.saveState)
  const save = useStudioStore((s) => s.save)
  const publish = useStudioStore((s) => s.publish)

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-studio-border bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-navy-900">
          <Radio size={13} className="text-white" strokeWidth={2.25} />
        </div>
        <span className="text-[13.5px] font-semibold tracking-tight text-studio-ink">Ticker Studio</span>
        <span className="mx-1 h-4 w-px bg-studio-border" />
        <span className="text-[13px] text-studio-muted">Untitled Broadcast Project</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-[5px] border border-studio-border bg-studio-panel px-2.5 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-600" />
        </span>
        <span className="text-[11.5px] font-medium text-studio-ink-soft">Live Preview</span>
      </div>

      <div className="flex items-center gap-2">
        <SaveBadge state={saveState} />
        <button className="flex items-center gap-1.5 rounded-[5px] border border-studio-border px-3 py-1.5 text-[12.5px] font-medium text-studio-ink-soft transition-colors hover:bg-black/[0.03]">
          <Eye size={13} /> Preview
        </button>
        <button
          onClick={save}
          className="flex items-center gap-1.5 rounded-[5px] border border-studio-border px-3 py-1.5 text-[12.5px] font-medium text-studio-ink-soft transition-colors hover:bg-black/[0.03]"
        >
          <Save size={13} /> Save
        </button>
        <button
          onClick={publish}
          className="flex items-center gap-1.5 rounded-[5px] bg-navy-900 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-700"
        >
          <Upload size={13} /> Publish
        </button>
      </div>
    </header>
  )
}

function SaveBadge({ state }: { state: 'saved' | 'unsaved' | 'published' }) {
  const map = {
    saved: { label: 'Saved', dot: 'bg-studio-muted' },
    unsaved: { label: 'Unsaved changes', dot: 'bg-amber-500' },
    published: { label: 'Published', dot: 'bg-accent-600' },
  }[state]
  return (
    <div className="mr-1 flex items-center gap-1.5 text-[11.5px] text-studio-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </div>
  )
}
