import { Check } from 'lucide-react'
import type { Ticker } from '@/types/ticker'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import { TickerRender } from '@/components/TickerRender'

export function PresetsPanel({ ticker }: { ticker: Ticker }) {
  const applyPreset = useStudioStore((s) => s.applyPreset)

  return (
    <div className="flex flex-col gap-1.5">
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
            className={`flex items-center gap-2.5 rounded-[6px] border p-1.5 text-left transition-colors ${
              active ? 'border-accent-500 bg-accent-50/60 ring-1 ring-accent-100' : 'border-studio-border hover:border-studio-border-strong'
            }`}
          >
            <div className="w-20 shrink-0 overflow-hidden rounded-[3px] bg-navy-900">
              <TickerRender ticker={preview} scale={0.3} />
            </div>
            <span className={`min-w-0 flex-1 truncate text-[11.5px] font-medium ${active ? 'text-accent-700' : 'text-studio-ink-soft'}`}>
              {p.label}
            </span>
            {active && (
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
                <Check size={8} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
