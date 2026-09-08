import { useState, type ReactNode } from 'react'
import { GripVertical, Plus, Trash2, Rss, Type as TypeIcon, RefreshCw, Tag, Timer, Palette, Wand2 } from 'lucide-react'
import type { ContentSourceType, CustomItem, CycleTransition, RssFeedConfig, RssField, Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { Field, TextInput, SegmentedControl, SelectInput, Slider, Stepper, Collapsible, ColorInput } from '@/components/ui/Field'
import { PRESET_RSS_FEEDS } from '@/data/mockRss'
import { FONTS, WEIGHTS, CrawlAppearanceEditor } from '@/components/panel/AppearancePanel'
import { AnimationPanel } from '@/components/panel/AnimationPanel'

const DOUBLE_LAYOUTS = ['double', 'double-bold', 'double-abp']

// Section card used to bucket the panel into "which row does this edit" —
// double-layout tickers have two independent text rows, so every control
// underneath one of these headers is scoped to that row only.
function RowSection({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[9px] border border-studio-border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-studio-border bg-studio-panel/70 px-3 py-2">
        <p className="text-[12px] font-semibold text-studio-ink">{label}</p>
        <p className="text-[11px] text-studio-muted">{hint}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

export function ContentSourcePanel({ ticker }: { ticker: Ticker }) {
  const setContentSource = useStudioStore((s) => s.setContentSource)
  const isDoubleLayout = DOUBLE_LAYOUTS.includes(ticker.appearance.layout)

  const crawlSection = (
    <div>
      <Field label="Content Source">
        <SegmentedControl
          value={ticker.contentSource}
          onChange={(v) => setContentSource(ticker.id, v)}
          options={[
            { value: 'custom', label: <span className="flex items-center justify-center gap-1.5"><TypeIcon size={12} /> Custom Text</span> },
            { value: 'rss', label: <span className="flex items-center justify-center gap-1.5"><Rss size={12} /> RSS Feed</span> },
          ]}
        />
      </Field>

      {ticker.contentSource === 'custom' ? <CustomItemsEditor ticker={ticker} /> : <CrawlRssEditor ticker={ticker} />}

      <div className="mt-4 flex flex-col gap-1">
        <Collapsible label="Badge" icon={<Tag size={12} />}>
          <BottomBadgeEditor ticker={ticker} />
        </Collapsible>
        {isDoubleLayout && (
          <>
            <Collapsible label="Timing" icon={<Timer size={12} />}>
              <CrawlTimingEditor ticker={ticker} />
            </Collapsible>
            <Collapsible label="Appearance" icon={<Palette size={12} />}>
              <CrawlAppearanceEditor ticker={ticker} />
            </Collapsible>
            <Collapsible label="Animation" icon={<Wand2 size={12} />}>
              <AnimationPanel ticker={ticker} />
            </Collapsible>
          </>
        )}
      </div>
    </div>
  )

  if (!isDoubleLayout) return <div>{crawlSection}</div>

  return (
    <div className="flex flex-col gap-3">
      <RowSection label="Top Strip" hint="Static or rotating headline row">
        <HeadlineContentSourceEditor ticker={ticker} />
        <div className="mt-4 flex flex-col gap-1">
          {ticker.appearance.layout !== 'double-bold' && (
            <Collapsible label="Badge" icon={<Tag size={12} />}>
              <TopBadgeEditor ticker={ticker} />
            </Collapsible>
          )}
          <Collapsible label="Timing" icon={<Timer size={12} />}>
            <HeadlineTimingEditor ticker={ticker} />
          </Collapsible>
          <Collapsible label="Appearance" icon={<Palette size={12} />}>
            <TopStripAppearanceEditor ticker={ticker} />
          </Collapsible>
        </div>
      </RowSection>

      <RowSection label="Crawl Row" hint="The scrolling ticker below">
        {crawlSection}
      </RowSection>
    </div>
  )
}

// Top strip's own content source — mirrors the crawl row's toggle exactly,
// just scoped to headlineContentSource/headlineItems/headlineRssFeed.
function HeadlineContentSourceEditor({ ticker }: { ticker: Ticker }) {
  const setHeadlineContentSource = useStudioStore((s) => s.setHeadlineContentSource)

  return (
    <div>
      <Field label="Content Source" hint="Empty cycles crawl items">
        <SegmentedControl
          value={ticker.headlineContentSource}
          onChange={(v) => setHeadlineContentSource(ticker.id, v)}
          options={[
            { value: 'custom', label: <span className="flex items-center justify-center gap-1.5"><TypeIcon size={12} /> Custom Text</span> },
            { value: 'rss', label: <span className="flex items-center justify-center gap-1.5"><Rss size={12} /> RSS Feed</span> },
          ]}
        />
      </Field>

      {ticker.headlineContentSource === 'custom' ? <HeadlineItemsEditor ticker={ticker} /> : <HeadlineRssEditor ticker={ticker} />}
    </div>
  )
}

const TRANSITION_OPTIONS: { value: CycleTransition; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'none', label: 'None' },
]

// How long each headline item holds before swapping, and how it swaps.
function HeadlineTimingEditor({ ticker }: { ticker: Ticker }) {
  const updateAnimation = useStudioStore((s) => s.updateAnimation)
  const an = ticker.animation

  return (
    <div>
      <Field label="Cycle Every">
        <Stepper value={an.headlineCycleSec} min={1} max={15} suffix="s" onChange={(v) => updateAnimation(ticker.id, { headlineCycleSec: v })} />
      </Field>
      <Field label="Transition">
        <SegmentedControl
          value={an.headlineTransition}
          onChange={(v) => updateAnimation(ticker.id, { headlineTransition: v })}
          options={TRANSITION_OPTIONS}
        />
      </Field>
    </div>
  )
}

// Top strip's own bg/text color + font — independent from the crawl row's
// Accent/Text Color and shared typography in the Appearance tab. Each field
// falls back to its shared counterpart (or, for double-abp, the layout's
// white/dark defaults) so "Reset" just clears the overrides.
function TopStripAppearanceEditor({ ticker }: { ticker: Ticker }) {
  const updateAppearance = useStudioStore((s) => s.updateAppearance)
  const updateHeadlineTypography = useStudioStore((s) => s.updateHeadlineTypography)
  const resetHeadlineTypography = useStudioStore((s) => s.resetHeadlineTypography)
  const a = ticker.appearance
  const t = { ...ticker.typography, ...ticker.headlineTypography }
  const isAbp = a.layout === 'double-abp'
  const resolvedBg = a.headlineBackgroundColor || (isAbp ? '#ffffff' : a.accentColor)
  const resolvedFg = a.headlineTextColor || (isAbp ? '#111111' : a.textColor)
  const hasOverride = Boolean(a.headlineBackgroundColor || a.headlineTextColor || Object.keys(ticker.headlineTypography).length)

  return (
    <div>
      {hasOverride && (
        <button
          onClick={() => {
            updateAppearance(ticker.id, { headlineBackgroundColor: null, headlineTextColor: null })
            resetHeadlineTypography(ticker.id)
          }}
          className="mb-2 text-[11px] font-medium text-accent-600 hover:text-accent-700"
        >
          Reset to shared appearance
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Field label="Background">
          <ColorInput value={resolvedBg} onChange={(v) => updateAppearance(ticker.id, { headlineBackgroundColor: v })} />
        </Field>
        <Field label="Text Color">
          <ColorInput value={resolvedFg} onChange={(v) => updateAppearance(ticker.id, { headlineTextColor: v })} />
        </Field>
      </div>

      <Field label="Font">
        <SelectInput value={t.fontFamily} onChange={(e) => updateHeadlineTypography(ticker.id, { fontFamily: e.target.value })}>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </SelectInput>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font Size">
          <Stepper value={t.fontSize} min={10} max={40} suffix="px" onChange={(v) => updateHeadlineTypography(ticker.id, { fontSize: v })} />
        </Field>
        <Field label="Weight">
          <SelectInput
            value={t.fontWeight}
            onChange={(e) => updateHeadlineTypography(ticker.id, { fontWeight: e.target.value as typeof t.fontWeight })}
          >
            {WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Letter Spacing">
        <Stepper
          value={t.letterSpacing}
          min={-1}
          max={4}
          step={0.1}
          suffix="px"
          onChange={(v) => updateHeadlineTypography(ticker.id, { letterSpacing: v })}
        />
      </Field>
      <Field label="Text Alignment">
        <SegmentedControl
          value={t.textAlign}
          onChange={(v) => updateHeadlineTypography(ticker.id, { textAlign: v })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Field>
    </div>
  )
}

// Crawl row can either scroll continuously (classic marquee — speed/style
// live in the Animation tab) or swap one item at a time like the headline.
function CrawlTimingEditor({ ticker }: { ticker: Ticker }) {
  const updateAnimation = useStudioStore((s) => s.updateAnimation)
  const an = ticker.animation
  const isSwap = an.crawlMode === 'swap'

  return (
    <div>
      <Field label="Crawl Mode" hint={isSwap ? undefined : 'Speed/Style in Animation tab'}>
        <SegmentedControl
          value={an.crawlMode}
          onChange={(v) => updateAnimation(ticker.id, { crawlMode: v })}
          options={[
            { value: 'scroll', label: 'Scroll' },
            { value: 'swap', label: 'Swap' },
          ]}
        />
      </Field>
      {isSwap && (
        <>
          <Field label="Cycle Every">
            <Stepper value={an.crawlCycleSec} min={1} max={15} suffix="s" onChange={(v) => updateAnimation(ticker.id, { crawlCycleSec: v })} />
          </Field>
          <Field label="Transition">
            <SegmentedControl
              value={an.crawlTransition}
              onChange={(v) => updateAnimation(ticker.id, { crawlTransition: v })}
              options={TRANSITION_OPTIONS}
            />
          </Field>
        </>
      )}
    </div>
  )
}

// Rotating headline strip on top — same add/remove/reorder UI as the crawl
// row below, but scoped to its own "Top Strip" section.
function HeadlineItemsEditor({ ticker }: { ticker: Ticker }) {
  const addHeadlineItem = useStudioStore((s) => s.addHeadlineItem)
  const updateHeadlineItem = useStudioStore((s) => s.updateHeadlineItem)
  const removeHeadlineItem = useStudioStore((s) => s.removeHeadlineItem)
  const reorderHeadlineItems = useStudioStore((s) => s.reorderHeadlineItems)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-1.5">
        {ticker.headlineItems.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null && dragIdx !== idx) reorderHeadlineItems(ticker.id, dragIdx, idx)
              setDragIdx(null)
            }}
            className="flex items-center gap-1.5 rounded-[5px] border border-studio-border bg-white px-2 py-1.5"
          >
            <GripVertical size={13} className="shrink-0 cursor-grab text-studio-muted/50" />
            <input
              value={item.text}
              onChange={(e) => updateHeadlineItem(ticker.id, item.id, e.target.value)}
              className="w-full bg-transparent text-[12.5px] text-studio-ink focus:outline-none"
            />
            <button
              onClick={() => removeHeadlineItem(ticker.id, item.id)}
              className="shrink-0 text-studio-muted/60 hover:text-red-500"
              aria-label="Delete headline item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => addHeadlineItem(ticker.id)}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-[5px] border border-dashed border-studio-border-strong py-1.5 text-[12px] font-medium text-studio-ink-soft transition-colors hover:border-accent-400 hover:text-accent-700"
      >
        <Plus size={13} /> Add Headline
      </button>
    </div>
  )
}

// Badge/tag on the top strip — "Live" (double), "Breaking News" (double-abp).
// Caller skips this entirely for double-bold, whose top row has no tag.
function TopBadgeEditor({ ticker }: { ticker: Ticker }) {
  const setTopBadgeText = useStudioStore((s) => s.setTopBadgeText)
  const isAbp = ticker.appearance.layout === 'double-abp'

  return (
    <Field label="Label" hint="Leave blank for default">
      <input
        value={ticker.topBadgeText ?? ''}
        onChange={(e) => setTopBadgeText(ticker.id, e.target.value)}
        placeholder={isAbp ? 'Breaking News' : 'Live'}
        className="w-full rounded-[5px] border border-studio-border bg-white px-2 py-1.5 text-[12.5px] text-studio-ink focus:outline-none focus:ring-1 focus:ring-accent-400"
      />
    </Field>
  )
}

// Badge/tag on the crawl row — "Watch More" (double-bold), "Top News"
// (double-abp). Caller skips this entirely for plain "double", whose bottom
// row is just an accent bar with no label.
function BottomBadgeEditor({ ticker }: { ticker: Ticker }) {
  const setBottomBadgeText = useStudioStore((s) => s.setBottomBadgeText)
  const layout = ticker.appearance.layout
  const placeholder = layout === 'double-abp' ? 'Top News' : layout === 'double-bold' ? 'Watch More' : 'Live'
  const hint = layout === 'single' || layout === 'double' ? 'Blank shows a plain divider' : 'Leave blank for default'

  return (
    <Field label="Label" hint={hint}>
      <input
        value={ticker.bottomBadgeText ?? ''}
        onChange={(e) => setBottomBadgeText(ticker.id, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[5px] border border-studio-border bg-white px-2 py-1.5 text-[12.5px] text-studio-ink focus:outline-none focus:ring-1 focus:ring-accent-400"
      />
    </Field>
  )
}

function CustomItemsEditor({ ticker }: { ticker: Ticker }) {
  const addCustomItem = useStudioStore((s) => s.addCustomItem)
  const updateCustomItem = useStudioStore((s) => s.updateCustomItem)
  const removeCustomItem = useStudioStore((s) => s.removeCustomItem)
  const reorderCustomItems = useStudioStore((s) => s.reorderCustomItems)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-1.5">
        {ticker.customItems.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null && dragIdx !== idx) reorderCustomItems(ticker.id, dragIdx, idx)
              setDragIdx(null)
            }}
            className="flex items-center gap-1.5 rounded-[5px] border border-studio-border bg-white px-2 py-1.5"
          >
            <GripVertical size={13} className="shrink-0 cursor-grab text-studio-muted/50" />
            <input
              value={item.text}
              onChange={(e) => updateCustomItem(ticker.id, item.id, e.target.value)}
              className="w-full bg-transparent text-[12.5px] text-studio-ink focus:outline-none"
            />
            <button
              onClick={() => removeCustomItem(ticker.id, item.id)}
              className="shrink-0 text-studio-muted/60 hover:text-red-500"
              aria-label="Delete item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => addCustomItem(ticker.id)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[5px] border border-dashed border-studio-border-strong py-1.5 text-[12px] font-medium text-studio-ink-soft transition-colors hover:border-accent-400 hover:text-accent-700"
      >
        <Plus size={13} /> Add Item
      </button>
    </div>
  )
}

function CrawlRssEditor({ ticker }: { ticker: Ticker }) {
  const setRssUrl = useStudioStore((s) => s.setRssUrl)
  const fetchRss = useStudioStore((s) => s.fetchRss)
  const setRssField = useStudioStore((s) => s.setRssField)
  return <RssEditor ticker={ticker} feed={ticker.rssFeed} setUrl={setRssUrl} fetch={fetchRss} setField={setRssField} />
}

function HeadlineRssEditor({ ticker }: { ticker: Ticker }) {
  const setUrl = useStudioStore((s) => s.setHeadlineRssUrl)
  const fetch = useStudioStore((s) => s.fetchHeadlineRss)
  const setField = useStudioStore((s) => s.setHeadlineRssField)
  return <RssEditor ticker={ticker} feed={ticker.headlineRssFeed} setUrl={setUrl} fetch={fetch} setField={setField} />
}

function RssEditor({
  ticker,
  feed,
  setUrl,
  fetch,
  setField,
}: {
  ticker: Ticker
  feed: RssFeedConfig | null
  setUrl: (id: string, url: string) => void
  fetch: (id: string) => Promise<void>
  setField: (id: string, field: keyof RssField, value: boolean) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    setLoading(true)
    await fetch(ticker.id)
    setLoading(false)
  }

  return (
    <div className="mt-3">
      <Field label="Preset Feeds" hint="Optional">
        <SelectInput
          value=""
          onChange={(e) => {
            if (e.target.value) setUrl(ticker.id, e.target.value)
          }}
        >
          <option value="">Choose a source…</option>
          {PRESET_RSS_FEEDS.map((f) => (
            <option key={f.url} value={f.url}>
              {f.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="RSS Feed URL" hint="One feed per ticker">
        <div className="flex gap-1.5">
          <TextInput
            value={feed?.url ?? ''}
            onChange={(e) => setUrl(ticker.id, e.target.value)}
            placeholder="https://example.com/feed.xml"
          />
        </div>
      </Field>
      <button
        onClick={handleFetch}
        disabled={!feed?.url || loading}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-[5px] border border-studio-border bg-white py-1.5 text-[12.5px] font-medium text-studio-ink-soft transition-colors hover:border-accent-400 hover:text-accent-700 disabled:opacity-40"
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Fetching…' : 'Fetch Feed'}
      </button>

      {feed && feed.items.length > 0 && (
        <>
          <Field label="Display fields">
            <div className="flex flex-wrap gap-1.5">
              {(['headline', 'source', 'date'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setField(ticker.id, f, !feed.fields[f])}
                  className={`rounded-[4px] border px-2 py-1 text-[11.5px] font-medium capitalize transition-colors ${
                    feed.fields[f]
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-studio-border text-studio-muted hover:border-studio-border-strong'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-2 flex flex-col gap-1.5 rounded-[5px] border border-studio-border bg-studio-panel p-2">
            <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-studio-muted">
              Preview ({feed.items.length} items)
            </p>
            {feed.items.slice(0, 4).map((it) => (
              <div key={it.id} className="rounded-[4px] bg-white px-2 py-1.5 text-[11.5px] text-studio-ink-soft">
                <span className="font-medium text-studio-ink">{it.headline}</span>
                <span className="text-studio-muted"> · {it.source} · {it.date}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
