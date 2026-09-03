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
    <div className="mx-auto w-[92%] max-w-[1600px] py-14">
      <div className="mb-9 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] bg-navy-900 shadow-[0_2px_6px_-1px_rgba(11,18,32,0.35)]">
          <Radio size={22} className="text-white" strokeWidth={2.25} />
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-studio-ink">Choose a ticker style</h1>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {PRESETS.map((p, i) => {
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
              className="group flex flex-col rounded-[8px] border border-studio-border bg-white p-2.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-400 hover:shadow-[0_8px_20px_-6px_rgba(16,24,40,0.12)]"
            >
              <div className="relative mb-2.5 w-full overflow-hidden rounded-[5px] bg-navy-900 [&_*]:![animation-play-state:paused] group-hover:[&_*]:![animation-play-state:running]">
                <TickerRender ticker={preview} scale={0.62} />
              </div>
              <div className="flex items-center justify-between gap-2 px-0.5">
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-studio-ink-soft">
                  <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-studio-panel font-mono text-[9.5px] text-studio-muted">
                    {i + 1}
                  </span>
                  {p.label}
                </p>
                <ArrowRight
                  size={12}
                  className="shrink-0 -translate-x-1 text-studio-muted/0 transition-all duration-150 group-hover:translate-x-0 group-hover:text-accent-600"
                />
              </div>
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
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center py-14">
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
