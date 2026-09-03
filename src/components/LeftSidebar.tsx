import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Copy, Eye, EyeOff, Trash2, GripVertical, Rss, Type } from 'lucide-react'
import { useStudioStore } from '@/store/useStudioStore'
import type { Ticker } from '@/types/ticker'
import { TickerRender } from '@/components/TickerRender'
import { IconButton } from '@/components/ui/IconButton'

export function LeftSidebar() {
  const tickers = useStudioStore((s) => s.tickers)
  const reorderTickers = useStudioStore((s) => s.reorderTickers)
  const toggleAddModal = useStudioStore((s) => s.toggleAddModal)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    reorderTickers(String(active.id), String(over.id))
  }

  const orderedIds = [...tickers].sort((a, b) => b.zIndex - a.zIndex).map((t) => t.id)

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-studio-border bg-white">
      <div className="flex items-center justify-between border-b border-studio-border px-4 py-3.5">
        <h2 className="text-[13px] font-semibold text-studio-ink">Tickers</h2>
        <span className="text-[11px] text-studio-muted">{tickers.length}</span>
      </div>

      <div className="p-3">
        <button
          onClick={() => toggleAddModal(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[5px] bg-navy-900 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-700"
        >
          <Plus size={14} strokeWidth={2.5} /> Add Ticker
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {tickers.length === 0 ? (
          <p className="px-1 py-6 text-center text-[12px] leading-relaxed text-studio-muted">
            No tickers yet. Add one to start building your broadcast.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {orderedIds.map((id, idx) => {
                  const t = tickers.find((x) => x.id === id)!
                  return <TickerCard key={id} ticker={t} index={idx} />
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </aside>
  )
}

function TickerCard({ ticker, index }: { ticker: Ticker; index: number }) {
  const selectedId = useStudioStore((s) => s.selectedId)
  const selectTicker = useStudioStore((s) => s.selectTicker)
  const duplicateTicker = useStudioStore((s) => s.duplicateTicker)
  const toggleVisible = useStudioStore((s) => s.toggleVisible)
  const deleteTicker = useStudioStore((s) => s.deleteTicker)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticker.id })
  const selected = selectedId === ticker.id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectTicker(ticker.id)}
      className={`group cursor-pointer rounded-[6px] border p-2.5 transition-colors ${
        selected ? 'border-accent-500 bg-accent-50/60 ring-1 ring-accent-100' : 'border-studio-border hover:border-studio-border-strong hover:bg-black/[0.015]'
      } ${!ticker.visible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab touch-none text-studio-muted/60 hover:text-studio-muted active:cursor-grabbing"
        >
          <GripVertical size={13} />
        </button>
        <span className="text-[10px] font-mono text-studio-muted">Ticker {String(index + 1).padStart(2, '0')}</span>
        <span className="ml-auto flex items-center gap-0.5 text-studio-muted">
          {ticker.contentSource === 'rss' ? <Rss size={11} /> : <Type size={11} />}
        </span>
      </div>

      <p className="mb-1.5 mt-1 truncate text-[13px] font-semibold text-studio-ink">{ticker.name}</p>

      <div className="overflow-hidden rounded-[4px] border border-studio-border/80 bg-navy-900">
        <div style={{ transform: 'scale(1)' }}>
          <TickerRender ticker={ticker} scale={0.55} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium ${
            ticker.visible ? 'bg-accent-50 text-accent-700' : 'bg-black/5 text-studio-muted'
          }`}
        >
          {ticker.visible ? 'Active' : 'Hidden'}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton
            size="sm"
            icon={<Copy size={12} />}
            label="Duplicate"
            onClick={(e) => {
              e.stopPropagation()
              duplicateTicker(ticker.id)
            }}
          />
          <IconButton
            size="sm"
            icon={ticker.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            label={ticker.visible ? 'Hide' : 'Show'}
            onClick={(e) => {
              e.stopPropagation()
              toggleVisible(ticker.id)
            }}
          />
          <IconButton
            size="sm"
            icon={<Trash2 size={12} />}
            label="Delete"
            onClick={(e) => {
              e.stopPropagation()
              deleteTicker(ticker.id)
            }}
          />
        </div>
      </div>
    </div>
  )
}
