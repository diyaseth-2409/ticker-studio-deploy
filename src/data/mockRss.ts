import { nanoid } from 'nanoid'
import type { RssItem } from '@/types/ticker'

// Common feed sources offered as quick picks — selecting one just fills the
// URL field, the actual fetch still goes through fetchRssFeed below.
export const PRESET_RSS_FEEDS: { label: string; url: string }[] = [
  { label: 'BBC News — Top Stories', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { label: 'Reuters — World News', url: 'https://www.reutersagency.com/feed/?best-topics=world' },
  { label: 'ESPN — Top Headlines', url: 'https://www.espn.com/espn/rss/news' },
  { label: 'Economic Times — Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { label: 'PTI — National News', url: 'https://www.ptinews.com/rss/national.xml' },
  { label: 'Al Jazeera — All News', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
]

// Mock RSS fetch. Structured to mirror a real fetch signature so a live
// backend (e.g. GET /api/rss?url=...) can swap in without touching callers.
export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  await new Promise((r) => setTimeout(r, 650)) // simulate network latency

  const seed = url.toLowerCase()
  const pool: Omit<RssItem, 'id'>[] = seed.includes('sport')
    ? [
        { headline: 'India clinches series with dominant final-day win', source: 'ESPN', date: '2h ago' },
        { headline: 'Transfer window: three clubs chase midfield star', source: 'Sky Sports', date: '4h ago' },
        { headline: 'Injury update ahead of weekend fixtures', source: 'BBC Sport', date: '6h ago' },
        { headline: 'Olympic qualifiers schedule confirmed for 2027', source: 'Reuters', date: '9h ago' },
      ]
    : seed.includes('business') || seed.includes('market')
      ? [
          { headline: 'Sensex opens flat as investors await Fed cues', source: 'Economic Times', date: '1h ago' },
          { headline: 'Rupee steadies against dollar in early trade', source: 'Moneycontrol', date: '3h ago' },
          { headline: 'IT stocks rally on strong quarterly guidance', source: 'Bloomberg', date: '5h ago' },
          { headline: 'RBI holds repo rate steady for third straight meeting', source: 'Reuters', date: '8h ago' },
        ]
      : [
          { headline: 'Parliament session begins with key bills on agenda', source: 'PTI', date: '1h ago' },
          { headline: 'Heavy rainfall warning issued for coastal regions', source: 'IMD', date: '2h ago' },
          { headline: 'Government announces new infrastructure package', source: 'ANI', date: '4h ago' },
          { headline: 'Global leaders to meet for climate summit next week', source: 'Reuters', date: '7h ago' },
          { headline: 'Tech sector adds record jobs in latest quarter', source: 'Economic Times', date: '10h ago' },
        ]

  return pool.map((item) => ({ ...item, id: nanoid(6) }))
}
