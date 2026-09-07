import type { Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { Field, ColorInput, SegmentedControl, Slider, SelectInput } from '@/components/ui/Field'

const FONTS = ['Inter', 'Georgia', 'Arial', 'JetBrains Mono', 'Roboto Slab']
const WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Black' },
] as const

export function AppearancePanel({ ticker }: { ticker: Ticker }) {
  const updateAppearance = useStudioStore((s) => s.updateAppearance)
  const updateTypography = useStudioStore((s) => s.updateTypography)
  const updateSize = useStudioStore((s) => s.updateSize)
  const a = ticker.appearance
  const t = ticker.typography

  return (
    <div>
      <Field label="Layout" hint="Rows">
        <SegmentedControl
          value={a.layout}
          onChange={(v) => updateAppearance(ticker.id, { layout: v })}
          options={[
            { value: 'single', label: 'Single Ticker' },
            { value: 'double', label: 'Double Ticker' },
          ]}
        />
      </Field>

      <div className="my-4 h-px bg-studio-border" />

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
        <Slider value={t.fontSize} min={10} max={32} onChange={(v) => updateTypography(ticker.id, { fontSize: v })} suffix="px" />
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
        <Slider
          value={t.letterSpacing}
          min={-1}
          max={4}
          step={0.1}
          onChange={(v) => updateTypography(ticker.id, { letterSpacing: v })}
          suffix="px"
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
