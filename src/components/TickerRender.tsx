import { useEffect, useMemo, useState } from 'react'
import type { CustomItem, CycleTransition, RssFeedConfig, Ticker } from '@/types/ticker'

// Class applied to a cycling item on mount/swap — 'none' skips animation
// entirely, others use the fade-in keyframe or a horizontal slide-in.
function transitionClass(t: CycleTransition) {
  if (t === 'none') return ''
  if (t === 'slide') return 'animate-[slide-in_0.35s_ease]'
  return 'animate-[fade-in_0.4s_ease]'
}

// Maps a TextAlign to the flex justify- class for the row it sits in — used
// for single-item text (headline strip, crawl "swap" mode); the continuous
// marquee scroll ignores alignment since it has no fixed position to align.
function justifyClass(align: 'left' | 'center' | 'right') {
  return align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
}

// Turns an RSS feed's items into display lines using its field toggles —
// shared by the crawl row and the headline strip, which each keep their own
// independent feed.
function rssLines(feed: RssFeedConfig) {
  const f = feed.fields
  const list = feed.items.length
    ? feed.items
    : [{ id: 'placeholder', headline: 'Connect an RSS feed to see live items', source: 'Ticker Studio', date: 'now' }]
  return list.map((it) => {
    const parts: string[] = []
    if (f.headline) parts.push(it.headline)
    if (f.source) parts.push(it.source)
    if (f.date) parts.push(it.date)
    return parts.join('  •  ')
  })
}

// Renders the actual ticker — shared by the canvas layer, the sidebar
// mini-preview, and the preset picker preview.
//
// Layout "single": one crawl row (accent tag + scrolling items).
// Layout "double": a static headline strip on top (accent tag + first item,
// no scroll) stacked over the same crawl row below — the classic
// broadcast-news look (logo/tag + headline, then a ticking crawl bar).
export function TickerRender({ ticker, scale = 1 }: { ticker: Ticker; scale?: number }) {
  const { appearance, typography, animation } = ticker

  const items = useMemo(() => {
    if (ticker.contentSource === 'rss' && ticker.rssFeed) return rssLines(ticker.rssFeed)
    return ticker.customItems.length ? ticker.customItems.map((i) => i.text) : ['Add ticker items to see them here']
  }, [ticker])

  const background =
    appearance.background === 'transparent'
      ? 'transparent'
      : appearance.background === 'gradient'
        ? `linear-gradient(90deg, ${appearance.gradientFrom}, ${appearance.gradientTo})`
        : appearance.backgroundColor

  const durationSec = Math.max(4, 60 - animation.speed * 0.55)
  const animName = animation.style === 'step' ? 'step-crawl' : 'marquee'
  const animDir = animation.direction === 'rtl' ? 'rtl' : 'ltr'
  const radius = appearance.shape === 'rounded' ? 6 * scale : 0
  const tagWidth = Math.max(28, 44 * scale)
  const isDouble = appearance.layout === 'double'
  const isDoubleBold = appearance.layout === 'double-bold'
  const isDoubleAbp = appearance.layout === 'double-abp'

  // Headline strip: has its own content source (custom items or its own RSS
  // feed), edited independently in the Content panel. Falls back to cycling
  // the crawl row's own items when the headline has nothing of its own —
  // covers tickers created before this field existed.
  const headlineOwnItems = useMemo(() => {
    if (ticker.headlineContentSource === 'rss' && ticker.headlineRssFeed) return rssLines(ticker.headlineRssFeed)
    return ticker.headlineItems.map((i: CustomItem) => i.text)
  }, [ticker.headlineContentSource, ticker.headlineItems, ticker.headlineRssFeed])
  const headlineSource = headlineOwnItems.length ? headlineOwnItems : items
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const headlineCycleMs = Math.max(1, animation.headlineCycleSec) * 1000
  useEffect(() => {
    if ((!isDouble && !isDoubleAbp && !isDoubleBold) || headlineSource.length < 2) return
    const id = setInterval(() => setHeadlineIndex((i) => (i + 1) % headlineSource.length), headlineCycleMs)
    return () => clearInterval(id)
  }, [isDouble, isDoubleAbp, isDoubleBold, headlineSource.length, headlineCycleMs])
  const headlineText = headlineSource[headlineIndex % headlineSource.length]
  const headlineTransitionClass = transitionClass(animation.headlineTransition)

  // Crawl row "swap" mode — one item at a time instead of continuous scroll.
  const isCrawlSwap = animation.crawlMode === 'swap'
  const [crawlIndex, setCrawlIndex] = useState(0)
  const crawlCycleMs = Math.max(1, animation.crawlCycleSec) * 1000
  useEffect(() => {
    if (!isCrawlSwap || items.length < 2) return
    const id = setInterval(() => setCrawlIndex((i) => (i + 1) % items.length), crawlCycleMs)
    return () => clearInterval(id)
  }, [isCrawlSwap, items.length, crawlCycleMs])
  const crawlSwapText = items[crawlIndex % items.length]
  const crawlTransitionClass = transitionClass(animation.crawlTransition)

  // Badge labels — each falls back to the layout's default when left blank.
  const topBadgeText = ticker.topBadgeText?.trim() || (isDoubleAbp ? 'Breaking News' : 'Live')
  const bottomBadgeText = ticker.bottomBadgeText?.trim() || (isDoubleAbp ? 'Top News' : 'Watch More')

  // Top strip colors — independent from the crawl row's accentColor/textColor
  // when overridden; otherwise fall back to each layout's existing default
  // (accentColor bg for double/double-bold, white bg for double-abp).
  const headlineBg = appearance.headlineBackgroundColor || (isDoubleAbp ? '#ffffff' : appearance.accentColor)
  const headlineFg = appearance.headlineTextColor || (isDoubleAbp ? '#111111' : appearance.textColor)

  // Top strip typography — each field independently falls back to the
  // shared `typography` above when not overridden.
  const headlineTypo = { ...typography, ...ticker.headlineTypography }

  return (
    <div className="w-full overflow-hidden" style={{ borderRadius: radius, opacity: appearance.opacity / 100 }}>
      {isDoubleBold && (
        <div
          className={`relative flex w-full items-center overflow-hidden px-2 ${justifyClass(headlineTypo.textAlign)}`}
          style={{ height: appearance.height * scale * 1.4, background: headlineBg }}
        >
          <span
            key={headlineIndex}
            className={`truncate font-extrabold uppercase ${headlineTransitionClass}`}
            style={{
              color: headlineFg,
              fontFamily: headlineTypo.fontFamily,
              fontSize: Math.max(14, headlineTypo.fontSize * scale * 1.7),
              fontWeight: Number(headlineTypo.fontWeight),
              letterSpacing: headlineTypo.letterSpacing * scale,
              textAlign: headlineTypo.textAlign,
            }}
          >
            {headlineText}
          </span>
        </div>
      )}

      {isDoubleAbp && (
        <div
          className="relative flex w-full items-stretch overflow-hidden"
          style={{ height: appearance.height * scale * 1.3, background: headlineBg }}
        >
          {/* logo mark + yellow accent bar — leading brand block */}
          <div className="flex shrink-0 items-center gap-2 pl-2 pr-3">
            <span
              className="flex shrink-0 items-center justify-center rounded-full font-black text-white"
              style={{ width: 22 * scale, height: 22 * scale, background: appearance.accentColor, fontSize: Math.max(9, 11 * scale) }}
            >
              N
            </span>
            <span className="h-[65%] w-[3px] shrink-0 rounded-full" style={{ background: '#facc15' }} />
          </div>

          {/* headline — cycles through items; dark-on-white by default, or the ticker's own headline color override */}
          <span className={`relative flex flex-1 items-center overflow-hidden ${justifyClass(headlineTypo.textAlign)}`}>
            <span
              key={headlineIndex}
              className={`truncate font-extrabold ${headlineTransitionClass}`}
              style={{
                color: headlineFg,
                fontFamily: headlineTypo.fontFamily,
                fontSize: Math.max(13, headlineTypo.fontSize * scale * 1.15),
                fontWeight: Number(headlineTypo.fontWeight),
                letterSpacing: headlineTypo.letterSpacing * scale,
                textAlign: headlineTypo.textAlign,
              }}
            >
              {headlineText}
            </span>
          </span>

          {/* top badge — two-tone, wraps to 2 lines on its own */}
          <div
            className="flex shrink-0 flex-col items-center justify-center gap-0 whitespace-normal px-3 text-center leading-none"
            style={{ background: appearance.accentColor, maxWidth: tagWidth * 2.4 }}
          >
            <span className="font-black uppercase" style={{ fontSize: Math.max(9, 11 * scale), color: '#facc15' }}>
              {topBadgeText}
            </span>
          </div>
        </div>
      )}

      {isDouble && (
        <div
          className="relative flex w-full items-stretch overflow-hidden"
          style={{ height: appearance.height * scale * 1.15, background: headlineBg }}
        >
          {/* top badge — its own bold block (white-on-accent), sized to lead the strip and read at a glance */}
          <span
            className="sticky left-0 z-10 flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3 text-center font-black uppercase italic tracking-wide"
            style={{
              minWidth: tagWidth * 2.4,
              fontFamily: typography.fontFamily,
              fontSize: Math.max(15, typography.fontSize * scale * 1.3),
              color: headlineFg,
              background: 'rgba(0,0,0,0.18)',
            }}
          >
            <span className="inline-block h-[8px] w-[8px] shrink-0 animate-pulse rounded-full" style={{ background: headlineFg }} />
            {topBadgeText}
          </span>
          {/* headline — cycles through items so the strip isn't frozen on the first one */}
          <span className={`relative flex flex-1 items-center overflow-hidden pl-3 pr-2 ${justifyClass(headlineTypo.textAlign)}`}>
            <span
              key={headlineIndex}
              className={`truncate font-extrabold ${headlineTransitionClass}`}
              style={{
                color: headlineFg,
                fontFamily: headlineTypo.fontFamily,
                fontSize: Math.max(13, headlineTypo.fontSize * scale * 1.15),
                fontWeight: Number(headlineTypo.fontWeight),
                letterSpacing: headlineTypo.letterSpacing * scale,
                textAlign: headlineTypo.textAlign,
              }}
            >
              {headlineText}
            </span>
          </span>
        </div>
      )}

      <div
        className="relative flex w-full overflow-hidden"
        style={{ height: appearance.height * scale, background }}
      >
        {/* accent tag — the clearest place the accent color reads at a glance.
            Shows an optional badge label (e.g. "Live"); falls back to a bare
            divider bar when left blank, so existing tickers render unchanged. */}
        {!isDoubleBold && !isDoubleAbp && (
          <div
            className="relative z-10 flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-2"
            style={{ minWidth: tagWidth, background: appearance.accentColor }}
          >
            {ticker.bottomBadgeText?.trim() ? (
              <span
                className="font-bold uppercase"
                style={{
                  color: appearance.textColor,
                  fontFamily: typography.fontFamily,
                  fontSize: Math.max(9, typography.fontSize * scale * 0.75),
                }}
              >
                {ticker.bottomBadgeText}
              </span>
            ) : (
              <span className="h-[40%] w-[2px] rounded-full" style={{ background: appearance.textColor, opacity: 0.65 }} />
            )}
          </div>
        )}

        {isDoubleAbp && (
          <div className="relative z-10 flex shrink-0 items-stretch">
            <span
              className="flex shrink-0 items-center whitespace-nowrap px-2 font-bold uppercase text-white"
              style={{ background: '#1d4ed8', fontFamily: typography.fontFamily, fontSize: Math.max(9, typography.fontSize * scale * 0.75) }}
            >
              {bottomBadgeText}
            </span>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          {isCrawlSwap ? (
            <div
              className={`flex h-full items-center overflow-hidden ${justifyClass(typography.textAlign)}`}
              style={{ paddingLeft: appearance.padding * scale }}
            >
              <span
                key={crawlIndex}
                className={`truncate ${crawlTransitionClass}`}
                style={{
                  color: appearance.textColor,
                  fontFamily: typography.fontFamily,
                  textAlign: typography.textAlign,
                  fontSize: Math.max(8, typography.fontSize * scale),
                  fontWeight: Number(typography.fontWeight),
                  letterSpacing: typography.letterSpacing * scale,
                }}
              >
                {crawlSwapText}
              </span>
            </div>
          ) : (
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
          )}
        </div>

        {isDoubleBold && (
          <div
            className="relative z-10 flex shrink-0 flex-col items-center justify-center whitespace-normal text-center leading-none"
            style={{ width: tagWidth * 2, background: appearance.accentColor }}
          >
            <span
              style={{
                color: appearance.textColor,
                fontFamily: typography.fontFamily,
                fontSize: Math.max(7, typography.fontSize * scale * 0.55),
                fontWeight: 700,
              }}
            >
              {bottomBadgeText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
