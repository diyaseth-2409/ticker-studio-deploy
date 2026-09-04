import { useState } from 'react'
import { GripVertical, Plus, Trash2, Rss, Type as TypeIcon, RefreshCw } from 'lucide-react'
import type { Ticker } from '@/types/ticker'
import { useStudioStore } from '@/store/useStudioStore'
import { Field, TextInput, SegmentedControl, SelectInput } from '@/components/ui/Field'
import { PRESET_RSS_FEEDS } from '@/data/mockRss'

export function ContentSourcePanel({ ticker }: { ticker: Ticker }) {
  const setContentSource = useStudioStore((s) => s.setContentSource)

  return (
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

      {ticker.contentSource === 'custom' ? <CustomItemsEditor ticker={ticker} /> : <RssEditor ticker={ticker} />}
    </div>
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

function RssEditor({ ticker }: { ticker: Ticker }) {
  const setRssUrl = useStudioStore((s) => s.setRssUrl)
  const fetchRss = useStudioStore((s) => s.fetchRss)
  const setRssField = useStudioStore((s) => s.setRssField)
  const [loading, setLoading] = useState(false)

  const feed = ticker.rssFeed

  const handleFetch = async () => {
    setLoading(true)
    await fetchRss(ticker.id)
    setLoading(false)
  }

  return (
    <div className="mt-3">
      <Field label="Preset Feeds" hint="Optional">
        <SelectInput
          value=""
          onChange={(e) => {
            if (e.target.value) setRssUrl(ticker.id, e.target.value)
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
            onChange={(e) => setRssUrl(ticker.id, e.target.value)}
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
                  onClick={() => setRssField(ticker.id, f, !feed.fields[f])}
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
