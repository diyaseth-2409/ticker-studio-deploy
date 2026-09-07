import { useMemo } from 'react'
import type { Ticker } from '@/types/ticker'

// Renders the actual scrolling ticker bar — shared by the canvas layer,
// the sidebar mini-preview, and the add-ticker preset preview.
export function TickerRender({ ticker, scale = 1 }: { ticker: Ticker; scale?: number }) {
  const { appearance, typography, animation } = ticker

  const items = useMemo(() => {
    if (ticker.contentSource === 'rss' && ticker.rssFeed) {
      const f = ticker.rssFeed.fields
      const list = ticker.rssFeed.items.length
        ? ticker.rssFeed.items
        : [{ id: 'placeholder', headline: 'Connect an RSS feed to see live items', source: 'Ticker Studio', date: 'now' }]
      return list.map((it) => {
        const parts: string[] = []
        if (f.headline) parts.push(it.headline)
        if (f.source) parts.push(it.source)
        if (f.date) parts.push(it.date)
        return parts.join('  •  ')
      })
    }
    return ticker.customItems.length ? ticker.customItems.map((i) => i.text) : ['Add ticker items to see them here']
  }, [ticker])

  const background =
    appearance.background === 'transparent'
      ? 'transparent'
      : appearance.background === 'gradient'
        ? `linear-gradient(90deg, ${appearance.gradientFrom}, ${appearance.gradientTo})`
        : appearance.backgroundColor

  const durationSec = Math.max(4, 60 - animation.speed * 0.55) / (scale < 1 ? 1 : 1)
  const animName =
    animation.style === 'step' ? 'step-crawl' : 'marquee'
  const animDir = animation.direction === 'rtl' ? 'rtl' : 'ltr'

  const radius = appearance.shape === 'rounded' ? 6 * scale : 0

  const tagWidth = Math.max(28, 44 * scale)

  return (
    <div
      className="relative flex w-full overflow-hidden"
      style={{
        height: appearance.height * scale,
        background,
        opacity: appearance.opacity / 100,
        borderRadius: radius,
      }}
    >
      {/* accent tag — the clearest place the accent color reads at a glance */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center"
        style={{ width: tagWidth, background: appearance.accentColor }}
      >
        <span
          className="h-[40%] w-[2px] rounded-full"
          style={{ background: appearance.textColor, opacity: 0.65 }}
        />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-y-0 flex items-center whitespace-nowrap will-change-transform"
          style={{
            animation: `${animName}-${animDir} ${durationSec}s linear infinite`,
            animationPlayState: 'running',
            paddingLeft: appearance.padding * scale,
          }}
        >
          {[0, 1].map((dupe) => (
            <div key={dupe} className="flex items-center" style={{ gap: appearance.gap * scale }}>
              {items.map((text, i) => (
                <span
                  key={`${dupe}-${i}`}
                  style={{
                    color: appearance.textColor,
                    fontFamily: typography.fontFamily,
                    fontSize: Math.max(8, typography.fontSize * scale),
                    fontWeight: Number(typography.fontWeight),
                    letterSpacing: typography.letterSpacing * scale,
                    marginRight: appearance.gap * scale,
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
