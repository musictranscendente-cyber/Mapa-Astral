import { norm360, type PointKey } from '../astro/constants'

export const WHEEL_POINTS: PointKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'chiron', 'node', 'lilith', 'fortune',
]

export const OUTER_POINTS: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node']

/** Spread labels apart so glyphs never overlap, keeping order. */
export function spread(items: { key: PointKey; lon: number }[], minGap: number) {
  const sorted = [...items].sort((a, b) => a.lon - b.lon).map((p) => ({ ...p, pos: p.lon }))
  for (let iter = 0; iter < 60; iter++) {
    let moved = false
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i]
      const b = sorted[(i + 1) % sorted.length]
      if (sorted.length < 2) break
      const gap = norm360(b.pos - a.pos)
      if (gap < minGap && !(i === sorted.length - 1 && gap > 180)) {
        const push = (minGap - gap) / 2
        a.pos = norm360(a.pos - push)
        b.pos = norm360(b.pos + push)
        moved = true
      }
    }
    if (!moved) break
  }
  return sorted
}
