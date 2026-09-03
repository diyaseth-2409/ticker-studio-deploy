import { nanoid } from 'nanoid'
import type { PresetId, Ticker } from '@/types/ticker'
import { getPreset } from '@/data/presets'

let placementCounter = 0

const DEFAULT_ITEMS = [
  'Breaking news: Parliament session begins today',
  'Delhi records heavy rainfall',
  'India announces new economic measures',
  'Team India announces squad',
]

export function createTicker(opts: {
  name: string
  preset: PresetId
  index: number
}): Ticker {
  const preset = getPreset(opts.preset)
  const now = new Date().toISOString()
  // Stagger default placement so stacked tickers don't fully overlap.
  const slot = placementCounter++
  const y = 78 - (slot % 4) * 16

  return {
    id: nanoid(8),
    kind: 'ticker',
    name: opts.name,
    preset: opts.preset,
    contentSource: 'custom',
    customItems: DEFAULT_ITEMS.map((text) => ({ id: nanoid(6), text })),
    rssFeed: null,
    appearance: { ...preset.appearance },
    typography: { ...preset.typography },
    animation: { ...preset.animation },
    position: { x: 4, y: Math.max(4, y) },
    size: { width: 92, height: preset.appearance.height },
    zIndex: opts.index + 1,
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now,
  }
}
