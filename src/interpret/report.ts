import type { Chart } from '../astro/chart'
import {
  ELEMENT_INFO, MODALITY_INFO, POINTS, SIGNS, formatDegree,
  type Element, type Modality, type PlanetKey, type PointKey,
} from '../astro/constants'
import { natalAspectText } from './aspects'
import { HOUSE_TEXT, PLANET_TEXT, planetInHouse } from './planets'
import { SIGN_TEXT } from './signs'

export interface ReportSection {
  id: string
  title: string
  subtitle?: string
  glyph?: string
  color?: string
  paragraphs: string[]
  tags?: string[]
}

const DIGNITY_NOTE: Record<string, string> = {
  'domicílio': 'Em domicílio, este planeta está em casa: sua energia flui com naturalidade e força.',
  'exaltação': 'Em exaltação, este planeta é honrado: sua expressão é elevada e nobre.',
  'exílio': 'Em exílio, este planeta está longe de casa: pede adaptação e consciência para se expressar bem.',
  'queda': 'Em queda, este planeta precisa de cuidado: seu aprendizado é conquistado com maturidade.',
}

export function planetInSign(key: PointKey, sign: number): string {
  const p = PLANET_TEXT[key]
  const s = SIGN_TEXT[sign]
  if (!p) return ''
  return `${POINTS[key].name} em ${SIGNS[sign].name}: você ${p.verb} ${s.style}. Aqui vibram as qualidades de ${s.keywords.slice(0, 3).join(', ')}.`
}

function dominant<T extends string>(rec: Record<T, number>): { top: T; low: T; total: number } {
  const entries = Object.entries(rec) as [T, number][]
  entries.sort((a, b) => b[1] - a[1])
  return { top: entries[0][0], low: entries[entries.length - 1][0], total: entries.reduce((s, e) => s + e[1], 0) }
}

const ELEMENT_DOMINANT: Record<Element, string> = {
  fogo: 'Com predominância de Fogo, você é movido por entusiasmo, fé e ação. Sua alma precisa de propósito e inspiração; cuidado com a impaciência e o esgotamento.',
  terra: 'Com predominância de Terra, você é prático, realista e construtor. Valoriza resultados concretos e segurança; cuidado com a rigidez e o excesso de controle.',
  ar: 'Com predominância de Ar, você vive no reino das ideias, das palavras e das relações. Sua mente é ágil e social; cuidado com a desconexão das emoções e do corpo.',
  agua: 'Com predominância de Água, você sente profundamente e percebe o invisível. Sua intuição é um guia; cuidado para não se afogar nas emoções alheias.',
}

const ELEMENT_LACK: Record<Element, string> = {
  fogo: 'O Fogo é o elemento menos presente: cultivar coragem, espontaneidade e entusiasmo é parte do seu caminho.',
  terra: 'A Terra é o elemento menos presente: rotinas, contato com o corpo e a natureza ajudam a enraizar seus sonhos.',
  ar: 'O Ar é o elemento menos presente: conversar, estudar e ganhar perspectiva traz leveza à sua vida.',
  agua: 'A Água é o elemento menos presente: permitir-se sentir, chorar e acolher abre portas para a intimidade.',
}

const MODALITY_DOMINANT: Record<Modality, string> = {
  cardinal: 'A modalidade Cardinal predomina: você é iniciador, gosta de começar projetos e liderar mudanças.',
  fixo: 'A modalidade Fixa predomina: você tem enorme poder de concentração, lealdade e persistência.',
  mutavel: 'A modalidade Mutável predomina: você é adaptável, versátil e aprende com cada mudança.',
}

export function buildNatalReport(chart: Chart): ReportSection[] {
  const P = chart.points
  const sections: ReportSection[] = []
  const name = chart.birth?.name?.split(' ')[0] || 'Você'

  // Big three
  const sun = P.sun, moon = P.moon
  const pillars: string[] = [
    SIGN_TEXT[sun.sign].sun,
    SIGN_TEXT[moon.sign].moon,
  ]
  if (chart.hasHouses) pillars.push(SIGN_TEXT[P.asc.sign].asc)
  sections.push({
    id: 'pilares',
    title: 'Os Três Pilares',
    subtitle: chart.hasHouses
      ? `Sol em ${SIGNS[sun.sign].name} · Lua em ${SIGNS[moon.sign].name} · Ascendente em ${SIGNS[P.asc.sign].name}`
      : `Sol em ${SIGNS[sun.sign].name} · Lua em ${SIGNS[moon.sign].name}`,
    glyph: '✶',
    paragraphs: [
      `${name}, o Sol, a Lua e o Ascendente formam a trindade central do seu mapa: quem você é, o que você sente e como você se apresenta.`,
      ...pillars,
    ],
  })

  // Chart ruler
  if (chart.hasHouses) {
    const rulerKey = SIGNS[P.asc.sign].ruler
    const r = P[rulerKey]
    sections.push({
      id: 'regente',
      title: 'Regente do Mapa',
      subtitle: `${POINTS[rulerKey].name} em ${SIGNS[r.sign].name}, casa ${r.house}`,
      glyph: POINTS[rulerKey].glyph,
      color: POINTS[rulerKey].color,
      paragraphs: [
        `Seu Ascendente em ${SIGNS[P.asc.sign].name} é regido por ${POINTS[rulerKey].name}, que se torna o "capitão" do seu mapa. ${PLANET_TEXT[rulerKey]?.description ?? ''}`,
        `Com o regente na ${HOUSE_TEXT[r.house - 1].name}, a área de ${HOUSE_TEXT[r.house - 1].theme.toLowerCase()} se torna central na sua trajetória. ${HOUSE_TEXT[r.house - 1].description}`,
      ],
    })
  }

  // Elements
  const el = dominant(chart.balance.elements)
  const mo = dominant(chart.balance.modalities)
  const pct = (v: number, total: number) => Math.round((v / total) * 100)
  sections.push({
    id: 'elementos',
    title: 'Elementos & Ritmos',
    subtitle: `Dominante: ${ELEMENT_INFO[el.top].name} · ${MODALITY_INFO[mo.top].name}`,
    glyph: '❂',
    paragraphs: [
      ELEMENT_DOMINANT[el.top],
      ELEMENT_LACK[el.low],
      MODALITY_DOMINANT[mo.top],
      `Distribuição: ${(Object.keys(chart.balance.elements) as Element[]).map((e) => `${ELEMENT_INFO[e].name} ${pct(chart.balance.elements[e], el.total)}%`).join(' · ')}.`,
    ],
  })

  // Planets
  const planets: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
  for (const k of planets) {
    const p = P[k]
    const paras = [PLANET_TEXT[k]!.description, planetInSign(k, p.sign)]
    if (p.dignity) paras.push(DIGNITY_NOTE[p.dignity])
    if (p.retro) paras.push(`${POINTS[k].name} estava retrógrado no seu nascimento: a energia se volta para dentro, pedindo revisão, reflexão e um modo muito pessoal de expressão.`)
    if (chart.hasHouses) paras.push(planetInHouse(k, p.house))
    sections.push({
      id: `planeta-${k}`,
      title: `${POINTS[k].name} em ${SIGNS[p.sign].name}`,
      subtitle: `${formatDegree(p.lon)}${chart.hasHouses ? ` · Casa ${p.house}` : ''}${p.retro ? ' · Retrógrado' : ''}${p.dignity ? ` · ${p.dignity}` : ''}`,
      glyph: POINTS[k].glyph,
      color: POINTS[k].color,
      paragraphs: paras,
      tags: PLANET_TEXT[k]!.keywords,
    })
  }

  // Nodes
  const node = P.node
  sections.push({
    id: 'nodos',
    title: 'Eixo do Destino',
    subtitle: `Nodo Norte em ${SIGNS[node.sign].name} · Nodo Sul em ${SIGNS[P.southNode.sign].name}`,
    glyph: POINTS.node.glyph,
    color: POINTS.node.color,
    paragraphs: [
      `Os Nodos Lunares desenham o eixo evolutivo da alma. O Nodo Sul em ${SIGNS[P.southNode.sign].name} mostra talentos já conhecidos — ${SIGN_TEXT[P.southNode.sign].light.toLowerCase()} — mas também a zona de conforto que pode aprisionar.`,
      `O Nodo Norte em ${SIGNS[node.sign].name} aponta para onde crescer: desenvolver ${SIGN_TEXT[node.sign].keywords.slice(0, 3).join(', ')}. ${chart.hasHouses ? `Na ${HOUSE_TEXT[node.house - 1].name}, esse chamado se realiza através de ${HOUSE_TEXT[node.house - 1].keywords.join(', ')}.` : ''}`,
    ],
  })

  // Lilith
  sections.push({
    id: 'lilith',
    title: `Lilith em ${SIGNS[P.lilith.sign].name}`,
    subtitle: formatDegree(P.lilith.lon) + (chart.hasHouses ? ` · Casa ${P.lilith.house}` : ''),
    glyph: POINTS.lilith.glyph,
    color: POINTS.lilith.color,
    paragraphs: [
      PLANET_TEXT.lilith!.description,
      `Em ${SIGNS[P.lilith.sign].name}, sua força selvagem se expressa ${SIGN_TEXT[P.lilith.sign].style}. A sombra a integrar: ${SIGN_TEXT[P.lilith.sign].shadow.toLowerCase()}`,
    ],
  })

  // Aspects
  const major = chart.aspects.filter((a) => a.type.major).slice(0, 14)
  sections.push({
    id: 'aspectos',
    title: 'Diálogos Planetários',
    subtitle: `${chart.aspects.length} aspectos — os mais exatos`,
    glyph: '✧',
    paragraphs: major.map((a) => `${a.type.name} (${a.orb.toFixed(1)}°) — ${natalAspectText(a.a, a.b, a.type.key)}`),
  })

  return sections
}

const MOON_SIGN_DAY: string[] = [
  'Lua em Áries: dia de iniciativa e coragem. Emoções rápidas — aja, mas evite discussões impulsivas.',
  'Lua em Touro: dia de calma, prazeres simples e cuidado com o corpo. Bom para finanças e beleza.',
  'Lua em Gêmeos: dia de conversas, trocas e aprendizado. A mente acelera — anote suas ideias.',
  'Lua em Câncer: dia de acolhimento, lar e família. A sensibilidade está à flor da pele.',
  'Lua em Leão: dia de brilho, criatividade e celebração. Expresse seu coração.',
  'Lua em Virgem: dia de organização, saúde e produtividade. Cuide dos detalhes.',
  'Lua em Libra: dia de harmonia, encontros e estética. Ótimo para parcerias e diplomacia.',
  'Lua em Escorpião: dia intenso e profundo. Bom para terapia, intimidade e investigação.',
  'Lua em Sagitário: dia de otimismo, estudos e expansão. Pense grande.',
  'Lua em Capricórnio: dia de foco, responsabilidade e estratégia. Construa com paciência.',
  'Lua em Aquário: dia de ideias novas, amigos e liberdade. Saia da rotina.',
  'Lua em Peixes: dia de intuição, arte e espiritualidade. Medite, sonhe, descanse.',
]

export const moonSignOfDayText = (sign: number) => MOON_SIGN_DAY[sign]

export const RETRO_TEXT: Partial<Record<PlanetKey, string>> = {
  mercury: 'Mercúrio retrógrado: revise contratos, comunicações e planos. Ótimo para retomar o que ficou pendente.',
  venus: 'Vênus retrógrada: reavaliação de afetos, valores e finanças. Amores do passado podem reaparecer.',
  mars: 'Marte retrógrado: energia voltada para dentro. Reveja estratégias antes de agir.',
  jupiter: 'Júpiter retrógrado: crescimento interior, revisão de crenças e da fé.',
  saturn: 'Saturno retrógrado: revisão de estruturas, responsabilidades e limites.',
  uranus: 'Urano retrógrado: libertação interior e revisão de mudanças.',
  neptune: 'Netuno retrógrado: clareza sobre ilusões; espiritualidade introspectiva.',
  pluto: 'Plutão retrógrado: transformação silenciosa e profunda.',
}
