import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, formatDegree, type PointKey } from '../astro/constants'
import type { SynAspect } from '../astro/synastry'
import type { DayScore, TransitEvent } from '../astro/transits'

export { READING_TITLES, SYSTEM_PROMPT, buildUserPrompt, clampSummary, type ReadingKind } from './promptCore'

const LIST: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node', 'lilith']

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
