import type { PlanetKey } from './constants'
import { ASPECTS, angDiff, type AspectKey } from './constants'
import { bodyLongitude, bodySpeed, moonPhaseInfo, toTime } from './ephemeris'
import { byLang } from '../i18n'

/**
 * Daily horoscope by Sun sign ("solar houses"): the sign is taken as the 1st house and
 * each planet falls in the whole-sign house counted from it. Positions are real, for the
 * chosen day at 12:00 local time.
 */

export type Relation = 'conjuncao' | 'sextil' | 'quadratura' | 'trigono' | 'oposicao' | 'neutro'

const RELATION_BY_DISTANCE: Relation[] = ['conjuncao', 'neutro', 'sextil', 'quadratura', 'trigono', 'neutro', 'oposicao', 'neutro', 'trigono', 'quadratura', 'sextil', 'neutro']
const RELATION_SCORE: Record<Relation, number> = { conjuncao: 1, sextil: 1, trigono: 2, quadratura: -1.5, oposicao: -1, neutro: -0.3 }

export interface PlanetInSign { key: PlanetKey; sign: number; house: number; relation: Relation; retro: boolean }

export interface DayAspect { a: PlanetKey; b: PlanetKey; key: AspectKey; type: string; harmonious: boolean; houseA: number; houseB: number }

export interface Horoscope {
  sign: number
  date: Date
  planets: Record<'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn', PlanetInSign>
  /** 1 to 5 stars. */
  scores: { amor: number; trabalho: number; energia: number; geral: number }
  /** Moon changes sign during the day: hour (local) and new sign. */
  moonIngress: { at: Date; sign: number } | null
  aspect: DayAspect | null
  phase: ReturnType<typeof moonPhaseInfo>
}

const DAY_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const
const SLOWER_FIRST: PlanetKey[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

const stars = (score: number) => Math.max(1, Math.min(5, Math.round(3 + score / 2)))

function moonIngress(dayStart: Date): { at: Date; sign: number } | null {
  const end = new Date(dayStart.getTime() + 86400000)
  const s0 = Math.floor(bodyLongitude('moon', toTime(dayStart)) / 30)
  const s1 = Math.floor(bodyLongitude('moon', toTime(end)) / 30)
  if (s0 === s1) return null
  let lo = dayStart.getTime()
  let hi = end.getTime()
  while (hi - lo > 60000) {
    const mid = (lo + hi) / 2
    if (Math.floor(bodyLongitude('moon', toTime(new Date(mid))) / 30) === s0) lo = mid
    else hi = mid
  }
  return { at: new Date(hi), sign: s1 }
}

/** Tightest aspect between two of the planets (Moon excluded) at noon, within 1.5°. */
function aspectOfDay(t: ReturnType<typeof toTime>, sign: number): DayAspect | null {
  const lon = Object.fromEntries(SLOWER_FIRST.map((k) => [k, bodyLongitude(k, t)])) as Record<PlanetKey, number>
  let best: (DayAspect & { orb: number }) | null = null
  for (let i = 0; i < SLOWER_FIRST.length; i++) {
    for (let j = i + 1; j < SLOWER_FIRST.length; j++) {
      const a = SLOWER_FIRST[i]
      const b = SLOWER_FIRST[j]
      if (i >= 5 && j >= 5) continue // outer-to-outer aspects last for months: not "of the day"
      const sep = Math.abs(angDiff(lon[a], lon[b]))
      for (const type of ASPECTS) {
        if (!type.major) continue
        const orb = Math.abs(sep - type.angle)
        if (orb <= 1.5 && (!best || orb < best.orb)) {
          best = {
            a, b, key: type.key, type: type.name.toLowerCase(), harmonious: type.nature !== 'tenso', orb,
            houseA: ((Math.floor(lon[a] / 30) - sign + 12) % 12) + 1,
            houseB: ((Math.floor(lon[b] / 30) - sign + 12) % 12) + 1,
          }
        }
      }
    }
  }
  return best
}

export function horoscope(sign: number, day: Date): Horoscope {
  const noon = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12)
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const t = toTime(noon)
  const planets = {} as Horoscope['planets']
  for (const k of DAY_PLANETS) {
    const s = Math.floor(bodyLongitude(k, t) / 30)
    const dist = (s - sign + 12) % 12
    planets[k] = { key: k, sign: s, house: dist + 1, relation: RELATION_BY_DISTANCE[dist], retro: k !== 'sun' && k !== 'moon' && bodySpeed(k, t) < 0 }
  }
  const r = (k: keyof typeof planets) => RELATION_SCORE[planets[k].relation]
  const inHouses = (k: keyof typeof planets, hs: number[]) => (hs.includes(planets[k].house) ? 1 : 0)
  const amor = r('venus') * 1.5 + r('moon') + inHouses('venus', [1, 5, 7]) + inHouses('moon', [5, 7]) * 0.5
  const trabalho = r('sun') + r('mars') + r('saturn') * 0.5 + inHouses('sun', [6, 10]) + inHouses('mars', [10]) - (planets.mercury.retro ? 0.5 : 0)
  const energia = r('mars') * 1.5 + r('sun') + r('moon') + inHouses('moon', [1, 5])
  return {
    sign,
    date: noon,
    planets,
    scores: { amor: stars(amor), trabalho: stars(trabalho), energia: stars(energia), geral: stars((amor + trabalho + energia) / 2) },
    moonIngress: moonIngress(start),
    aspect: aspectOfDay(t, sign),
    phase: moonPhaseInfo(noon),
  }
}

/** Traditional Sun-sign dates (they shift by a day in some years). */
const SIGN_DATES_PT = [
  '21/3 a 19/4', '20/4 a 20/5', '21/5 a 20/6', '21/6 a 22/7', '23/7 a 22/8', '23/8 a 22/9',
  '23/9 a 22/10', '23/10 a 21/11', '22/11 a 21/12', '22/12 a 19/1', '20/1 a 18/2', '19/2 a 20/3',
]
export const SIGN_DATES = byLang({
  pt: SIGN_DATES_PT,
  en: ['Mar 21 – Apr 19', 'Apr 20 – May 20', 'May 21 – Jun 20', 'Jun 21 – Jul 22', 'Jul 23 – Aug 22', 'Aug 23 – Sep 22',
    'Sep 23 – Oct 22', 'Oct 23 – Nov 21', 'Nov 22 – Dec 21', 'Dec 22 – Jan 19', 'Jan 20 – Feb 18', 'Feb 19 – Mar 20'],
  es: SIGN_DATES_PT.map((d) => d.replace(' a ', ' al ')),
})
