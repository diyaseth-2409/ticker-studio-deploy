import type { Ticker } from '@/types/ticker'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import { TickerRender } from '@/components/TickerRender'

export function PresetsPanel({ ticker }: { ticker: Ticker }) {
  const applyPreset = useStudioStore((s) => s.applyPreset)

  return (
    <div className="grid grid-cols-2 gap-2">
      {PRESETS.map((p) => {
        const active = ticker.preset === p.id
        const preview: Ticker = {
          ...ticker,
          appearance: p.appearance,
          typography: p.typography,
          animation: p.animation,
          customItems: [{ id: 'x', text: p.label }, { id: 'y', text: 'Ticker Studio' }],
          contentSource: 'custom',
        }
        return (
          <button
            key={p.id}
            onClick={() => applyPreset(ticker.id, p.id)}
            className={`rounded-[6px] border p-1.5 text-left transition-colors ${
              active ? 'border-accent-500 ring-1 ring-accent-100' : 'border-studio-border hover:border-studio-border-strong'
            }`}
          >
            <div className="overflow-hidden rounded-[3px] bg-navy-900">
              <TickerRender ticker={preview} scale={0.4} />
            </div>
            <p className={`mt-1.5 truncate text-[11.5px] font-medium ${active ? 'text-accent-700' : 'text-studio-ink-soft'}`}>
              {p.label}
            </p>
          </button>
        )
      })}
    </div>
  )
}
