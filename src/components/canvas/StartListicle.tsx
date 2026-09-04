import { Radio, ArrowRight } from 'lucide-react'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import type { PresetId, Ticker } from '@/types/ticker'
import { TickerRender } from '@/components/TickerRender'

// The very first thing a first-time user sees: no forms, no empty canvas —
// just "pick a ticker style" as a listicle. Selecting a preset creates the
// ticker immediately (defaulting to Custom Text content) and drops the user
// straight into the canvas — content source is chosen there, in the right
// panel, so it isn't asked twice.
export function StartListicle() {
  const addTicker = useStudioStore((s) => s.addTicker)

  return (
    <div className="mx-auto w-[92%] max-w-[1600px] py-8">
      <div className="mb-5 flex items-center justify-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-navy-900">
          <Radio size={12} className="text-white" strokeWidth={2.25} />
        </div>
        <h1 className="text-[16px] font-semibold tracking-tight text-studio-ink">Choose a ticker style</h1>
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
              onClick={() => addTicker(p.label, p.id as PresetId, 'custom')}
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
