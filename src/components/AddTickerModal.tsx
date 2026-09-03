import { useState } from 'react'
import { X, Type as TypeIcon, Rss, Check } from 'lucide-react'
import { PRESETS } from '@/data/presets'
import { useStudioStore } from '@/store/useStudioStore'
import type { ContentSourceType, PresetId, Ticker } from '@/types/ticker'
import { TickerRender } from '@/components/TickerRender'

const STEPS = ['Style', 'Content', 'Name'] as const

export function AddTickerModal() {
  const isOpen = useStudioStore((s) => s.isAddModalOpen)
  const toggleAddModal = useStudioStore((s) => s.toggleAddModal)
  const addTicker = useStudioStore((s) => s.addTicker)
  const tickerCount = useStudioStore((s) => s.tickers.length)

  const [step, setStep] = useState(0)
  const [preset, setPreset] = useState<PresetId>('breaking-news')
  const [source, setSource] = useState<ContentSourceType>('custom')
  const [name, setName] = useState('')

  if (!isOpen) return null

  const close = () => {
    toggleAddModal(false)
    setStep(0)
    setName('')
    setPreset('breaking-news')
    setSource('custom')
  }

  const finish = () => {
    const finalName = name.trim() || `Ticker ${String(tickerCount + 1).padStart(2, '0')}`
    addTicker(finalName, preset, source)
    close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[85vh] w-[560px] flex-col overflow-hidden rounded-[8px] border border-studio-border bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-studio-border px-5 py-3.5">
          <div>
            <h2 className="text-[14px] font-semibold text-studio-ink">Add Ticker</h2>
            <div className="mt-1 flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold ${
                      i < step ? 'bg-accent-600 text-white' : i === step ? 'bg-accent-100 text-accent-700' : 'bg-black/5 text-studio-muted'
                    }`}
                  >
                    {i < step ? <Check size={9} /> : i + 1}
                  </span>
                  <span className={`text-[11px] ${i === step ? 'font-medium text-studio-ink' : 'text-studio-muted'}`}>{s}</span>
                  {i < STEPS.length - 1 && <span className="mx-0.5 h-px w-3 bg-studio-border" />}
                </span>
              ))}
            </div>
          </div>
          <button onClick={close} className="text-studio-muted hover:text-studio-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2.5">
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
                const active = preset === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`rounded-[6px] border p-2 text-left transition-colors ${
                      active ? 'border-accent-500 ring-1 ring-accent-100' : 'border-studio-border hover:border-studio-border-strong'
                    }`}
                  >
                    <div className="overflow-hidden rounded-[3px] bg-navy-900">
                      <TickerRender ticker={preview} scale={0.42} />
                    </div>
                    <p className={`mt-1.5 text-[12px] font-medium ${active ? 'text-accent-700' : 'text-studio-ink'}`}>{p.label}</p>
                    <p className="text-[10.5px] text-studio-muted">{p.description}</p>
                  </button>
                )
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSource('custom')}
                className={`rounded-[7px] border p-4 text-left transition-colors ${
                  source === 'custom' ? 'border-accent-500 bg-accent-50/60' : 'border-studio-border hover:border-studio-border-strong'
                }`}
              >
                <TypeIcon size={18} className={source === 'custom' ? 'text-accent-600' : 'text-studio-muted'} />
                <p className="mt-2 text-[13px] font-semibold text-studio-ink">Custom Text</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-studio-muted">
                  Write and manage your own list of ticker messages.
                </p>
              </button>
              <button
                onClick={() => setSource('rss')}
                className={`rounded-[7px] border p-4 text-left transition-colors ${
                  source === 'rss' ? 'border-accent-500 bg-accent-50/60' : 'border-studio-border hover:border-studio-border-strong'
                }`}
              >
                <Rss size={18} className={source === 'rss' ? 'text-accent-600' : 'text-studio-muted'} />
                <p className="mt-2 text-[13px] font-semibold text-studio-ink">RSS Feed</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-studio-muted">
                  Pull headlines automatically from one RSS source.
                </p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-studio-ink-soft">Ticker name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Ticker ${String(tickerCount + 1).padStart(2, '0')}`}
                className="w-full rounded-[5px] border border-studio-border bg-white px-3 py-2 text-[13px] focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100"
              />
              <p className="mt-2 text-[11.5px] text-studio-muted">
                You can customize appearance, animation and content fully after creating it.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-studio-border px-5 py-3">
          <button
            onClick={() => (step === 0 ? close() : setStep(step - 1))}
            className="rounded-[5px] px-3 py-1.5 text-[12.5px] font-medium text-studio-ink-soft hover:bg-black/[0.03]"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="rounded-[5px] bg-navy-900 px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-accent-700"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={finish}
              className="rounded-[5px] bg-accent-600 px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-accent-700"
            >
              Create Ticker
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
