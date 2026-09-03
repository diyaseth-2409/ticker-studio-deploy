# Ticker Studio

Broadcast-graphics editor focused on Tickers — a Restream Studio–style workspace: pick a preset, add content, customize appearance/animation, then drag/resize/position multiple ticker layers on a live 16:9 preview.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (app state, undo/redo history)
- @dnd-kit (layer reordering)
- lucide-react (icons)

## Run

```bash
npm install
npm run dev
```

Build: `npm run build`. Typecheck: `npx tsc -b`.

## Structure

- `src/types/ticker.ts` — data model (`Ticker`, appearance, typography, animation, RSS/custom content source). `GraphicKind` is deliberately extensible for future graphic types (captions, widgets, lower thirds, alerts).
- `src/store/useStudioStore.ts` — single Zustand store: ticker CRUD, selection, canvas transforms, undo/redo, save/publish state.
- `src/data/presets.ts` — the 10 ticker presets (visual configs only; content is untouched when a preset is applied).
- `src/data/mockRss.ts` — mock RSS fetch, shaped like a real `GET /api/rss?url=` call so a backend can drop in later.
- `src/components/canvas/` — the live preview canvas, draggable/resizable ticker layers, guides/snapping, toolbar.
- `src/components/panel/` — right-sidebar configuration sections (presets, content source, appearance, animation, layers).
- `src/components/AddTickerModal.tsx` — 3-step add-ticker flow (style → content source → name).

## Notes

- RSS fetching is mocked with realistic sample headlines; swap `fetchRssFeed` in `src/data/mockRss.ts` for a real endpoint.
- Only the Ticker graphic type is implemented; the data model and component boundaries are structured so Closed Captions/Widgets/Lower Thirds/Alerts can be added as sibling types later.
