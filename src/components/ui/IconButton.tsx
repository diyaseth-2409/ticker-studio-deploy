import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  active?: boolean
  size?: 'sm' | 'md'
}

export function IconButton({ icon, label, active, size = 'md', className = '', ...rest }: IconButtonProps) {
  const dim = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
  return (
    <button
      title={label}
      aria-label={label}
      className={`group relative flex ${dim} items-center justify-center rounded-[5px] border transition-colors
        ${active ? 'border-accent-600 bg-accent-50 text-accent-700' : 'border-transparent text-studio-ink-soft hover:border-studio-border hover:bg-black/[0.04]'}
        disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...rest}
    >
      {icon}
    </button>
  )
}
