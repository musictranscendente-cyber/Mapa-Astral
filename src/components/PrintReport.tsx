import { useState } from 'react'
import type { Chart } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, formatDegree, type PointKey } from '../astro/constants'
import type { ReportSection } from '../interpret/report'
import { SIGN_TEXT } from '../interpret/signs'
import { ChartWheel } from './ChartWheel'
import { locale, t } from '../i18n'

const ROWS: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node', 'lilith']

/** Layout used only when printing / saving as PDF: cover, positions and every chapter. */
export function PrintReport({ chart, report, when }: { chart: Chart; report: ReportSection[]; when: string }) {
  const b = chart.birth!
  const [today] = useState(() => new Date().toLocaleDateString(locale()))
  const P = chart.points
  const trio: PointKey[] = chart.hasHouses ? ['sun', 'moon', 'asc'] : ['sun', 'moon']
  return (
    <div className="print-report" aria-hidden="true">
      <section className="pr-page pr-cover">
        <p className="pr-brand">✶ COSMIC SKY ✶</p>
        <p className="pr-kicker">{t('Mapa Astral de')}</p>
        <h1>{b.name}</h1>
        <p className="pr-sub">{when} · {b.place}</p>
        <div className="pr-wheel"><ChartWheel chart={chart} spin={false} /></div>
        <div className="pr-trio">
          {trio.map((k) => {
            const s = SIGNS[P[k].sign]
            return (
              <div key={k}>
                <small>{POINTS[k].name}</small>
                <span className="g" style={{ color: ELEMENT_INFO[s.element].color }}>{s.glyph}</span>
                <b>{s.name}</b>
              </div>
            )
          })}
        </div>
        <p className="pr-arch">“{SIGN_TEXT[P.sun.sign].title}”</p>
      </section>

      <section className="pr-page">
        <h2>{t('Posições no nascimento')}</h2>
        <table className="pr-table">
          <tbody>
            {ROWS.map((k) => (
              <tr key={k}>
                <td><span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span> {POINTS[k].name}</td>
                <td>{formatDegree(P[k].lon)}{P[k].retro ? ' ℞' : ''}</td>
                <td>{chart.hasHouses ? t('Casa {n}', { n: P[k].house }) : ''}</td>
              </tr>
            ))}
            {chart.hasHouses && <tr><td>AC {POINTS.asc.name}</td><td>{formatDegree(chart.asc)}</td><td /></tr>}
            {chart.hasHouses && <tr><td>MC {POINTS.mc.name}</td><td>{formatDegree(chart.mc)}</td><td /></tr>}
          </tbody>
        </table>
        <p className="pr-note">{t('Zodíaco tropical · casas {system} · efemérides de precisão', { system: chart.houseSystem })}</p>
      </section>

      <section className="pr-chapters">
        {report.map((s) => (
          <article key={s.id} className="pr-chapter">
            <h3><span className="g" style={{ color: s.color ?? '#ffe8a3' }}>{s.glyph}</span> {s.title}</h3>
            {s.subtitle && <p className="pr-subtitle">{s.subtitle}</p>}
            {s.paragraphs.filter(Boolean).map((p, j) => <p key={j}>{p}</p>)}
          </article>
        ))}
        <p className="pr-note pr-end">{t('Relatório gerado pelo Cosmic Sky · {date}', { date: today })}</p>
      </section>
    </div>
  )
}
