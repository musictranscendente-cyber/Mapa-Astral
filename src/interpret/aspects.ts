import type { AspectKey, PlanetKey, PointKey } from '../astro/constants'
import { POINTS } from '../astro/constants'
import { PLANET_TEXT } from './planets'

export const ASPECT_TEXT: Record<AspectKey, { dynamic: string; advice: string; transit: string }> = {
  conjunction: {
    dynamic: 'fundem-se numa só força — energias que agem juntas, intensificando-se mutuamente',
    advice: 'Integre essas forças conscientemente: elas são inseparáveis em você.',
    transit: 'Fusão e início de ciclo: uma nova semente é plantada.',
  },
  opposition: {
    dynamic: 'se encaram de lados opostos — uma polaridade que pede equilíbrio e muitas vezes se revela através dos relacionamentos',
    advice: 'Busque o ponto de equilíbrio: não é preciso escolher um lado.',
    transit: 'Culminação e consciência: algo chega ao ápice e pede equilíbrio.',
  },
  trine: {
    dynamic: 'fluem em harmonia natural — um talento inato que circula com facilidade',
    advice: 'Use esse dom ativamente; o fluxo fácil pode ser subaproveitado.',
    transit: 'Fluxo e facilidade: portas se abrem com naturalidade.',
  },
  square: {
    dynamic: 'estão em tensão criativa — um atrito que gera crescimento, ação e superação',
    advice: 'Transforme o conflito em motor: aqui mora sua maior força conquistada.',
    transit: 'Desafio e ação: a tensão pede decisões e movimento.',
  },
  sextile: {
    dynamic: 'cooperam como aliados — oportunidades que florescem quando você toma iniciativa',
    advice: 'Dê o primeiro passo: as oportunidades aparecem quando você age.',
    transit: 'Oportunidade: um convite favorável que pede iniciativa.',
  },
  quincunx: {
    dynamic: 'falam línguas diferentes — exigem ajustes constantes e adaptação',
    advice: 'Seja flexível e paciente: o ajuste fino é o caminho.',
    transit: 'Ajuste: pequenas correções de rota são necessárias.',
  },
  semisextile: {
    dynamic: 'estão vizinhos e em leve fricção — um aprendizado sutil',
    advice: 'Observe os detalhes: há crescimento discreto aqui.',
    transit: 'Sutileza: pequenos ajustes.',
  },
}

const lower = (k: PointKey) => (PLANET_TEXT[k]?.principle ?? POINTS[k].name).toLowerCase()

export function natalAspectText(a: PointKey, b: PointKey, type: AspectKey): string {
  const t = ASPECT_TEXT[type]
  return `${POINTS[a].name} (${lower(a)}) e ${POINTS[b].name} (${lower(b)}) ${t.dynamic}. ${t.advice}`
}

const DURATION: Partial<Record<PlanetKey, string>> = {
  moon: 'algumas horas',
  sun: 'alguns dias',
  mercury: 'alguns dias',
  venus: 'alguns dias',
  mars: 'cerca de uma semana',
  jupiter: 'algumas semanas',
  saturn: 'alguns meses',
  uranus: 'um longo período (meses)',
  neptune: 'um longo período (meses a anos)',
  pluto: 'um período profundo e prolongado',
  node: 'algumas semanas',
}

const NATAL_TARGET: Partial<Record<PointKey, string>> = {
  sun: 'sua identidade e vitalidade',
  moon: 'suas emoções e necessidades íntimas',
  mercury: 'sua mente e comunicação',
  venus: 'seus afetos, prazeres e valores',
  mars: 'sua energia de ação e desejo',
  jupiter: 'sua fé e capacidade de expansão',
  saturn: 'suas estruturas e responsabilidades',
  uranus: 'sua necessidade de liberdade',
  neptune: 'sua sensibilidade e espiritualidade',
  pluto: 'seu poder pessoal e processos profundos',
  asc: 'sua forma de se apresentar e seu corpo',
  mc: 'sua carreira e direção de vida',
}

/** "seu Sol", "sua Lua"… */
export function possessive(k: PointKey): string {
  const fem = k === 'moon' || k === 'venus' || k === 'lilith' || k === 'fortune'
  return `${fem ? 'sua' : 'seu'} ${POINTS[k].name}`
}

export function transitText(transit: PlanetKey, natal: PointKey, type: AspectKey): string {
  const tp = PLANET_TEXT[transit]
  const target = NATAL_TARGET[natal] ?? POINTS[natal].name
  return `${POINTS[transit].name} ${tp?.transit ?? ''} — e toca ${target}. ${ASPECT_TEXT[type].transit} Influência de ${DURATION[transit] ?? 'alguns dias'}.`
}

/** Short daily-horoscope style headline per transit nature. */
export function transitHeadline(transit: PlanetKey, natal: PointKey, type: AspectKey): string {
  const T = POINTS[transit].name
  const verb: Record<AspectKey, string> = {
    conjunction: 'encontra',
    opposition: 'confronta',
    trine: 'harmoniza com',
    square: 'desafia',
    sextile: 'favorece',
    quincunx: 'ajusta',
    semisextile: 'roça',
  }
  return `${T} ${verb[type]} ${possessive(natal)}`
}
