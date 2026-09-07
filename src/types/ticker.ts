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
export type LayoutMode = 'single' | 'double'

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

export interface AnimationConfig {
  direction: AnimationDirection
  speed: number // 1-100
  style: AnimationStyle
  pauseOnHover: boolean
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
  | 'custom'

export interface Ticker {
  id: string
  kind: GraphicKind
  name: string
  preset: PresetId
  contentSource: ContentSourceType
  customItems: CustomItem[]
  rssFeed: RssFeedConfig | null
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
