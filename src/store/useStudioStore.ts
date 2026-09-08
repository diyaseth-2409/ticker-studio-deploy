import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  Appearance,
  AnimationConfig,
  ContentSourceType,
  PresetId,
  Position,
  RssField,
  RssFeedConfig,
  SaveState,
  Size,
  Ticker,
  Typography,
} from '@/types/ticker'
import { createTicker } from '@/lib/createTicker'
import { getPreset } from '@/data/presets'
import { fetchRssFeed } from '@/data/mockRss'

interface HistoryEntry {
  tickers: Ticker[]
}

interface StudioState {
  tickers: Ticker[]
  selectedId: string | null
  saveState: SaveState
  zoom: number // percent, 25-200
  showGuides: boolean
  snapToGuides: boolean
  activeGuides: { x: number | null; y: number | null }

  past: HistoryEntry[]
  future: HistoryEntry[]

  // selection / lifecycle — single ticker only, addTicker replaces any existing one
  selectTicker: (id: string | null) => void
  addTicker: (name: string, preset: PresetId, source: ContentSourceType) => void
  deleteTicker: (id: string) => void
  toggleVisible: (id: string) => void
  toggleLocked: (id: string) => void

  // canvas transform
  updatePosition: (id: string, position: Position, commit?: boolean) => void
  updateSize: (id: string, size: Size, commit?: boolean) => void
  setActiveGuides: (g: { x: number | null; y: number | null }) => void

  // content
  setContentSource: (id: string, source: ContentSourceType) => void
  addCustomItem: (id: string, text?: string) => void
  updateCustomItem: (id: string, itemId: string, text: string) => void
  removeCustomItem: (id: string, itemId: string) => void
  reorderCustomItems: (id: string, fromIndex: number, toIndex: number) => void
  addHeadlineItem: (id: string, text?: string) => void
  updateHeadlineItem: (id: string, itemId: string, text: string) => void
  removeHeadlineItem: (id: string, itemId: string) => void
  reorderHeadlineItems: (id: string, fromIndex: number, toIndex: number) => void
  setTopBadgeText: (id: string, text: string) => void
  setBottomBadgeText: (id: string, text: string) => void
  setRssUrl: (id: string, url: string) => void
  fetchRss: (id: string) => Promise<void>
  setRssField: (id: string, field: keyof RssField, value: boolean) => void
  setHeadlineContentSource: (id: string, source: ContentSourceType) => void
  setHeadlineRssUrl: (id: string, url: string) => void
  fetchHeadlineRss: (id: string) => Promise<void>
  setHeadlineRssField: (id: string, field: keyof RssField, value: boolean) => void

  // presets & customization
  applyPreset: (id: string, preset: PresetId) => void
  updateAppearance: (id: string, patch: Partial<Appearance>) => void
  updateTypography: (id: string, patch: Partial<Typography>) => void
  updateHeadlineTypography: (id: string, patch: Partial<Typography>) => void
  resetHeadlineTypography: (id: string) => void
  updateAnimation: (id: string, patch: Partial<AnimationConfig>) => void
  renameTicker: (id: string, name: string) => void

  // canvas chrome
  setZoom: (z: number) => void
  toggleGuides: () => void
  toggleSnap: () => void

  // history
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // save / publish
  markDirty: () => void
  save: () => void
  publish: () => void
}

const MAX_HISTORY = 50

function touch(t: Ticker): Ticker {
  return { ...t, updatedAt: new Date().toISOString() }
}

export const useStudioStore = create<StudioState>((set, get) => ({
  tickers: [],
  selectedId: null,
  saveState: 'saved',
  zoom: 100,
  showGuides: true,
  snapToGuides: true,
  activeGuides: { x: null, y: null },
  past: [],
  future: [],

  selectTicker: (id) => set({ selectedId: id }),

  addTicker: (name, preset, source) => {
    get().pushHistory()
    const t = createTicker({ name, preset })
    t.contentSource = source
    if (source === 'rss') {
      t.rssFeed = { url: '', items: [], fields: { headline: true, source: true, date: false } }
    }
    set({
      tickers: [t],
      selectedId: t.id,
      saveState: 'unsaved',
    })
  },

  deleteTicker: (id) => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.filter((t) => t.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      saveState: 'unsaved',
    }))
  },

  toggleVisible: (id) =>
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, visible: !t.visible }) : t)),
      saveState: 'unsaved',
    })),

  toggleLocked: (id) =>
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, locked: !t.locked }) : t)),
      saveState: 'unsaved',
    })),

  updatePosition: (id, position, commit) => {
    if (commit) get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? { ...t, position } : t)),
      saveState: 'unsaved',
    }))
  },

  updateSize: (id, size, commit) => {
    if (commit) get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? { ...t, size } : t)),
      saveState: 'unsaved',
    }))
  },

  setActiveGuides: (g) => set({ activeGuides: g }),

  setContentSource: (id, source) => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) => {
        if (t.id !== id) return t
        const rssFeed: RssFeedConfig | null =
          source === 'rss' ? (t.rssFeed ?? { url: '', items: [], fields: { headline: true, source: true, date: false } }) : t.rssFeed
        return touch({ ...t, contentSource: source, rssFeed })
      }),
      saveState: 'unsaved',
    }))
  },

  addCustomItem: (id, text = 'New ticker item') => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, customItems: [...t.customItems, { id: nanoid(6), text }] }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  updateCustomItem: (id, itemId, text) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id
          ? touch({ ...t, customItems: t.customItems.map((i) => (i.id === itemId ? { ...i, text } : i)) })
          : t,
      ),
      saveState: 'unsaved',
    }))
  },

  removeCustomItem: (id, itemId) => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, customItems: t.customItems.filter((i) => i.id !== itemId) }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  reorderCustomItems: (id, fromIndex, toIndex) => {
    set((s) => ({
      tickers: s.tickers.map((t) => {
        if (t.id !== id) return t
        const items = [...t.customItems]
        const [moved] = items.splice(fromIndex, 1)
        items.splice(toIndex, 0, moved)
        return touch({ ...t, customItems: items })
      }),
      saveState: 'unsaved',
    }))
  },

  addHeadlineItem: (id, text = 'New headline') => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, headlineItems: [...t.headlineItems, { id: nanoid(6), text }] }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  updateHeadlineItem: (id, itemId, text) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id
          ? touch({ ...t, headlineItems: t.headlineItems.map((i) => (i.id === itemId ? { ...i, text } : i)) })
          : t,
      ),
      saveState: 'unsaved',
    }))
  },

  removeHeadlineItem: (id, itemId) => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, headlineItems: t.headlineItems.filter((i) => i.id !== itemId) }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  reorderHeadlineItems: (id, fromIndex, toIndex) => {
    set((s) => ({
      tickers: s.tickers.map((t) => {
        if (t.id !== id) return t
        const items = [...t.headlineItems]
        const [moved] = items.splice(fromIndex, 1)
        items.splice(toIndex, 0, moved)
        return touch({ ...t, headlineItems: items })
      }),
      saveState: 'unsaved',
    }))
  },

  setHeadlineContentSource: (id, source) => {
    get().pushHistory()
    set((s) => ({
      tickers: s.tickers.map((t) => {
        if (t.id !== id) return t
        const headlineRssFeed: RssFeedConfig | null =
          source === 'rss'
            ? (t.headlineRssFeed ?? { url: '', items: [], fields: { headline: true, source: true, date: false } })
            : t.headlineRssFeed
        return touch({ ...t, headlineContentSource: source, headlineRssFeed })
      }),
      saveState: 'unsaved',
    }))
  },

  setHeadlineRssUrl: (id, url) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id && t.headlineRssFeed ? touch({ ...t, headlineRssFeed: { ...t.headlineRssFeed, url } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  fetchHeadlineRss: async (id) => {
    const t = get().tickers.find((x) => x.id === id)
    if (!t?.headlineRssFeed?.url) return
    const items = await fetchRssFeed(t.headlineRssFeed.url)
    set((s) => ({
      tickers: s.tickers.map((x) =>
        x.id === id && x.headlineRssFeed
          ? touch({ ...x, headlineRssFeed: { ...x.headlineRssFeed, items, lastFetchedAt: new Date().toISOString() } })
          : x,
      ),
      saveState: 'unsaved',
    }))
  },

  setHeadlineRssField: (id, field, value) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id && t.headlineRssFeed
          ? touch({ ...t, headlineRssFeed: { ...t.headlineRssFeed, fields: { ...t.headlineRssFeed.fields, [field]: value } } })
          : t,
      ),
      saveState: 'unsaved',
    }))
  },

  setTopBadgeText: (id, text) => {
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, topBadgeText: text }) : t)),
      saveState: 'unsaved',
    }))
  },

  setBottomBadgeText: (id, text) => {
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, bottomBadgeText: text }) : t)),
      saveState: 'unsaved',
    }))
  },

  setRssUrl: (id, url) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id && t.rssFeed ? touch({ ...t, rssFeed: { ...t.rssFeed, url } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  fetchRss: async (id) => {
    const t = get().tickers.find((x) => x.id === id)
    if (!t?.rssFeed?.url) return
    const items = await fetchRssFeed(t.rssFeed.url)
    set((s) => ({
      tickers: s.tickers.map((x) =>
        x.id === id && x.rssFeed
          ? touch({ ...x, rssFeed: { ...x.rssFeed, items, lastFetchedAt: new Date().toISOString() } })
          : x,
      ),
      saveState: 'unsaved',
    }))
  },

  setRssField: (id, field, value) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id && t.rssFeed
          ? touch({ ...t, rssFeed: { ...t.rssFeed, fields: { ...t.rssFeed.fields, [field]: value } } })
          : t,
      ),
      saveState: 'unsaved',
    }))
  },

  applyPreset: (id, preset) => {
    get().pushHistory()
    const def = getPreset(preset)
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id
          ? touch({
              ...t,
              preset,
              name: def.label,
              appearance: { ...def.appearance },
              typography: { ...def.typography },
              animation: { ...def.animation },
              size: { ...t.size, height: def.appearance.height },
            })
          : t,
      ),
      saveState: 'unsaved',
    }))
  },

  updateAppearance: (id, patch) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, appearance: { ...t.appearance, ...patch } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  updateTypography: (id, patch) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, typography: { ...t.typography, ...patch } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  updateHeadlineTypography: (id, patch) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, headlineTypography: { ...t.headlineTypography, ...patch } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  resetHeadlineTypography: (id) => {
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, headlineTypography: {} }) : t)),
      saveState: 'unsaved',
    }))
  },

  updateAnimation: (id, patch) => {
    set((s) => ({
      tickers: s.tickers.map((t) =>
        t.id === id ? touch({ ...t, animation: { ...t.animation, ...patch } }) : t,
      ),
      saveState: 'unsaved',
    }))
  },

  renameTicker: (id, name) => {
    set((s) => ({
      tickers: s.tickers.map((t) => (t.id === id ? touch({ ...t, name }) : t)),
      saveState: 'unsaved',
    }))
  },

  setZoom: (z) => set({ zoom: Math.min(200, Math.max(25, z)) }),
  toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
  toggleSnap: () => set((s) => ({ snapToGuides: !s.snapToGuides })),

  pushHistory: () => {
    const { tickers, past } = get()
    const snapshot: HistoryEntry = { tickers: tickers.map((t) => ({ ...t })) }
    const nextPast = [...past, snapshot].slice(-MAX_HISTORY)
    set({ past: nextPast, future: [] })
  },

  undo: () => {
    const { past, tickers, future } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    set({
      tickers: prev.tickers,
      past: past.slice(0, -1),
      future: [{ tickers }, ...future].slice(0, MAX_HISTORY),
      saveState: 'unsaved',
    })
  },

  redo: () => {
    const { future, tickers, past } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      tickers: next.tickers,
      future: future.slice(1),
      past: [...past, { tickers }].slice(-MAX_HISTORY),
      saveState: 'unsaved',
    })
  },

  markDirty: () => set({ saveState: 'unsaved' }),
  save: () => set({ saveState: 'saved' }),
  publish: () => set({ saveState: 'published' }),
}))

export const selectTickerById = (id: string | null) => (s: StudioState) =>
  id ? s.tickers.find((t) => t.id === id) ?? null : null
