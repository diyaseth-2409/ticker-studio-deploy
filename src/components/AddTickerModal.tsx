import { X, Check } from 'lucide-react'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import type { PresetId, Ticker } from '@/types/ticker'
import { TickerRender } from '@/components/TickerRender'

// Adding a ticker after the first one already exists: just pick a style.
// Content source, name, and every other setting live in the right panel —
// asking for them again here would just repeat that step.
export function AddTickerModal() {
  const isOpen = useStudioStore((s) => s.isAddModalOpen)
  const toggleAddModal = useStudioStore((s) => s.toggleAddModal)
  const addTicker = useStudioStore((s) => s.addTicker)
  const tickerCount = useStudioStore((s) => s.tickers.length)

  if (!isOpen) return null

  const close = () => toggleAddModal(false)

  const pick = (preset: PresetId) => {
    addTicker(`Ticker ${String(tickerCount + 1).padStart(2, '0')}`, preset, 'custom')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[85vh] w-[640px] flex-col overflow-hidden rounded-[8px] border border-studio-border bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-studio-border px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-studio-ink">Choose a ticker style</h2>
          <button onClick={close} className="text-studio-muted hover:text-studio-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-4">
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
                onClick={() => pick(p.id)}
                className="group flex flex-col rounded-[7px] border border-studio-border p-2 text-left transition-colors hover:border-accent-400 hover:bg-accent-50/30"
              >
                <div className="mb-2 w-full overflow-hidden rounded-[4px] bg-navy-900">
                  <TickerRender ticker={preview} scale={0.4} />
                </div>
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <p className="text-[12px] font-medium text-studio-ink-soft">{p.label}</p>
                  <Check size={12} className="shrink-0 text-studio-muted/0 transition-colors group-hover:text-accent-600" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
