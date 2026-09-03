import { Minus, Plus, Maximize2, Undo2, Redo2, Magnet, LayoutGrid } from 'lucide-react'
import { useStudioStore } from '@/store/useStudioStore'
import { IconButton } from '@/components/ui/IconButton'

export function CanvasToolbar() {
  const zoom = useStudioStore((s) => s.zoom)
  const setZoom = useStudioStore((s) => s.setZoom)
  const showGuides = useStudioStore((s) => s.showGuides)
  const snapToGuides = useStudioStore((s) => s.snapToGuides)
  const toggleGuides = useStudioStore((s) => s.toggleGuides)
  const toggleSnap = useStudioStore((s) => s.toggleSnap)
  const undo = useStudioStore((s) => s.undo)
  const redo = useStudioStore((s) => s.redo)
  const past = useStudioStore((s) => s.past.length)
  const future = useStudioStore((s) => s.future.length)

  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-t border-studio-border bg-white px-3">
      <div className="flex items-center gap-1">
        <IconButton icon={<Undo2 size={14} />} label="Undo" onClick={undo} disabled={past === 0} />
        <IconButton icon={<Redo2 size={14} />} label="Redo" onClick={redo} disabled={future === 0} />
      </div>

      <div className="flex items-center gap-1">
        <IconButton icon={<Minus size={13} />} label="Zoom out" onClick={() => setZoom(zoom - 10)} />
        <span className="w-11 text-center font-mono text-[11.5px] text-studio-muted">{zoom}%</span>
        <IconButton icon={<Plus size={13} />} label="Zoom in" onClick={() => setZoom(zoom + 10)} />
        <span className="mx-1 h-4 w-px bg-studio-border" />
        <IconButton icon={<Maximize2 size={13} />} label="Fit to screen" onClick={() => setZoom(100)} />
      </div>

      <div className="flex items-center gap-1">
        <IconButton icon={<LayoutGrid size={13} />} label="Show guides" active={showGuides} onClick={toggleGuides} />
        <IconButton icon={<Magnet size={13} />} label="Snap to guides" active={snapToGuides} onClick={toggleSnap} />
      </div>
    </div>
  )
}
