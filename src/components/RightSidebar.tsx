import { useStudioStore, selectTickerById } from '@/store/useStudioStore'
import { Section } from '@/components/ui/Section'
import { TextInput } from '@/components/ui/Field'
import { PresetsPanel } from '@/components/panel/PresetsPanel'
import { ContentSourcePanel } from '@/components/panel/ContentSourcePanel'
import { AppearancePanel } from '@/components/panel/AppearancePanel'
import { AnimationPanel } from '@/components/panel/AnimationPanel'
import { SlidersHorizontal } from 'lucide-react'

export function RightSidebar() {
  const selectedId = useStudioStore((s) => s.selectedId)
  const ticker = useStudioStore(selectTickerById(selectedId))
  const renameTicker = useStudioStore((s) => s.renameTicker)

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-studio-border bg-white">
      {!ticker ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-studio-border bg-studio-panel">
            <SlidersHorizontal size={15} className="text-studio-muted" />
          </div>
          <p className="text-[12.5px] leading-relaxed text-studio-muted">Select the ticker on the canvas to edit its configuration.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-studio-border px-4 py-3">
            <TextInput
              value={ticker.name}
              onChange={(e) => renameTicker(ticker.id, e.target.value)}
              className="text-[13.5px] font-semibold"
            />
          </div>

          <Section title="Ticker Presets" defaultOpen={false}>
            <PresetsPanel ticker={ticker} />
          </Section>

          <Section title="Content Source">
            <ContentSourcePanel ticker={ticker} />
          </Section>

          <Section title="Appearance" defaultOpen={false}>
            <AppearancePanel ticker={ticker} />
          </Section>

          <Section title="Animation" defaultOpen={false}>
            <AnimationPanel ticker={ticker} />
          </Section>
        </div>
      )}
    </aside>
  )
}
