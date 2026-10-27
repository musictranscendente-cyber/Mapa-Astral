import { POINTS, SIGNS } from '../astro/constants'
import type { CalEvent, CalEventKind } from '../astro/calendar'
import { locale, t } from '../i18n'
import { eclipseLabel } from './lunations'

const QUARTERS = ['Lua Nova', 'Quarto Crescente', 'Lua Cheia', 'Quarto Minguante']
const time = (d: Date) => d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })

export const KIND_INFO: Record<CalEventKind, { label: string; icon: string }> = {
  fase: { label: 'Fases da Lua', icon: '◐' },
  eclipse: { label: 'Eclipses', icon: '●' },
  ingresso: { label: 'Planetas mudando de signo', icon: '➝' },
  'lua-signo': { label: 'Lua nos signos', icon: '☽' },
  estacao: { label: 'Retrógrados', icon: '℞' },
  'fora-de-curso': { label: 'Lua fora de curso', icon: '∅' },
}

export function eventTitle(e: CalEvent): string {
  const s = e.sign !== undefined ? SIGNS[e.sign].name : ''
  switch (e.kind) {
    case 'fase': return t('{phase} em {sign}', { phase: t(QUARTERS[e.quarter ?? 0]), sign: s })
    case 'eclipse': return t('{phase} em {sign}', { phase: eclipseLabel(e.lunation === 'nova', e.eclipse!), sign: s })
    case 'ingresso': return t('{planet} entra em {sign}', { planet: POINTS[e.planet!].name, sign: s })
    case 'lua-signo': return t('{planet} entra em {sign}', { planet: POINTS.moon.name, sign: s })
    case 'estacao': return t(e.retro ? '{planet} fica retrógrado em {sign}' : '{planet} volta a andar direto em {sign}', { planet: POINTS[e.planet!].name, sign: s })
    case 'fora-de-curso': return t('Lua fora de curso')
  }
}

export function eventHint(e: CalEvent): string {
  switch (e.kind) {
    case 'fase': return t(['Plante intenções e comece algo novo.', 'Aja e supere obstáculos.', 'Colha, celebre e veja com clareza.', 'Solte, revise e reorganize.'][e.quarter ?? 0])
    case 'eclipse': return t('Portal de mudanças: evite decisões precipitadas e observe o que se revela.')
    case 'ingresso': return t('Muda o clima coletivo nos temas desse planeta.')
    case 'lua-signo': return t('O clima emocional do dia muda de tom.')
    case 'estacao': return t(e.retro ? 'Tempo de revisar os temas desse planeta.' : 'Os temas desse planeta voltam a fluir.')
    case 'fora-de-curso': return t('Evite começar coisas importantes, assinar ou comprar: bom para descansar e concluir.')
  }
}

export const eventTime = (e: CalEvent) => (e.kind === 'fora-de-curso' ? `${time(e.date)} – ${time(e.end!)}` : time(e.date))
