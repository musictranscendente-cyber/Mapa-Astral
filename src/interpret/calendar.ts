import { POINTS, SIGNS } from '../astro/constants'
import type { CalEvent, CalEventKind } from '../astro/calendar'

const QUARTERS = ['Lua Nova', 'Quarto Crescente', 'Lua Cheia', 'Quarto Minguante']
const time = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

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
    case 'fase': return `${QUARTERS[e.quarter ?? 0]} em ${s}`
    case 'eclipse': return `Eclipse ${e.lunation === 'nova' ? 'solar' : 'lunar'} ${e.eclipse} em ${s}`
    case 'ingresso': return `${POINTS[e.planet!].name} entra em ${s}`
    case 'lua-signo': return `Lua entra em ${s}`
    case 'estacao': return e.retro ? `${POINTS[e.planet!].name} fica retrógrado em ${s}` : `${POINTS[e.planet!].name} volta a andar direto em ${s}`
    case 'fora-de-curso': return 'Lua fora de curso'
  }
}

export function eventHint(e: CalEvent): string {
  switch (e.kind) {
    case 'fase': return ['Plante intenções e comece algo novo.', 'Aja e supere obstáculos.', 'Colha, celebre e veja com clareza.', 'Solte, revise e reorganize.'][e.quarter ?? 0]
    case 'eclipse': return 'Portal de mudanças: evite decisões precipitadas e observe o que se revela.'
    case 'ingresso': return 'Muda o clima coletivo nos temas desse planeta.'
    case 'lua-signo': return 'O clima emocional do dia muda de tom.'
    case 'estacao': return e.retro ? 'Tempo de revisar os temas desse planeta.' : 'Os temas desse planeta voltam a fluir.'
    case 'fora-de-curso': return 'Evite começar coisas importantes, assinar ou comprar: bom para descansar e concluir.'
  }
}

export const eventTime = (e: CalEvent) => (e.kind === 'fora-de-curso' ? `${time(e.date)} – ${time(e.end!)}` : time(e.date))
