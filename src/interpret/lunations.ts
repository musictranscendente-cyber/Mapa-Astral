import { SIGNS } from '../astro/constants'
import { possessive } from './aspects'
import type { PersonalLunation, Lunation } from '../astro/lunations'
import { HOUSE_TEXT } from './planets'
import { t } from '../i18n'

export const eclipseLabel = (solar: boolean, kind: string) =>
  t(solar ? 'Eclipse solar {kind}' : 'Eclipse lunar {kind}', { kind: t(kind) })

export const KIND_LABEL = (l: Lunation) =>
  l.eclipse ? eclipseLabel(l.kind === 'nova', l.eclipse) : l.kind === 'nova' ? t('Lua Nova') : t('Lua Cheia')

const SIGN_THEME = [
  'coragem e recomeços', 'segurança, corpo e valores', 'ideias, conversas e aprendizado', 'lar, família e emoções',
  'criatividade, romance e alegria', 'rotina, saúde e organização', 'relacionamentos e acordos', 'intimidade e transformação',
  'expansão, fé e viagens', 'metas, carreira e responsabilidade', 'amizades, causas e futuro', 'espiritualidade, sensibilidade e entrega',
]

/** General meaning, valid for everyone. */
export function lunationMeaning(l: Lunation): string {
  const s = SIGNS[l.sign].name
  const theme = t(SIGN_THEME[l.sign])
  if (l.eclipse && l.kind === 'nova') return t('Eclipse solar em {sign}: um portal de recomeço. Sementes plantadas agora em temas de {theme} tendem a se desenvolver nos próximos seis meses — muitas vezes de forma inesperada.', { sign: s, theme })
  if (l.eclipse) return t('Eclipse lunar em {sign}: momento de culminação e revelação. Algo ligado a {theme} chega ao ponto de virada; é hora de soltar o que já cumpriu seu papel.', { sign: s, theme })
  if (l.kind === 'nova') return t('Lua Nova em {sign}: ótimo momento para intenções e começos ligados a {theme}.', { sign: s, theme })
  return t('Lua Cheia em {sign}: emoções à flor da pele e colheita em temas de {theme}. Veja com clareza o que floresceu desde a última Lua Nova.', { sign: s, theme })
}

/** What it means for this person's chart. */
export function lunationPersonal(l: PersonalLunation): string[] {
  const out: string[] = []
  if (l.house) {
    const h = HOUSE_TEXT[l.house - 1]
    const verb = l.eclipse
      ? l.kind === 'nova' ? t('abre um novo capítulo') : t('traz um ponto de virada')
      : l.kind === 'nova' ? t('convida a plantar intenções') : t('ilumina e traz colheitas')
    out.push(t('Cai na sua {house} ({theme}): {verb} em {kw}.', { house: h.name.toLowerCase(), theme: h.theme.toLowerCase(), verb, kw: h.keywords.join(', ') }))
  }
  for (const c of l.contacts.slice(0, 3)) {
    const tone = c.type.key === 'conjunction' ? t('ativa diretamente') : c.type.nature === 'tenso' ? t('desafia') : t('favorece')
    const line = t('{aspect} com {point} (orbe {orb}°): {tone} esse ponto do seu mapa', { aspect: c.type.name, point: possessive(c.point), orb: c.orb.toFixed(1), tone })
    out.push(`${line}${l.eclipse ? t(' — efeito marcante nos próximos meses') : ''}.`)
  }
  return out
}
