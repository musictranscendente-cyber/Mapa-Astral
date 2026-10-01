import { useEffect, useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, type PlanetKey } from '../astro/constants'
import { upcomingLunarPhases, bodyLongitude, toTime } from '../astro/ephemeris'
import { findTransitEvents, scoreRange, type TransitEvent } from '../astro/transits'
import { computeChart } from '../astro/chart'
import { AiReading } from '../components/AiReading'
import { ChartWheel } from '../components/ChartWheel'
import { forecastSummary } from '../ai/prompts'
import { AreaMeters, FlowChart } from '../components/Charts'
import { MoonPhase } from '../components/MoonPhase'
import { transitHeadline, transitText } from '../interpret/aspects'
import { transitsAt } from '../astro/transits'
import type { Route } from '../App'

const RANGES = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '3 meses' },
  { days: 365, label: '1 ano' },
]

type Speed = 'todos' | 'lentos' | 'rapidos'
const SLOW: PlanetKey[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node']
const FAST: PlanetKey[] = ['sun', 'mercury', 'venus', 'mars']

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)
const fmt = (d: Date, o: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) => d.toLocaleDateString('pt-BR', o)

export function ForecastPage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const [range, setRange] = useState(30)
  const [speed, setSpeed] = useState<Speed>('todos')
  const [withMoon, setWithMoon] = useState(false)
  const [day, setDay] = useState(0)
  const [ready, setReady] = useState(false)
  const [start] = useState(() => startOfDay(new Date()))

  // Let the page paint its animation before heavy computation.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(id)
  }, [])

  const days = useMemo(() => (natal && ready ? scoreRange(natal, start, range) : []), [natal, start, range, ready])
  const events = useMemo(() => {
    if (!natal || !ready) return []
    const planets: PlanetKey[] = [
      ...(speed !== 'lentos' ? FAST : []),
      ...(speed !== 'rapidos' ? SLOW : []),
      ...(withMoon && range <= 30 ? (['moon'] as PlanetKey[]) : []),
    ]
    return findTransitEvents(natal, start, range, planets)
  }, [natal, start, range, speed, withMoon, ready])

  const lunar = useMemo(() => upcomingLunarPhases(start, Math.max(4, Math.round(range / 7.4))), [start, range])
  const selectedDate = days[day]?.date ?? start
  const sky = useMemo(() => (natal ? computeChart(selectedDate, natal.latitude, natal.longitude, natal.houseSystem) : null), [natal, selectedDate])
  const dayHits = useMemo(() => (natal ? transitsAt(natal, selectedDate) : []), [natal, selectedDate])

  if (!natal) {
    return (
      <div className="empty glass">
        <h2>Previsões pessoais</h2>
        <p>Para correlacionar o céu com a sua vida, crie primeiro o seu mapa natal.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }

  const groups = groupByMonth(events)
  const best = [...days].sort((a, b) => b.flow - a.flow).slice(0, 3)
  const hard = [...days].sort((a, b) => a.flow - b.flow).slice(0, 3)

  return (
    <div className="forecast">
      <header className="page-head">
        <p className="eyebrow">Projeção astrológica</p>
        <h1 className="title-glow">Os próximos {RANGES.find((r) => r.days === range)?.label}</h1>
        <p className="muted">Trânsitos do céu sobre o mapa de {natal.birth?.name} · a partir de {fmt(start, { day: 'numeric', month: 'long' })}</p>
        <div className="segmented">
          {RANGES.map((r) => (
            <button key={r.days} className={range === r.days ? 'active' : ''} onClick={() => { setRange(r.days); setDay(0) }}>{r.label}</button>
          ))}
        </div>
      </header>

      {!ready ? <div className="loader"><span /> Calculando trânsitos…</div> : (
        <>
          <section className="glass pad">
            <div className="section-title">
              <h2>Ondas de energia</h2>
              <span className="muted small">Toque no gráfico para escolher um dia</span>
            </div>
            <FlowChart days={days} selected={day} onSelect={setDay} />
            <div className="day-highlights">
              <div>
                <p className="eyebrow">✦ Dias de maior fluxo</p>
                {best.map((d) => <button key={+d.date} className="chip good" onClick={() => setDay(days.indexOf(d))}>{fmt(d.date, { weekday: 'short', day: '2-digit', month: 'short' })} · {d.flow > 0 ? '+' : ''}{d.flow}</button>)}
              </div>
              <div>
                <p className="eyebrow">⚠ Dias de maior desafio</p>
                {hard.map((d) => <button key={+d.date} className="chip hard" onClick={() => setDay(days.indexOf(d))}>{fmt(d.date, { weekday: 'short', day: '2-digit', month: 'short' })} · {d.flow}</button>)}
              </div>
            </div>
          </section>

          <section className="wheel-layout">
            <div className="wheel-box">
              {sky && <ChartWheel chart={natal} outer={sky} outerHits={dayHits} showAspects={false} spin={false} />}
              <div className="day-scrub">
                <button className="ghost" disabled={day <= 0} onClick={() => setDay((d) => d - 1)}>‹</button>
                <input type="range" min={0} max={Math.max(0, days.length - 1)} value={day} onChange={(e) => setDay(Number(e.target.value))} />
                <button className="ghost" disabled={day >= days.length - 1} onClick={() => setDay((d) => d + 1)}>›</button>
              </div>
            </div>
            <aside className="glass detail">
              <p className="eyebrow">Dia selecionado</p>
              <h3>{fmt(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <p className="muted">
                Lua em {SIGNS[Math.floor(bodyLongitude('moon', toTime(selectedDate)) / 30)].name} · Fluxo {days[day]?.flow ?? 0} · Intensidade {days[day]?.intensity ?? 0}
              </p>
              {days[day] && <AreaMeters areas={days[day].areas} />}
              <ul className="mini-transits">
                {dayHits.slice(0, 5).map((h, i) => (
                  <li key={i}>
                    <span style={{ color: POINTS[h.transit].color }}>{POINTS[h.transit].glyph}</span>
                    <span style={{ color: h.type.color }}>{h.type.glyph}</span>
                    <span style={{ color: POINTS[h.natal].color }}>{POINTS[h.natal].glyph}</span>
                    {transitHeadline(h.transit, h.natal, h.type.key)}
                    <small>{h.orb.toFixed(1)}°</small>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className="glass pad">
            <div className="section-title">
              <h2>Linha do tempo dos trânsitos</h2>
              <div className="filters">
                <div className="segmented small">
                  {(['todos', 'lentos', 'rapidos'] as Speed[]).map((s) => (
                    <button key={s} className={speed === s ? 'active' : ''} onClick={() => setSpeed(s)}>{s === 'todos' ? 'Todos' : s === 'lentos' ? 'Planetas lentos' : 'Planetas rápidos'}</button>
                  ))}
                </div>
                {range <= 30 && (
                  <label className="check"><input type="checkbox" checked={withMoon} onChange={(e) => setWithMoon(e.target.checked)} /><span>Incluir Lua</span></label>
                )}
              </div>
            </div>
            <Timeline events={events} start={start} range={range} />
          </section>

          <section className="events">
            {groups.map(([month, list]) => (
              <div key={month} className="month-group">
                <h3 className="month-title">{month}</h3>
                <div className="event-cards">
                  {list.map((e, i) => (
                    <article key={i} className="glass event-card" style={{ ['--accent' as string]: e.type.color }}>
                      <div className="ev-date">
                        <span className="d">{e.exact.getDate()}</span>
                        <span className="m">{fmt(e.exact, { month: 'short' })}</span>
                      </div>
                      <div>
                        <h4>
                          <span style={{ color: POINTS[e.transit].color }}>{POINTS[e.transit].glyph}</span>{' '}
                          <span style={{ color: e.type.color }}>{e.type.glyph}</span>{' '}
                          <span style={{ color: POINTS[e.natal].color }}>{POINTS[e.natal].glyph}</span>{' '}
                          {transitHeadline(e.transit, e.natal, e.type.key)}{e.retro ? ' ℞' : ''}
                        </h4>
                        <p className="muted small">
                          {e.exact < start && 'Em andamento · '}Exato {fmt(e.exact, { day: '2-digit', month: 'short' })} às {e.exact.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ativo de {fmt(e.start)} a {fmt(e.end)}
                        </p>
                        <p>{transitText(e.transit, e.natal, e.type.key)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="glass pad">Nenhum trânsito exato neste período com os filtros atuais.</p>}
          </section>

          {days.length > 0 && (
            <AiReading
              kind="previsao"
              cacheKey={`${natal.birth?.name}|${natal.date.toISOString()}|${start.toISOString().slice(0, 10)}|${range}`}
              getSummary={() => forecastSummary(natal, findTransitEvents(natal, start, range, [...FAST, ...SLOW]), days)}
              onOpenSettings={() => go('ajustes')}
            />
          )}

          <section className="glass pad">
            <h2>Ciclo lunar</h2>
            <div className="lunar-row">
              {lunar.map((l, i) => (
                <div key={i} className="lunar-item">
                  <MoonPhase angle={l.quarter * 90} size={54} south={natal.latitude < 0} />
                  <strong>{l.name}</strong>
                  <small>{fmt(l.date, { weekday: 'short', day: '2-digit', month: 'short' })}</small>
                  <small className="muted">em {SIGNS[Math.floor(bodyLongitude('moon', toTime(l.date)) / 30)].name}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function groupByMonth(events: TransitEvent[]): [string, TransitEvent[]][] {
  const map = new Map<string, TransitEvent[]>()
  for (const e of events) {
    const k = e.exact.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(e)
  }
  return [...map.entries()]
}

/** Gantt-like bars showing each transit's active window. */
function Timeline({ events, start, range }: { events: TransitEvent[]; start: Date; range: number }) {
  const [tip, setTip] = useState<string>('')
  const end = start.getTime() + range * 86400000
  const span = end - start.getTime()
  const rows = events
    .filter((e) => e.transit !== 'moon')
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 24)
    .sort((a, b) => a.exact.getTime() - b.exact.getTime())
  const pct = (d: Date) => Math.max(0, Math.min(100, ((d.getTime() - start.getTime()) / span) * 100))
  const ticks = range <= 7 ? 7 : range <= 30 ? 6 : range <= 90 ? 6 : 12
  return (
    <div className="timeline">
      <div className="tl-axis">
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const d = new Date(start.getTime() + (span * i) / ticks)
          return <span key={i} style={{ left: `${(i / ticks) * 100}%` }}>{d.toLocaleDateString('pt-BR', range > 90 ? { month: 'short' } : { day: '2-digit', month: 'short' })}</span>
        })}
      </div>
      {rows.map((e, i) => (
        <div
          key={i}
          className="tl-row"
          onMouseEnter={() => setTip(`${transitHeadline(e.transit, e.natal, e.type.key)} — exato em ${e.exact.toLocaleDateString('pt-BR')}`)}
          onMouseLeave={() => setTip('')}
        >
          <span className="tl-label">
            <span style={{ color: POINTS[e.transit].color }}>{POINTS[e.transit].glyph}</span>
            <span style={{ color: e.type.color }}>{e.type.glyph}</span>
            <span style={{ color: POINTS[e.natal].color }}>{POINTS[e.natal].glyph}</span>
          </span>
          <span className="tl-track">
            <span className="tl-bar" style={{ left: `${pct(e.start)}%`, width: `${Math.max(0.8, pct(e.end) - pct(e.start))}%`, background: `linear-gradient(90deg, transparent, ${e.type.color}, transparent)` }} />
            <span className="tl-exact" style={{ left: `${pct(e.exact)}%`, background: e.type.color }} />
          </span>
        </div>
      ))}
      <p className="aspect-hover">{tip || (rows.length ? 'As barras mostram o período ativo de cada trânsito; o ponto marca o dia exato.' : '')}</p>
    </div>
  )
}
