import { aspectBetween, type Chart } from './chart'
import { POINTS, type AspectInfo, type PointKey } from './constants'
import { houseOf } from './houses'

/** Points compared between two charts. */
export const SYN_POINTS: PointKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'node', 'asc', 'mc',
]

export interface SynAspect {
  a: PointKey // point of person A
  b: PointKey // point of person B
  type: AspectInfo
  orb: number
  weight: number
}

const PAIR_WEIGHT: Partial<Record<PointKey, number>> = {
  sun: 3, moon: 3, venus: 3, mars: 2.6, asc: 2.4, mercury: 1.8,
  jupiter: 1.4, saturn: 1.8, mc: 1.2, uranus: 0.8, neptune: 0.9, pluto: 1.1, node: 1,
}

export function synastryAspects(A: Chart, B: Chart): SynAspect[] {
  const keysA = SYN_POINTS.filter((k) => A.hasHouses || (k !== 'asc' && k !== 'mc'))
  const keysB = SYN_POINTS.filter((k) => B.hasHouses || (k !== 'asc' && k !== 'mc'))
  const out: SynAspect[] = []
  for (const a of keysA) {
    for (const b of keysB) {
      // Outer–outer contacts are generational, not personal.
      const outer = (k: PointKey) => k === 'uranus' || k === 'neptune' || k === 'pluto' || k === 'node'
      if (outer(a) && outer(b)) continue
      if ((a === 'mc' || a === 'asc') && (b === 'mc' || b === 'asc') && a !== b) continue
      const hit = aspectBetween(A.points[a].lon, B.points[b].lon, a, b, 0.75)
      if (!hit || !hit.type.major) continue
      const tight = 1 - hit.orb / (hit.type.orb + 2)
      out.push({
        a, b, type: hit.type, orb: hit.orb,
        weight: (PAIR_WEIGHT[a] ?? 1) * (PAIR_WEIGHT[b] ?? 1) * (0.4 + 0.6 * Math.max(0, tight)),
      })
    }
  }
  return out.sort((x, y) => y.weight - x.weight)
}

export interface HouseOverlay {
  planet: PointKey
  house: number
}

/** Where the planets of `guest` fall in the houses of `host`. */
export function houseOverlays(host: Chart, guest: Chart): HouseOverlay[] {
  if (!host.hasHouses) return []
  const planets: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
  return planets.map((p) => ({ planet: p, house: houseOf(guest.points[p].lon, host.cusps) }))
}

export type SynArea = 'atracao' | 'emocional' | 'comunicacao' | 'romance' | 'estabilidade' | 'crescimento'

export const SYN_AREAS: { key: SynArea; name: string; icon: string; color: string; desc: string }[] = [
  { key: 'atracao', name: 'Atração & Química', icon: '♂', color: '#ff6b6b', desc: 'Magnetismo físico e desejo (Marte, Vênus, Plutão).' },
  { key: 'emocional', name: 'Sintonia Emocional', icon: '☽', color: '#c5b3ff', desc: 'Sentir-se em casa um com o outro (Lua, Sol, Netuno).' },
  { key: 'comunicacao', name: 'Comunicação', icon: '☿', color: '#7cc7ff', desc: 'Entendimento mental e diálogo (Mercúrio, Urano).' },
  { key: 'romance', name: 'Romance & Afeto', icon: '♀', color: '#ff8fc7', desc: 'Carinho, prazer e admiração mútua (Vênus, Sol, Lua).' },
  { key: 'estabilidade', name: 'Compromisso', icon: '♄', color: '#c9b37e', desc: 'Durabilidade e responsabilidade (Saturno, Ascendente).' },
  { key: 'crescimento', name: 'Crescimento Mútuo', icon: '♃', color: '#ffb86b', desc: 'Expansão, propósito e destino (Júpiter, Nodos, MC).' },
]

const AREA_PAIRS: Record<SynArea, [PointKey, PointKey][]> = {
  atracao: [['mars', 'venus'], ['mars', 'mars'], ['venus', 'pluto'], ['mars', 'pluto'], ['mars', 'asc'], ['sun', 'mars']],
  emocional: [['moon', 'moon'], ['sun', 'moon'], ['moon', 'venus'], ['moon', 'asc'], ['moon', 'neptune'], ['moon', 'saturn']],
  comunicacao: [['mercury', 'mercury'], ['mercury', 'sun'], ['mercury', 'moon'], ['mercury', 'uranus'], ['mercury', 'asc'], ['mercury', 'jupiter']],
  romance: [['venus', 'venus'], ['sun', 'venus'], ['venus', 'moon'], ['venus', 'asc'], ['venus', 'neptune'], ['venus', 'jupiter']],
  estabilidade: [['saturn', 'sun'], ['saturn', 'moon'], ['saturn', 'venus'], ['saturn', 'asc'], ['sun', 'sun'], ['saturn', 'mc']],
  crescimento: [['jupiter', 'sun'], ['jupiter', 'moon'], ['jupiter', 'venus'], ['node', 'sun'], ['node', 'moon'], ['jupiter', 'mc'], ['node', 'venus']],
}

const matches = (s: SynAspect, [x, y]: [PointKey, PointKey]) => (s.a === x && s.b === y) || (s.a === y && s.b === x)

export interface SynScore {
  total: number
  areas: Record<SynArea, number>
  harmony: number
  tension: number
}

export function synastryScore(aspects: SynAspect[]): SynScore {
  const areas = {} as Record<SynArea, number>
  let harmony = 0, tension = 0
  for (const s of aspects) {
    const v = s.type.nature === 'harmonico' ? 1 : s.type.nature === 'tenso' ? -0.55 : 0.8
    if (v > 0) harmony += s.weight * v
    else tension += -s.weight * v
  }
  for (const area of SYN_AREAS) {
    let raw = 0, energy = 0
    for (const s of aspects) {
      if (!AREA_PAIRS[area.key].some((p) => matches(s, p))) continue
      // Tense contacts still create bonds (and chemistry); they weigh less negatively than in transits.
      const v = s.type.nature === 'harmonico' ? 1 : s.type.nature === 'tenso' ? (area.key === 'atracao' ? 0.5 : -0.45) : 0.9
      raw += s.weight * v
      energy += s.weight
    }
    areas[area.key] = Math.round(Math.max(5, Math.min(98, 45 + 45 * Math.tanh(raw / 14) + 8 * Math.tanh(energy / 20))))
  }
  const total = Math.round(Object.values(areas).reduce((a, b) => a + b, 0) / SYN_AREAS.length)
  return { total, areas, harmony, tension }
}

export const synPairLabel = (s: SynAspect, nameA: string, nameB: string) =>
  `${POINTS[s.a].name} de ${nameA} ${s.type.name.toLowerCase()} ${POINTS[s.b].name} de ${nameB}`
