import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { Field, SegmentedControl, Slider, Toggle } from '@/components/ui/Field'

export function AnimationPanel({ ticker }: { ticker: Ticker }) {
  const updateAnimation = useStudioStore((s) => s.updateAnimation)
  const an = ticker.animation

  const speedLabel = an.speed < 34 ? 'Slow' : an.speed < 67 ? 'Medium' : 'Fast'

  return (
    <div>
      <Field label="Direction">
        <SegmentedControl
          value={an.direction}
          onChange={(v) => updateAnimation(ticker.id, { direction: v })}
          options={[
            { value: 'ltr', label: <span className="flex items-center justify-center gap-1"><ArrowRight size={12} /> Left → Right</span> },
            { value: 'rtl', label: <span className="flex items-center justify-center gap-1"><ArrowLeft size={12} /> Right → Left</span> },
          ]}
        />
      </Field>

      <Field label="Speed" hint={speedLabel}>
        <Slider value={an.speed} min={5} max={100} onChange={(v) => updateAnimation(ticker.id, { speed: v })} />
      </Field>

      <Field label="Animation Style">
        <SegmentedControl
          value={an.style}
          onChange={(v) => updateAnimation(ticker.id, { style: v })}
          options={[
            { value: 'crawl', label: 'Crawl' },
            { value: 'smooth', label: 'Smooth' },
            { value: 'step', label: 'Step' },
          ]}
        />
      </Field>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-studio-ink-soft">Pause on hover</span>
        <Toggle checked={an.pauseOnHover} onChange={(v) => updateAnimation(ticker.id, { pauseOnHover: v })} />
      </div>
    </div>
  )
}
