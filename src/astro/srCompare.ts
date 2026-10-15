import type { Chart } from './chart'
import { POINTS, angDiff, type PointKey } from './constants'

export type SrGoal = 'geral' | 'carreira' | 'amor' | 'saude' | 'espiritual'

export const SR_GOALS: { key: SrGoal; name: string; icon: string }[] = [
  { key: 'geral', name: 'Ano equilibrado', icon: '✦' },
  { key: 'carreira', name: 'Carreira e dinheiro', icon: '♛' },
  { key: 'amor', name: 'Amor e relações', icon: '♡' },
  { key: 'saude', name: 'Saúde e bem-estar', icon: '✚' },
  { key: 'espiritual', name: 'Espiritualidade e estudos', icon: '❋' },
]

export interface SrFactor {
  text: string
  points: number
}

export interface SrEvaluation {
  score: number // 0..100
  pros: SrFactor[]
  cons: SrFactor[]
  angular: { k: PointKey; angle: 'AC' | 'MC' | 'DC' | 'IC' }[]
}

const ANGLE_NAME = { AC: 'Ascendente', MC: 'Meio do Céu', DC: 'Descendente', IC: 'Fundo do Céu' } as const

/** Planets within `orb` degrees of one of the four angles. */
export function angularPlanets(sr: Chart, orb = 6): SrEvaluation['angular'] {
  const keys: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
  const angles = [['AC', sr.asc], ['MC', sr.mc], ['DC', sr.asc + 180], ['IC', sr.mc + 180]] as const
  return keys.flatMap((k) => angles
    .filter(([, lon]) => Math.abs(angDiff(lon, sr.points[k].lon)) <= orb)
    .map(([angle]) => ({ k, angle })))
}

type Table = Partial<Record<number, number>>

/** Base weights per planet and house (classic solar-return relocation criteria). */
const BASE: Partial<Record<PointKey, Table>> = {
  jupiter: { 1: 12, 10: 12, 7: 8, 4: 7, 5: 5, 9: 5, 11: 5, 2: 4, 12: -2, 8: -1 },
  venus: { 1: 9, 10: 8, 7: 7, 5: 6, 4: 5, 11: 4, 2: 4, 12: -2 },
  sun: { 10: 7, 11: 6, 1: 6, 5: 5, 9: 5, 12: -8, 8: -4, 6: -3 },
  moon: { 4: 3, 5: 3, 10: 3, 11: 3, 12: -5, 8: -3 },
  saturn: { 1: -10, 10: -8, 7: -6, 4: -5, 12: -3, 5: -2 },
  mars: { 1: -7, 7: -5, 12: -4, 10: -3, 8: -3 },
}

/** Extra weights depending on what the person wants from the year. */
const GOAL: Record<SrGoal, Partial<Record<PointKey, Table>>> = {
  geral: {},
  carreira: { sun: { 10: 8, 2: 4, 6: 3 }, jupiter: { 10: 8, 2: 6 }, venus: { 10: 4, 2: 4 }, saturn: { 10: 4 }, mars: { 10: 5 } },
  amor: { venus: { 7: 8, 5: 8, 1: 4 }, jupiter: { 7: 7, 5: 6 }, sun: { 7: 6, 5: 6 }, moon: { 7: 4, 5: 4 }, saturn: { 7: -6, 5: -4 }, mars: { 5: 3 } },
  saude: { jupiter: { 1: 6, 6: 6 }, sun: { 1: 4, 6: 2 }, venus: { 6: 3 }, mars: { 1: -5, 6: -5 }, saturn: { 1: -5, 6: -5 }, moon: { 12: -4, 6: -3 } },
  espiritual: { sun: { 9: 6, 12: 12 }, jupiter: { 9: 7, 12: 8 }, moon: { 12: 7, 9: 4 }, neptune: { 9: 5, 12: 5 }, venus: { 12: 4 } },
}

/** What the planet brings to that area: [when favorable, when challenging]. */
const PLANET_ROLE: Partial<Record<PointKey, [string, string]>> = {
  jupiter: ['proteção, sorte e oportunidades', 'expansão numa área delicada, pede moderação'],
  venus: ['harmonia, afeto e prazer', 'afetos em área delicada, pede cuidado'],
  sun: ['luz, foco e protagonismo', 'energia mais recolhida, menos visibilidade'],
  moon: ['apoio emocional e acolhimento', 'emoções mais pesadas ou solitárias'],
  saturn: ['amadurecimento e conquistas pelo esforço', 'cobranças, limites e mais esforço'],
  mars: ['energia e iniciativa', 'pressa, conflitos e desgaste'],
  neptune: ['inspiração e sensibilidade', 'confusão e falta de clareza'],
}

const HOUSE_AREA: Record<number, string> = {
  1: 'você mesmo, corpo e imagem', 2: 'dinheiro e recursos', 3: 'estudos e comunicação', 4: 'lar e família',
  5: 'romance, filhos e criatividade', 6: 'rotina, trabalho e saúde', 7: 'parcerias e casamento', 8: 'crises e transformações',
  9: 'viagens e expansão', 10: 'carreira e reconhecimento', 11: 'amigos e projetos', 12: 'isolamento e bastidores',
}

export function evaluateLocation(sr: Chart, goal: SrGoal = 'geral'): SrEvaluation {
  const pros: SrFactor[] = []
  const cons: SrFactor[] = []
  const planets = new Set<PointKey>([...Object.keys(BASE), ...Object.keys(GOAL[goal])] as PointKey[])
  for (const k of planets) {
    const house = sr.points[k].house
    const pts = (BASE[k]?.[house] ?? 0) + (GOAL[goal][k]?.[house] ?? 0)
    if (!pts) continue
    const role = PLANET_ROLE[k]?.[pts > 0 ? 0 : 1] ?? 'ganha força'
    const factor = { text: `${POINTS[k].name} na casa ${house} (${HOUSE_AREA[house]}): ${role}`, points: pts }
    ;(pts > 0 ? pros : cons).push(factor)
  }
  const angular = angularPlanets(sr)
  for (const { k, angle } of angular) {
    const hard = k === 'saturn' || k === 'mars' || k === 'pluto' || k === 'uranus'
    const soft = k === 'jupiter' || k === 'venus'
    if (hard) cons.push({ text: `${POINTS[k].name} colado ao ${ANGLE_NAME[angle]}: influência intensa e marcante no ano`, points: -5 })
    else if (soft) pros.push({ text: `${POINTS[k].name} colado ao ${ANGLE_NAME[angle]}: bênção em destaque no ano`, points: 5 })
  }
  pros.sort((a, b) => b.points - a.points)
  cons.sort((a, b) => a.points - b.points)
  const total = [...pros, ...cons].reduce((s, f) => s + f.points, 0)
  const score = Math.round(Math.max(0, Math.min(100, 50 + 50 * Math.tanh(total / 30))))
  return { score, pros, cons, angular }
}
