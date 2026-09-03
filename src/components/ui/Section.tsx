import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface SectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: string
}

export function Section({ title, children, defaultOpen = true, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-studio-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-studio-ink-soft">
          {title}
          {badge && (
            <span className="rounded-[3px] bg-accent-50 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-accent-700">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-studio-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
