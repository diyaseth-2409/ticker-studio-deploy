import { useState } from 'react'
import { Radio, Type as TypeIcon, Rss, ArrowRight } from 'lucide-react'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import type { ContentSourceType, PresetId, Ticker } from '@/types/ticker'
import { TickerRender } from '@/components/TickerRender'

// The very first thing a first-time user sees: no forms, no empty canvas —
// just "pick a ticker style" as a listicle. Selecting a row immediately
// advances to a lightweight content-source choice, then creates the ticker
// and drops the user straight into the canvas.
export function StartListicle() {
  const addTicker = useStudioStore((s) => s.addTicker)
  const [preset, setPreset] = useState<PresetId | null>(null)

  if (preset) {
    return <ContentStep preset={preset} onBack={() => setPreset(null)} onCreate={(source) => addTicker(presetLabel(preset), preset, source)} />
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[7px] bg-navy-900">
          <Radio size={18} className="text-white" strokeWidth={2.25} />
        </div>
        <h1 className="text-[19px] font-semibold text-studio-ink">Choose a ticker style</h1>
        <p className="mt-1 text-[13px] text-studio-muted">Pick a starting look — you can customize everything after.</p>
      </div>

      <div className="flex max-h-[58vh] flex-col gap-1.5 overflow-y-auto rounded-[8px] border border-studio-border bg-white p-2 shadow-sm">
        {PRESETS.map((p) => {
          const preview: Ticker = {
            id: 'p',
            kind: 'ticker',
            name: p.label,
            preset: p.id,
            contentSource: 'custom',
            customItems: [{ id: 'a', text: p.label }, { id: 'b', text: 'Ticker Studio' }],
            rssFeed: null,
            appearance: p.appearance,
            typography: p.typography,
            animation: p.animation,
            position: { x: 0, y: 0 },
            size: { width: 100, height: p.appearance.height },
            zIndex: 1,
            visible: true,
            locked: false,
            createdAt: '',
            updatedAt: '',
          }
          return (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className="group flex items-center gap-4 rounded-[6px] border border-transparent p-2 text-left transition-colors hover:border-studio-border hover:bg-studio-panel"
            >
              <div className="w-40 shrink-0 overflow-hidden rounded-[4px] bg-navy-900">
                <TickerRender ticker={preview} scale={0.36} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-studio-ink">{p.label}</p>
                <p className="truncate text-[11.5px] text-studio-muted">{p.description}</p>
              </div>
              <ArrowRight size={14} className="shrink-0 text-studio-muted/0 transition-colors group-hover:text-accent-600" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ContentStep({
  preset,
  onBack,
  onCreate,
}: {
  preset: PresetId
  onBack: () => void
  onCreate: (source: ContentSourceType) => void
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center py-10">
      <div className="mb-6 text-center">
        <p className="mb-1 text-[11.5px] font-medium text-studio-muted">{presetLabel(preset)} selected</p>
        <h1 className="text-[19px] font-semibold text-studio-ink">How will this ticker get its content?</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onCreate('custom')}
          className="rounded-[7px] border border-studio-border bg-white p-5 text-left transition-colors hover:border-accent-400 hover:bg-accent-50/40"
        >
          <TypeIcon size={20} className="text-accent-600" />
          <p className="mt-3 text-[13.5px] font-semibold text-studio-ink">Custom Text</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-studio-muted">
            Write and manage your own list of ticker messages.
          </p>
        </button>
        <button
          onClick={() => onCreate('rss')}
          className="rounded-[7px] border border-studio-border bg-white p-5 text-left transition-colors hover:border-accent-400 hover:bg-accent-50/40"
        >
          <Rss size={20} className="text-accent-600" />
          <p className="mt-3 text-[13.5px] font-semibold text-studio-ink">RSS Feed</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-studio-muted">
            Pull headlines automatically from one RSS source.
          </p>
        </button>
      </div>

      <button onClick={onBack} className="mx-auto mt-5 text-[12px] font-medium text-studio-muted hover:text-studio-ink-soft">
        ← Back to styles
      </button>
    </div>
  )
}

function presetLabel(id: PresetId) {
  return PRESETS.find((p) => p.id === id)?.label ?? 'Ticker'
}
