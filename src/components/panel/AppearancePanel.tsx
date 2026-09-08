import type { LayoutMode, Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { Field, ColorInput, SegmentedControl, Slider, Stepper, SelectInput } from '@/components/ui/Field'

const LAYOUT_OPTIONS: { value: LayoutMode; label: string; rows: 1 | 2 }[] = [
  { value: 'single', label: 'Single Ticker', rows: 1 },
  { value: 'double', label: 'Double Ticker', rows: 2 },
  { value: 'double-bold', label: 'Double (Bold)', rows: 2 },
  { value: 'double-abp', label: 'Double Ticker', rows: 2 },
]

// 2x2 card grid instead of a cramped 4-way segmented control — each card
// shows a tiny row-count preview so "single" vs "double" reads at a glance.
function LayoutPicker({ value, onChange }: { value: LayoutMode; onChange: (v: LayoutMode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {LAYOUT_OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-[6px] border px-2 py-2 transition-colors ${
              active
                ? 'border-accent-600 bg-accent-600 text-white'
                : 'border-studio-border bg-white text-studio-ink-soft hover:border-studio-border-strong'
            }`}
          >
            <span className="flex w-full flex-col gap-[3px]">
              <span className={`h-[5px] w-full rounded-sm ${active ? 'bg-white/80' : 'bg-studio-border-strong'}`} />
              {opt.rows === 2 && (
                <span className={`h-[5px] w-full rounded-sm ${active ? 'bg-white/50' : 'bg-studio-border'}`} />
              )}
            </span>
            <span className="text-[11.5px] font-medium leading-tight">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export const FONTS = ['Inter', 'Georgia', 'Arial', 'JetBrains Mono', 'Roboto Slab']
export const WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Black' },
] as const

// Layout picker only — shown at the top level regardless of layout, since it
// affects the whole ticker (both rows), not just the crawl row.
export function LayoutSection({ ticker }: { ticker: Ticker }) {
  const updateAppearance = useStudioStore((s) => s.updateAppearance)
  return (
    <Field label="Layout" hint="Rows">
      <LayoutPicker value={ticker.appearance.layout} onChange={(v) => updateAppearance(ticker.id, { layout: v })} />
    </Field>
  )
}

// Single-layout tickers show this as their own "Appearance" section (there's
// no separate crawl row to nest it under). Double-layout tickers show the
// same controls inside the Crawl Row card in the Content Source panel — see
// CrawlAppearanceEditor below, which this component wraps.
export function AppearancePanel({ ticker }: { ticker: Ticker }) {
  return <CrawlAppearanceEditor ticker={ticker} />
}

export function CrawlAppearanceEditor({ ticker }: { ticker: Ticker }) {
  const updateAppearance = useStudioStore((s) => s.updateAppearance)
  const updateTypography = useStudioStore((s) => s.updateTypography)
  const updateSize = useStudioStore((s) => s.updateSize)
  const a = ticker.appearance
  const t = ticker.typography

  return (
    <div>
      <Field label="Background">
        <SegmentedControl
          value={a.background}
          onChange={(v) => updateAppearance(ticker.id, { background: v })}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'transparent', label: 'Transparent' },
            { value: 'gradient', label: 'Gradient' },
          ]}
        />
      </Field>

      {a.background !== 'transparent' && (
        <Field label={a.background === 'gradient' ? 'Gradient Start' : 'Background Color'}>
          <ColorInput
            value={a.background === 'gradient' ? a.gradientFrom : a.backgroundColor}
            onChange={(v) =>
              updateAppearance(ticker.id, a.background === 'gradient' ? { gradientFrom: v } : { backgroundColor: v })
            }
          />
        </Field>
      )}
      {a.background === 'gradient' && (
        <Field label="Gradient End">
          <ColorInput value={a.gradientTo} onChange={(v) => updateAppearance(ticker.id, { gradientTo: v })} />
        </Field>
      )}

      <Field label="Text Color">
        <ColorInput value={a.textColor} onChange={(v) => updateAppearance(ticker.id, { textColor: v })} />
      </Field>
      <Field label="Accent Color">
        <ColorInput value={a.accentColor} onChange={(v) => updateAppearance(ticker.id, { accentColor: v })} />
      </Field>
      <Field label="Opacity">
        <Slider value={a.opacity} min={10} max={100} onChange={(v) => updateAppearance(ticker.id, { opacity: v })} suffix="%" />
      </Field>

      <div className="my-4 h-px bg-studio-border" />

      <Field label="Font">
        <SelectInput value={t.fontFamily} onChange={(e) => updateTypography(ticker.id, { fontFamily: e.target.value })}>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Font Size">
        <Stepper value={t.fontSize} min={10} max={32} suffix="px" onChange={(v) => updateTypography(ticker.id, { fontSize: v })} />
      </Field>
      <Field label="Font Weight">
        <SelectInput value={t.fontWeight} onChange={(e) => updateTypography(ticker.id, { fontWeight: e.target.value as typeof t.fontWeight })}>
          {WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Letter Spacing">
        <Stepper
          value={t.letterSpacing}
          min={-1}
          max={4}
          step={0.1}
          suffix="px"
          onChange={(v) => updateTypography(ticker.id, { letterSpacing: v })}
        />
      </Field>
      <Field label="Text Alignment">
        <SegmentedControl
          value={t.textAlign}
          onChange={(v) => updateTypography(ticker.id, { textAlign: v })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Field>

      <div className="my-4 h-px bg-studio-border" />

      <Field label="Shape">
        <SegmentedControl
          value={a.shape}
          onChange={(v) => updateAppearance(ticker.id, { shape: v })}
          options={[
            { value: 'rectangle', label: 'Rectangle' },
            { value: 'rounded', label: 'Rounded' },
          ]}
        />
      </Field>
      <Field label="Padding">
        <Slider value={a.padding} min={0} max={40} onChange={(v) => updateAppearance(ticker.id, { padding: v })} suffix="px" />
      </Field>
      <Field label="Item Gap">
        <Slider value={a.gap} min={8} max={100} onChange={(v) => updateAppearance(ticker.id, { gap: v })} suffix="px" />
      </Field>
      <Field label="Height">
        <Slider
          value={a.height}
          min={24}
          max={120}
          onChange={(v) => {
            updateAppearance(ticker.id, { height: v })
            updateSize(ticker.id, { ...ticker.size, height: v })
          }}
          suffix="px"
        />
      </Field>
    </div>
  )
}
