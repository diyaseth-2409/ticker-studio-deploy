import { useMemo } from 'react'
import { Check } from 'lucide-react'
import type { Ticker } from '@/types/ticker'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import { TickerRender } from '@/components/TickerRender'

export function PresetsPanel({ ticker }: { ticker: Ticker }) {
  const applyPreset = useStudioStore((s) => s.applyPreset)

  // Selected preset floats to the top so it's visible without scrolling —
  // everything else keeps its original relative order.
  const orderedPresets = useMemo(() => {
    const active = PRESETS.find((p) => p.id === ticker.preset)
    if (!active) return PRESETS
    return [active, ...PRESETS.filter((p) => p.id !== ticker.preset)]
  }, [ticker.preset])

  return (
    <div className="flex flex-col gap-2">
      {orderedPresets.map((p) => {
        const active = ticker.preset === p.id
        const preview: Ticker = {
          ...ticker,
          appearance: p.appearance,
          typography: p.typography,
          animation: p.animation,
          customItems: [{ id: 'x', text: p.label }, { id: 'y', text: 'Ticker Studio' }],
          headlineItems: [],
          contentSource: 'custom',
        }
        return (
          <button
            key={p.id}
            onClick={() => applyPreset(ticker.id, p.id)}
            className={`overflow-hidden rounded-[8px] border text-left transition-colors ${
              active ? 'border-accent-500 ring-1 ring-accent-200' : 'border-studio-border hover:border-studio-border-strong'
            }`}
          >
            <div className="overflow-hidden bg-navy-900">
              <TickerRender ticker={preview} scale={0.55} />
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5">
              <span className={`min-w-0 flex-1 truncate text-[12px] font-medium ${active ? 'text-accent-700' : 'text-studio-ink-soft'}`}>
                {p.label}
              </span>
              {active && (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
                  <Check size={9} />
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
