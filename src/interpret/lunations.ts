import { SIGNS } from '../astro/constants'
import { possessive } from './aspects'
import type { PersonalLunation, Lunation } from '../astro/lunations'
import { HOUSE_TEXT } from './planets'

export const KIND_LABEL = (l: Lunation) =>
  l.eclipse ? `Eclipse ${l.kind === 'nova' ? 'solar' : 'lunar'} ${l.eclipse}` : l.kind === 'nova' ? 'Lua Nova' : 'Lua Cheia'

const SIGN_THEME = [
  'coragem e recomeços', 'segurança, corpo e valores', 'ideias, conversas e aprendizado', 'lar, família e emoções',
  'criatividade, romance e alegria', 'rotina, saúde e organização', 'relacionamentos e acordos', 'intimidade e transformação',
  'expansão, fé e viagens', 'metas, carreira e responsabilidade', 'amizades, causas e futuro', 'espiritualidade, sensibilidade e entrega',
]

/** General meaning, valid for everyone. */
export function lunationMeaning(l: Lunation): string {
  const s = SIGNS[l.sign].name
  const t = SIGN_THEME[l.sign]
  if (l.eclipse && l.kind === 'nova') return `Eclipse solar em ${s}: um portal de recomeço. Sementes plantadas agora em temas de ${t} tendem a se desenvolver nos próximos seis meses — muitas vezes de forma inesperada.`
  if (l.eclipse) return `Eclipse lunar em ${s}: momento de culminação e revelação. Algo ligado a ${t} chega ao ponto de virada; é hora de soltar o que já cumpriu seu papel.`
  if (l.kind === 'nova') return `Lua Nova em ${s}: ótimo momento para intenções e começos ligados a ${t}.`
  return `Lua Cheia em ${s}: emoções à flor da pele e colheita em temas de ${t}. Veja com clareza o que floresceu desde a última Lua Nova.`
}

/** What it means for this person's chart. */
export function lunationPersonal(l: PersonalLunation): string[] {
  const out: string[] = []
  if (l.house) {
    const h = HOUSE_TEXT[l.house - 1]
    const verb = l.eclipse
      ? l.kind === 'nova' ? 'abre um novo capítulo' : 'traz um ponto de virada'
      : l.kind === 'nova' ? 'convida a plantar intenções' : 'ilumina e traz colheitas'
    out.push(`Cai na sua ${h.name.toLowerCase()} (${h.theme.toLowerCase()}): ${verb} em ${h.keywords.join(', ')}.`)
  }
  for (const c of l.contacts.slice(0, 3)) {
    const tone = c.type.key === 'conjunction' ? 'ativa diretamente' : c.type.nature === 'tenso' ? 'desafia' : 'favorece'
    out.push(`${c.type.name} com ${possessive(c.point)} (orbe ${c.orb.toFixed(1)}°): ${tone} esse ponto do seu mapa${l.eclipse ? ' — efeito marcante nos próximos meses' : ''}.`)
  }
  return out
}
