// Core data model for Ticker Studio.
// Architecture note: `GraphicObject` is the extensible base — Ticker is the
// only concrete graphic type implemented today, but Closed Captions, Widgets,
// Lower Thirds and Alerts can be added later as sibling types on the same
// canvas/layer system without reshaping this file.

export type GraphicKind = 'ticker' // | 'caption' | 'widget' | 'lowerThird' | 'alert' (future)

export type ContentSourceType = 'custom' | 'rss'

export interface CustomItem {
  id: string
  text: string
}

export interface RssField {
  headline: boolean
  source: boolean
  date: boolean
}

export interface RssItem {
  id: string
  headline: string
  source: string
  date: string
  link?: string
}

export interface RssFeedConfig {
  url: string
  items: RssItem[]
  fields: RssField
  lastFetchedAt?: string
}

export type BackgroundMode = 'solid' | 'transparent' | 'gradient'
export type ShapeMode = 'rectangle' | 'rounded'
export type TextAlign = 'left' | 'center' | 'right'
export type FontWeight = '400' | '500' | '600' | '700' | '800'
// 'double-bold' is the Aajtak-style headline strip: big centered bold
// headline on top (background), a red "Watch" CTA box on the right of the
// crawl row below.
// 'double-abp' is the ABP-style strip: white top row (logo + accent bar on
// the left, big bold left-aligned headline, a two-tone "BREAKING NEWS" tag
// on the right) over a black crawl row with a "TOP NEWS" tag + time box on
// the left.
export type LayoutMode = 'single' | 'double' | 'double-bold' | 'double-abp'

export interface Appearance {
  layout: LayoutMode
  background: BackgroundMode
  backgroundColor: string
  gradientFrom: string
  gradientTo: string
  textColor: string
  accentColor: string
  opacity: number // 0-100
  shape: ShapeMode
  padding: number // px
  gap: number // px between items
  height: number // px, crawl row height (single row height, or bottom row height in double)
  // Top-strip-only color overrides for double/double-bold/double-abp
  // layouts — null falls back to accentColor/textColor (or, for double-abp,
  // the layout's own white/dark defaults) so existing tickers render
  // unchanged.
  headlineBackgroundColor: string | null
  headlineTextColor: string | null
}

export interface Typography {
  fontFamily: string
  fontSize: number // px
  fontWeight: FontWeight
  letterSpacing: number // px
  textAlign: TextAlign
}

export type AnimationDirection = 'ltr' | 'rtl'
export type AnimationStyle = 'crawl' | 'smooth' | 'step'
export type CycleTransition = 'fade' | 'slide' | 'none'
// Crawl row mode: 'scroll' is the classic continuous marquee (direction,
// speed, style below); 'swap' shows one item at a time, holding each for
// crawlCycleSec before transitioning to the next — same discrete-swap
// behavior as the headline strip.
export type CrawlMode = 'scroll' | 'swap'

export interface AnimationConfig {
  direction: AnimationDirection
  speed: number // 1-100
  style: AnimationStyle
  pauseOnHover: boolean
  // Headline strip (top row on double/double-bold/double-abp layouts):
  // seconds each item holds before swapping to the next, and how it swaps.
  headlineCycleSec: number
  headlineTransition: CycleTransition
  // Crawl row (bottom row / single-layout row): scroll is the default
  // marquee; swap turns it into a discrete one-item-at-a-time cycle using
  // crawlCycleSec/crawlTransition instead of direction/speed/style.
  crawlMode: CrawlMode
  crawlCycleSec: number
  crawlTransition: CycleTransition
}

export interface Position {
  x: number // % of canvas width, 0-100 (top-left anchor)
  y: number // % of canvas height, 0-100
}

export interface Size {
  width: number // % of canvas width
  height: number // px, mirrors appearance.height but independently resizable
}

export type PresetId =
  | 'breaking-news'
  | 'news-crawl'
  | 'sports'
  | 'business'
  | 'weather'
  | 'election'
  | 'minimal'
  | 'lower-third-crawl'
  | 'alert'
  | 'breaking-news-bold'
  | 'breaking-news-abp'
  | 'flash-red'
  | 'red-white'
  | 'crimson-alert'
  | 'breaking-white'
  | 'custom'

export interface Ticker {
  id: string
  kind: GraphicKind
  name: string
  preset: PresetId
  contentSource: ContentSourceType
  customItems: CustomItem[]
  rssFeed: RssFeedConfig | null
  // Top headline-strip content for double/double-bold/double-abp layouts,
  // edited independently from the crawl row below. Mirrors the crawl row's
  // own contentSource/customItems/rssFeed: 'custom' cycles headlineItems,
  // 'rss' cycles headlineRssFeed.items. Both empty falls back to cycling
  // through the crawl row's own items (legacy behavior).
  headlineContentSource: ContentSourceType
  headlineItems: CustomItem[]
  headlineRssFeed: RssFeedConfig | null
  // Badge labels for double/double-bold/double-abp layouts — the small tag on
  // the top strip (e.g. "Live", "Breaking News") and on the crawl row below
  // (e.g. "Watch More", "Top News"). null/empty falls back to each preset's
  // default label.
  topBadgeText: string | null
  bottomBadgeText: string | null
  // Top-strip-only typography overrides for double/double-bold/double-abp
  // layouts — each field is independently optional; unset fields fall back
  // to the shared `typography` below, so existing tickers render unchanged.
  headlineTypography: Partial<Typography>
  appearance: Appearance
  typography: Typography
  animation: AnimationConfig
  position: Position
  size: Size
  zIndex: number
  visible: boolean
  locked: boolean
  createdAt: string
  updatedAt: string
}

export type SaveState = 'saved' | 'unsaved' | 'published'
