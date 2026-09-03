import type { ReactNode } from 'react'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-studio-ink-soft">
        {label}
        {hint && <span className="text-[11px] font-normal text-studio-muted">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      className={`w-full rounded-[5px] border border-studio-border bg-white px-2.5 py-1.5 text-[13px] text-studio-ink placeholder:text-studio-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 ${className}`}
      {...rest}
    />
  )
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select
      className={`w-full rounded-[5px] border border-studio-border bg-white px-2.5 py-1.5 text-[13px] text-studio-ink focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-[5px] border border-studio-border bg-white px-2 py-1.5">
      <input type="color" value={toHex(value)} onChange={(e) => onChange(e.target.value)} className="h-5 w-5 shrink-0 cursor-pointer" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[12px] font-mono text-studio-ink-soft focus:outline-none"
      />
    </div>
  )
}

function toHex(v: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.slice(0, 7)
  return '#000000'
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode; title?: string }[]
}) {
  return (
    <div className="flex rounded-[5px] border border-studio-border bg-white p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-[4px] px-2 py-1 text-[12px] font-medium transition-colors ${
            value === opt.value ? 'bg-accent-600 text-white' : 'text-studio-ink-soft hover:bg-black/[0.04]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <span className="w-12 shrink-0 text-right font-mono text-[11px] text-studio-muted">
        {value}
        {suffix}
      </span>
    </div>
  )
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-accent-600' : 'bg-studio-border-strong'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
