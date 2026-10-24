import * as A from 'astronomy-engine'
import type { Chart } from './chart'
import { ASPECT_POINTS, aspectBetween } from './chart'
import { signOf, type AspectInfo, type PointKey } from './constants'
import { bodyLongitude, toTime } from './ephemeris'
import { houseOf } from './houses'

export type LunationKind = 'nova' | 'cheia'
export type EclipseKind = 'total' | 'anular' | 'parcial' | 'penumbral' | 'híbrido'

export interface Lunation {
  kind: LunationKind
  date: Date
  /** Ecliptic longitude of the Moon at the exact phase (new moon: same as the Sun). */
  lon: number
  sign: number
  eclipse: EclipseKind | null
}

export interface NatalContact { point: PointKey; type: AspectInfo; orb: number }

export interface PersonalLunation extends Lunation {
  house: number | null
  contacts: NatalContact[]
}

const ECLIPSE_NAME: Record<string, EclipseKind> = { total: 'total', annular: 'anular', partial: 'parcial', penumbral: 'penumbral', hybrid: 'híbrido' }

/** New and full moons (and the eclipses among them) from `from` for `months` months. */
export function lunations(from: Date, months = 12): Lunation[] {
  const end = new Date(from)
  end.setMonth(end.getMonth() + months)
  const eclipses: { date: Date; kind: EclipseKind; solar: boolean }[] = []
  for (let e = A.SearchLunarEclipse(from); e.peak.date < end; e = A.NextLunarEclipse(e.peak)) {
    eclipses.push({ date: e.peak.date, kind: ECLIPSE_NAME[e.kind] ?? 'parcial', solar: false })
  }
  for (let e = A.SearchGlobalSolarEclipse(from); e.peak.date < end; e = A.NextGlobalSolarEclipse(e.peak)) {
    eclipses.push({ date: e.peak.date, kind: ECLIPSE_NAME[e.kind] ?? 'parcial', solar: true })
  }
  const out: Lunation[] = []
  for (let q = A.SearchMoonQuarter(from); q.time.date < end; q = A.NextMoonQuarter(q)) {
    if (q.quarter !== 0 && q.quarter !== 2) continue
    const kind: LunationKind = q.quarter === 0 ? 'nova' : 'cheia'
    const date = q.time.date
    const lon = bodyLongitude('moon', toTime(date))
    const ecl = eclipses.find((e) => e.solar === (kind === 'nova') && Math.abs(e.date.getTime() - date.getTime()) < 2 * 86400000)
    out.push({ kind, date: ecl?.date ?? date, lon, sign: signOf(lon), eclipse: ecl?.kind ?? null })
  }
  return out
}

/** Adds the natal house and close contacts with natal points (eclipses get a wider orb). */
export function personalize(l: Lunation, natal: Chart): PersonalLunation {
  const orbLimit = l.eclipse ? 4 : 3
  const contacts: NatalContact[] = []
  for (const k of ASPECT_POINTS) {
    if (!natal.hasHouses && (k === 'asc' || k === 'mc')) continue
    const hit = aspectBetween(l.lon, natal.points[k].lon, 'moon', k)
    if (hit && hit.type.major && hit.type.key !== 'sextile' && hit.orb <= orbLimit) contacts.push({ point: k, type: hit.type, orb: hit.orb })
  }
  contacts.sort((a, b) => a.orb - b.orb)
  return { ...l, house: natal.hasHouses ? houseOf(l.lon, natal.cusps) : null, contacts }
}
