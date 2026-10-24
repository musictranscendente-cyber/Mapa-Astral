import { chartFromBirth, type Chart } from './chart'
import { synastryAspects, synastryScore, type SynScore } from './synastry'

export interface QuickPerson { name: string; date: string /* YYYY-MM-DD */ }

/** Chart from a birth date only (noon, no houses) — enough for Sun, planets and an approximate Moon. */
export function dateOnlyChart(p: QuickPerson): Chart {
  const [year, month, day] = p.date.split('-').map(Number)
  return chartFromBirth({
    name: p.name, local: { year, month, day, hour: 12, minute: 0 }, timeZone: 'America/Sao_Paulo',
    latitude: -15.79, longitude: -47.88, place: '', timeUnknown: true,
  })
}

export function quickSintonia(a: QuickPerson, b: QuickPerson): { ca: Chart; cb: Chart; score: SynScore } {
  const ca = dateOnlyChart(a)
  const cb = dateOnlyChart(b)
  return { ca, cb, score: synastryScore(synastryAspects(ca, cb)) }
}
