import { useCallback, useRef, useState } from 'react'
import { Move, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react'
import type { Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { TickerRender } from '@/components/TickerRender'
import { IconButton } from '@/components/ui/IconButton'

const SNAP_THRESHOLD = 1.2 // % units
const GUIDE_POINTS_X = [0, 50, 100]
const GUIDE_POINTS_Y = [0, 50, 100]

export function TickerLayer({
  ticker,
  canvasRef,
}: {
  ticker: Ticker
  canvasRef: React.RefObject<HTMLDivElement | null>
}) {
  const selectedId = useStudioStore((s) => s.selectedId)
  const selectTicker = useStudioStore((s) => s.selectTicker)
  const updatePosition = useStudioStore((s) => s.updatePosition)
  const updateSize = useStudioStore((s) => s.updateSize)
  const toggleVisible = useStudioStore((s) => s.toggleVisible)
  const toggleLocked = useStudioStore((s) => s.toggleLocked)
  const deleteTicker = useStudioStore((s) => s.deleteTicker)
  const snapToGuides = useStudioStore((s) => s.snapToGuides)
  const setActiveGuides = useStudioStore((s) => s.setActiveGuides)

  const selected = selectedId === ticker.id
  const [dragging, setDragging] = useState(false)

  const dragState = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
    origW: number
    mode: 'move' | 'resize-e' | 'resize-w' | 'resize-s'
  } | null>(null)

  const getCanvasRect = useCallback(() => canvasRef.current?.getBoundingClientRect(), [canvasRef])

  const onPointerDown = (e: React.PointerEvent, mode: 'move' | 'resize-e' | 'resize-w' | 'resize-s') => {
    if (ticker.locked) return
    e.stopPropagation()
    e.preventDefault()
    selectTicker(ticker.id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: ticker.position.x,
      origY: ticker.position.y,
      origW: ticker.size.width,
      mode,
    }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return
    const rect = getCanvasRect()
    if (!rect) return
    const dxPct = ((e.clientX - dragState.current.startX) / rect.width) * 100
    const dyPct = ((e.clientY - dragState.current.startY) / rect.height) * 100
    const { mode, origX, origY, origW } = dragState.current

    let guideX: number | null = null
    let guideY: number | null = null

    if (mode === 'move') {
      let nx = clamp(origX + dxPct, 0, 100 - origW)
      let ny = clamp(origY + dyPct, 0, 96)

      if (snapToGuides) {
        for (const gx of GUIDE_POINTS_X) {
          if (Math.abs(nx - gx) < SNAP_THRESHOLD) {
            nx = gx
            guideX = gx
          }
          const centerTarget = gx - origW / 2
          if (Math.abs(nx - centerTarget) < SNAP_THRESHOLD && gx === 50) {
            nx = centerTarget
            guideX = 50
          }
        }
        for (const gy of GUIDE_POINTS_Y) {
          if (Math.abs(ny - gy) < SNAP_THRESHOLD) {
            ny = gy
            guideY = gy
          }
        }
      }
      updatePosition(ticker.id, { x: nx, y: ny })
    } else if (mode === 'resize-e') {
      const nw = clamp(origW + dxPct, 10, 100 - origX)
      updateSize(ticker.id, { ...ticker.size, width: nw })
    } else if (mode === 'resize-w') {
      const delta = clamp(dxPct, -origX, origW - 10)
      updatePosition(ticker.id, { x: origX + delta, y: ticker.position.y })
      updateSize(ticker.id, { ...ticker.size, width: origW - delta })
    } else if (mode === 'resize-s') {
      const rectHeightPx = rect.height
      const dyPx = (dyPct / 100) * rectHeightPx
      const nh = clamp(ticker.size.height + dyPx * 0.01 * 100, 24, 200)
      updateSize(ticker.id, { ...ticker.size, height: Math.round(nh) })
    }

    setActiveGuides({ x: guideX, y: guideY })
  }

  const onPointerUp = () => {
    if (!dragState.current) return
    dragState.current = null
    setDragging(false)
    setActiveGuides({ x: null, y: null })
    updatePosition(ticker.id, ticker.position, true)
  }

  if (!ticker.visible) return null

  return (
    <div
      className="absolute"
      style={{
        left: `${ticker.position.x}%`,
        top: `${ticker.position.y}%`,
        width: `${ticker.size.width}%`,
        zIndex: ticker.zIndex,
        cursor: ticker.locked ? 'not-allowed' : dragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={(e) => onPointerDown(e, 'move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        e.stopPropagation()
        selectTicker(ticker.id)
      }}
    >
      <TickerRender ticker={{ ...ticker, appearance: { ...ticker.appearance, height: ticker.size.height } }} />

      {selected && (
        <div className="pointer-events-none absolute inset-0 animate-select-in rounded-[2px] ring-2 ring-accent-500">
          {/* resize handles */}
          <div
            onPointerDown={(e) => onPointerDown(e, 'resize-w')}
            className="pointer-events-auto absolute -left-1 top-1/2 h-4 w-2 -translate-y-1/2 cursor-ew-resize rounded-[2px] border border-accent-600 bg-white"
          />
          <div
            onPointerDown={(e) => onPointerDown(e, 'resize-e')}
            className="pointer-events-auto absolute -right-1 top-1/2 h-4 w-2 -translate-y-1/2 cursor-ew-resize rounded-[2px] border border-accent-600 bg-white"
          />
          <div
            onPointerDown={(e) => onPointerDown(e, 'resize-s')}
            className="pointer-events-auto absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 cursor-ns-resize rounded-[2px] border border-accent-600 bg-white"
          />

          {/* contextual toolbar */}
          <div className="pointer-events-auto absolute -top-9 left-0 flex items-center gap-0.5 rounded-[6px] border border-studio-border bg-white p-0.5 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center text-studio-muted">
              <Move size={12} />
            </div>
            <IconButton size="sm" icon={<EyeOff size={12} />} label="Hide" onClick={() => toggleVisible(ticker.id)} />
            <IconButton
              size="sm"
              icon={ticker.locked ? <Lock size={12} /> : <Unlock size={12} />}
              label={ticker.locked ? 'Unlock' : 'Lock'}
              active={ticker.locked}
              onClick={() => toggleLocked(ticker.id)}
            />
            <IconButton size="sm" icon={<Trash2 size={12} />} label="Delete" onClick={() => deleteTicker(ticker.id)} />
          </div>
        </div>
      )}
    </div>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}
