import { GripVertical, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { useStudioStore } from '@/store/useStudioStore'

export function LayersPanel() {
  const tickers = useStudioStore((s) => s.tickers)
  const selectedId = useStudioStore((s) => s.selectedId)
  const selectTicker = useStudioStore((s) => s.selectTicker)
  const toggleVisible = useStudioStore((s) => s.toggleVisible)
  const toggleLocked = useStudioStore((s) => s.toggleLocked)
  const reorderTickers = useStudioStore((s) => s.reorderTickers)

  const ordered = [...tickers].sort((a, b) => b.zIndex - a.zIndex)
  let dragId: string | null = null

  return (
    <div className="flex flex-col gap-1">
      {ordered.map((t) => (
        <div
          key={t.id}
          draggable
          onDragStart={() => (dragId = t.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragId && dragId !== t.id) reorderTickers(dragId, t.id)
            dragId = null
          }}
          onClick={() => selectTicker(t.id)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-[5px] border px-2 py-1.5 text-[12px] transition-colors ${
            selectedId === t.id ? 'border-accent-500 bg-accent-50/60' : 'border-transparent hover:bg-black/[0.03]'
          }`}
        >
          <GripVertical size={12} className="cursor-grab text-studio-muted/50" />
          <span className={`truncate ${selectedId === t.id ? 'font-medium text-accent-700' : 'text-studio-ink-soft'}`}>{t.name}</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLocked(t.id)
              }}
              className="text-studio-muted/60 hover:text-studio-ink-soft"
            >
              {t.locked ? <Lock size={12} /> : <Unlock size={12} className="opacity-0 group-hover:opacity-100" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleVisible(t.id)
              }}
              className="text-studio-muted/60 hover:text-studio-ink-soft"
            >
              {t.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
