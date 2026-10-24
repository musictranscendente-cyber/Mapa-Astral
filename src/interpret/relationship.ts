import { SIGNS } from '../astro/constants'
import type { Chart } from '../astro/chart'
import { HOUSE_TEXT } from './planets'
import { SIGN_TEXT } from './signs'

/** Sol do mapa do casal: o propósito da relação. */
const REL_SUN = [
  'uma relação que nasceu para agir: vocês se impulsionam, começam projetos e enfrentam desafios juntos.',
  'uma relação que busca construir: estabilidade, prazer e segurança material são o centro do vínculo.',
  'uma relação de troca e amizade: conversas, aprendizado e leveza mantêm a chama acesa.',
  'uma relação de ninho: família, acolhimento e cuidado mútuo são o propósito.',
  'uma relação de brilho: criatividade, romance e alegria de viver juntos.',
  'uma relação de parceria prática: rotina, ajuda mútua e aperfeiçoamento diário.',
  'uma relação que existe para o encontro: equilíbrio, beleza e o aprendizado do "nós".',
  'uma relação profunda e transformadora: intimidade, intensidade e renascimentos.',
  'uma relação de expansão: viagens, fé, estudos e uma visão de vida compartilhada.',
  'uma relação com metas: construir algo duradouro e respeitado no mundo.',
  'uma relação de liberdade e ideais: amizade, projetos coletivos e respeito ao espaço de cada um.',
  'uma relação de alma: compaixão, espiritualidade e uma conexão que vai além das palavras.',
]

/** Lua do mapa do casal: o clima emocional. */
const REL_MOON = [
  'emoções rápidas e diretas — vocês precisam de movimento e sinceridade.',
  'emoções serenas — segurança, carinho físico e constância nutrem o casal.',
  'emoções que passam pela palavra — conversar é o jeito de se sentirem próximos.',
  'emoções profundas e protetoras — o lar é o refúgio da relação.',
  'emoções calorosas — vocês precisam se admirar e celebrar juntos.',
  'emoções cuidadosas — o amor se mostra em gestos práticos do dia a dia.',
  'emoções que buscam harmonia — gentileza e equilíbrio são essenciais.',
  'emoções intensas — lealdade e entrega total, com cuidado com o ciúme.',
  'emoções otimistas — liberdade, humor e aventuras renovam o vínculo.',
  'emoções contidas — compromisso e responsabilidade mostram o afeto.',
  'emoções livres — amizade e espaço individual fortalecem a união.',
  'emoções sensíveis — empatia e intuição unem vocês sem precisar de explicações.',
]

export function relationshipReading(c: Chart, kind: 'composto' | 'davison'): { title: string; text: string }[] {
  const P = c.points
  const label = kind === 'composto' ? 'composto' : 'do Davison'
  const out = [
    { title: `☉ Sol ${label} em ${SIGNS[P.sun.sign].name}`, text: `O propósito do casal: ${REL_SUN[P.sun.sign]}${c.hasHouses ? ` Na ${HOUSE_TEXT[P.sun.house - 1].name.toLowerCase()}, a relação se realiza através de ${HOUSE_TEXT[P.sun.house - 1].keywords.join(', ')}.` : ''}` },
    { title: `☽ Lua ${label} em ${SIGNS[P.moon.sign].name}`, text: `O clima emocional: ${REL_MOON[P.moon.sign]}` },
    { title: `♀ Vênus ${label} em ${SIGNS[P.venus.sign].name}`, text: `O amor entre vocês se expressa ${SIGN_TEXT[P.venus.sign].style}.` },
    { title: `♂ Marte ${label} em ${SIGNS[P.mars.sign].name}`, text: `A energia e o desejo do casal agem ${SIGN_TEXT[P.mars.sign].style}.` },
  ]
  if (c.hasHouses) {
    out.splice(2, 0, { title: `AC Ascendente ${label} em ${SIGNS[P.asc.sign].name}`, text: `Como os outros veem o casal: ${SIGN_TEXT[P.asc.sign].keywords.slice(0, 3).join(', ')} — vocês juntos se apresentam ${SIGN_TEXT[P.asc.sign].style}.` })
  }
  return out
}
