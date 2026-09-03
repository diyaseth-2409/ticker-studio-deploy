import { useRef } from 'react'
import { Radio } from 'lucide-react'
import { useStudioStore } from '@/store/useStudioStore'
import { TickerLayer } from '@/components/canvas/TickerLayer'
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar'
import { StartListicle } from '@/components/canvas/StartListicle'

export function Canvas() {
  const tickers = useStudioStore((s) => s.tickers)
  const zoom = useStudioStore((s) => s.zoom)
  const showGuides = useStudioStore((s) => s.showGuides)
  const activeGuides = useStudioStore((s) => s.activeGuides)
  const selectTicker = useStudioStore((s) => s.selectTicker)
  const canvasRef = useRef<HTMLDivElement>(null)

  const ordered = [...tickers].sort((a, b) => a.zIndex - b.zIndex)

  if (tickers.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-studio-panel px-8">
        <StartListicle />
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-studio-panel">
      <div className="flex flex-1 items-center justify-center overflow-auto p-8">
        <div
          className="relative shrink-0"
          style={{ width: 960 * (zoom / 100), aspectRatio: '16 / 9' }}
        >
          <div
            ref={canvasRef}
            onClick={() => selectTicker(null)}
            className="relative h-full w-full overflow-hidden rounded-[6px] border border-studio-border-strong bg-navy-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-8px_rgba(0,0,0,0.25)]"
          >
            {/* subtle broadcast background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.05),transparent_60%)]" />
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-[4px] bg-black/30 px-2 py-1 backdrop-blur-sm">
              <Radio size={10} className="text-white/70" />
              <span className="text-[10px] font-medium tracking-wide text-white/70">PREVIEW · 16:9</span>
            </div>

            {/* center guides */}
            {showGuides && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.06]" />
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.06]" />
              </>
            )}
            {activeGuides.x !== null && (
              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-accent-400"
                style={{ left: `${activeGuides.x}%` }}
              />
            )}
            {activeGuides.y !== null && (
              <div
                className="pointer-events-none absolute inset-x-0 h-px bg-accent-400"
                style={{ top: `${activeGuides.y}%` }}
              />
            )}

            {ordered.map((t) => (
              <TickerLayer key={t.id} ticker={t} canvasRef={canvasRef} />
            ))}
          </div>
        </div>
      </div>
      <CanvasToolbar />
    </div>
  )
}
