import { POINTS, SIGNS } from '../astro/constants'
import type { Chart } from '../astro/chart'
import { HOUSE_TEXT } from './planets'
import { SIGN_TEXT } from './signs'
import { byLang, t } from '../i18n'
import { REL_MOON_EN, REL_SUN_EN } from './en/returns'
import { REL_MOON_ES, REL_SUN_ES } from './es/returns'

/** Sol do mapa do casal: o propósito da relação. */
const REL_SUN_PT = [
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
const REL_MOON_PT = [
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

const REL_SUN = byLang({ pt: REL_SUN_PT, en: REL_SUN_EN, es: REL_SUN_ES })
const REL_MOON = byLang({ pt: REL_MOON_PT, en: REL_MOON_EN, es: REL_MOON_ES })

export function relationshipReading(c: Chart): { title: string; text: string }[] {
  const P = c.points
  const title = (glyph: string, planet: string, sign: number) => `${glyph} ${t('{planet} composto em {sign}', { planet, sign: SIGNS[sign].name })}`
  const sunHouse = HOUSE_TEXT[P.sun.house - 1]
  const out = [
    { title: title('☉', POINTS.sun.name, P.sun.sign), text: `${t('O propósito do casal:')} ${REL_SUN[P.sun.sign]}${c.hasHouses ? ` ${t('Na {house}, a relação se realiza através de {kw}.', { house: sunHouse.name.toLowerCase(), kw: sunHouse.keywords.join(', ') })}` : ''}` },
    { title: title('☽', POINTS.moon.name, P.moon.sign), text: `${t('O clima emocional:')} ${REL_MOON[P.moon.sign]}` },
    { title: title('♀', POINTS.venus.name, P.venus.sign), text: t('O amor entre vocês se expressa {style}.', { style: SIGN_TEXT[P.venus.sign].style }) },
    { title: title('♂', POINTS.mars.name, P.mars.sign), text: t('A energia e o desejo do casal agem {style}.', { style: SIGN_TEXT[P.mars.sign].style }) },
  ]
  if (c.hasHouses) {
    out.splice(2, 0, { title: title('AC', POINTS.asc.name, P.asc.sign), text: t('Como os outros veem o casal: {kw} — vocês juntos se apresentam {style}.', { kw: SIGN_TEXT[P.asc.sign].keywords.slice(0, 3).join(', '), style: SIGN_TEXT[P.asc.sign].style }) })
  }
  return out
}
