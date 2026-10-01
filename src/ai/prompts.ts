import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, formatDegree, type PointKey } from '../astro/constants'
import type { SynAspect } from '../astro/synastry'
import type { DayScore, TransitEvent } from '../astro/transits'

export type ReadingKind = 'natal' | 'sinastria' | 'revolucao' | 'previsao'

export const READING_TITLES: Record<ReadingKind, string> = {
  natal: 'Leitura do Mapa Natal',
  sinastria: 'Leitura de Sinastria',
  revolucao: 'Leitura da Revolução Solar',
  previsao: 'Leitura das Previsões',
}

/** Kept stable (no dates, no per-user data) so it can be prompt-cached. */
export const SYSTEM_PROMPT = `Você é um astrólogo experiente, sensível e ético, que escreve em português do Brasil.
Você recebe dados astronômicos já calculados com precisão (zodíaco tropical) e escreve uma leitura personalizada.

Princípios:
- Baseie-se SOMENTE nas posições, casas e aspectos fornecidos. Não invente posições.
- Integre os fatores entre si (sínteses, temas recorrentes, contradições) em vez de listar cada planeta isoladamente.
- Tom acolhedor, profundo, poético na medida certa e prático: inclua conselhos concretos.
- Linguagem de possibilidade e livre-arbítrio ("tende a", "convida a"); nada de previsões fatalistas.
- Nunca dê aconselhamento médico, jurídico ou financeiro específico; não prometa resultados.
- Formato: Markdown simples com títulos "## ", parágrafos curtos e, quando útil, listas com "- ". Sem tabelas.
- Extensão: entre 600 e 1000 palavras.`

const KIND_INSTRUCTIONS: Record<ReadingKind, string> = {
  natal: 'Escreva a leitura do mapa natal. Seções sugeridas: essência (Sol, Lua, Ascendente e regente), mente e afetos, ação e vocação, desafios e dons (aspectos mais exatos), propósito evolutivo (Nodos) e uma mensagem final.',
  sinastria: 'Escreva a leitura de compatibilidade entre as duas pessoas. Seções sugeridas: a dinâmica geral do encontro, atração e afeto, comunicação e convivência, pontos de atrito e como trabalhá-los, o propósito da relação e conselhos práticos para o casal (ou dupla).',
  revolucao: 'Escreva a leitura da Revolução Solar (o ano astrológico entre dois aniversários). Seções sugeridas: o tom do ano (Ascendente da revolução), áreas em destaque (casas do Sol e da Lua, planetas angulares), oportunidades, desafios, conselhos por área da vida e uma mensagem final.',
  previsao: 'Escreva a leitura das previsões do período. Seções sugeridas: visão geral do período, os trânsitos mais importantes em ordem cronológica, melhores dias e dias de atenção, conselhos práticos por área da vida.',
}

export function buildUserPrompt(kind: ReadingKind, summary: string): string {
  return `${KIND_INSTRUCTIONS[kind]}\n\nDados calculados:\n<dados>\n${summary}\n</dados>`
}

const MAX_SUMMARY = 14000
export const clampSummary = (s: string) => s.slice(0, MAX_SUMMARY)

const LIST: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'lilith']

export function chartSummary(chart: Chart, label = 'Mapa'): string {
  const lines: string[] = []
  const b = chart.birth
  if (b) {
    const l = b.local
    lines.push(`${label}: ${b.name} — nascimento ${String(l.day).padStart(2, '0')}/${String(l.month).padStart(2, '0')}/${l.year}${b.timeUnknown ? ' (hora desconhecida)' : ` às ${String(l.hour).padStart(2, '0')}:${String(l.minute).padStart(2, '0')}`}, ${b.place}`)
  } else {
    lines.push(`${label}: ${chart.date.toISOString()} (UTC)`)
  }
  for (const k of LIST) {
    const p = chart.points[k]
    lines.push(`- ${POINTS[k].name}: ${formatDegree(p.lon)}${chart.hasHouses ? `, casa ${p.house}` : ''}${p.retro ? ', retrógrado' : ''}${p.dignity ? `, ${p.dignity}` : ''}`)
  }
  if (chart.hasHouses) {
    lines.push(`- Ascendente: ${formatDegree(chart.asc)}; Meio do Céu: ${formatDegree(chart.mc)}`)
    lines.push(`- Regente do mapa: ${POINTS[SIGNS[chart.points.asc.sign].ruler].name}`)
    lines.push(`- Cúspides: ${chart.cusps.map((c, i) => `C${i + 1} ${formatDegree(c)}`).join('; ')}`)
  } else {
    lines.push('- Hora desconhecida: não use casas nem Ascendente.')
  }
  const el = chart.balance.elements
  lines.push(`- Elementos (peso): fogo ${el.fogo}, terra ${el.terra}, ar ${el.ar}, água ${el.agua}`)
  lines.push('Aspectos (mais exatos primeiro):')
  for (const a of chart.aspects.slice(0, 22)) {
    lines.push(`- ${POINTS[a.a].name} ${a.type.name} ${POINTS[a.b].name} (orbe ${a.orb.toFixed(1)}°)`)
  }
  return lines.join('\n')
}

export function synastrySummary(A: Chart, B: Chart, aspects: SynAspect[], score: number): string {
  return [
    chartSummary(A, 'Pessoa A'),
    '',
    chartSummary(B, 'Pessoa B'),
    '',
    `Índice de compatibilidade calculado: ${score}/100`,
    'Aspectos entre os mapas (A × B, mais fortes primeiro):',
    ...aspects.slice(0, 25).map((s) => `- ${POINTS[s.a].name} de A ${s.type.name} ${POINTS[s.b].name} de B (orbe ${s.orb.toFixed(1)}°)`),
  ].join('\n')
}

export function solarReturnSummary(natal: Chart, sr: Chart, year: number, place: string): string {
  return [
    chartSummary(natal, 'Mapa natal'),
    '',
    `Revolução Solar ${year}–${year + 1}, calculada para ${place}, momento exato ${sr.date.toISOString()} (UTC):`,
    ...LIST.map((k) => `- ${POINTS[k].name}: ${formatDegree(sr.points[k].lon)}, casa ${sr.points[k].house}${sr.points[k].retro ? ', retrógrado' : ''}`),
    `- Ascendente da revolução: ${formatDegree(sr.asc)}; Meio do Céu: ${formatDegree(sr.mc)}`,
    'Aspectos da revolução:',
    ...sr.aspects.slice(0, 15).map((a) => `- ${POINTS[a.a].name} ${a.type.name} ${POINTS[a.b].name} (orbe ${a.orb.toFixed(1)}°)`),
  ].join('\n')
}

export function forecastSummary(natal: Chart, events: TransitEvent[], days: DayScore[]): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const best = [...days].sort((a, b) => b.flow - a.flow).slice(0, 4)
  const hard = [...days].sort((a, b) => a.flow - b.flow).slice(0, 4)
  return [
    chartSummary(natal, 'Mapa natal'),
    '',
    `Período: ${fmt(days[0].date)} a ${fmt(days[days.length - 1].date)}`,
    'Trânsitos exatos no período (trânsito → ponto natal):',
    ...events.slice(0, 40).map((e) => `- ${fmt(e.exact)}: ${POINTS[e.transit].name}${e.retro ? ' (retrógrado)' : ''} ${e.type.name} ${POINTS[e.natal].name} natal; ativo de ${fmt(e.start)} a ${fmt(e.end)}`),
    `Dias de maior fluxo: ${best.map((d) => `${fmt(d.date)} (+${d.flow})`).join(', ')}`,
    `Dias de maior tensão: ${hard.map((d) => `${fmt(d.date)} (${d.flow})`).join(', ')}`,
  ].join('\n')
}
