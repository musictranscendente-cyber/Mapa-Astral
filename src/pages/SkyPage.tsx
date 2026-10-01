import { useEffect, useMemo, useState } from 'react'
import { computeChart, type BirthData, type Chart } from '../astro/chart'
import { POINTS, SIGNS, ELEMENT_INFO, formatDegree, type PlanetKey } from '../astro/constants'
import { moonPhaseInfo, upcomingLunarPhases } from '../astro/ephemeris'
import { scoreDay, transitsAt } from '../astro/transits'
import { userTimeZone } from '../astro/time'
import { ChartWheel } from '../components/ChartWheel'
import { AreaMeters } from '../components/Charts'
import { MoonPhase } from '../components/MoonPhase'
import { transitHeadline, transitText } from '../interpret/aspects'
import { RETRO_TEXT, moonSignOfDayText } from '../interpret/report'
import type { Settings } from '../lib/profiles'
import type { Route } from '../App'

interface Props {
  natal: Chart | null
  profile: BirthData | null
  settings: Settings
  go: (r: Route) => void
}

const toInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function SkyPage({ natal, profile, settings, go }: Props) {
  const [date, setDate] = useState(() => new Date())
  const [live, setLive] = useState(true)
  const [loc, setLoc] = useState(() => ({
    lat: profile?.latitude ?? -23.5505,
    lon: profile?.longitude ?? -46.6333,
    label: profile?.place ?? 'São Paulo, Brasil',
  }))
  const [mode, setMode] = useState<'ceu' | 'pessoal'>(natal ? 'pessoal' : 'ceu')

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setDate(new Date()), 60000)
    return () => clearInterval(id)
  }, [live])

  const sky = useMemo(() => computeChart(date, loc.lat, loc.lon, settings.houseSystem), [date, loc, settings.houseSystem])
  const moon = useMemo(() => moonPhaseInfo(date), [date])
  const phases = useMemo(() => upcomingLunarPhases(date, 4), [date])
  const hits = useMemo(() => (natal ? transitsAt(natal, date) : []), [natal, date])
  const score = useMemo(() => (natal ? scoreDay(natal, date) : null), [natal, date])

  const retros = (['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as PlanetKey[]).filter((k) => sky.points[k].retro)

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Minha localização' })
    })
  }

  const shift = (days: number) => {
    setLive(false)
    setDate((d) => new Date(d.getTime() + days * 86400000))
  }

  return (
    <div className="sky">
      <header className="page-head">
        <p className="eyebrow">Céu do momento</p>
        <h1 className="title-glow">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h1>
        <p className="muted">
          {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({userTimeZone()}) · {loc.label}
          {live && <span className="live-dot"> ● ao vivo</span>}
        </p>
        <div className="head-tools">
          <button className="ghost" onClick={() => shift(-1)}>‹ Ontem</button>
          <input
            type="datetime-local"
            value={toInput(date)}
            onChange={(e) => { if (e.target.value) { setLive(false); setDate(new Date(e.target.value)) } }}
          />
          <button className="ghost" onClick={() => shift(1)}>Amanhã ›</button>
          <button className="ghost" onClick={() => { setLive(true); setDate(new Date()) }}>Agora</button>
          <button className="ghost" onClick={useMyLocation}>⌖ Minha localização</button>
        </div>
        {natal && (
          <div className="segmented">
            <button className={mode === 'pessoal' ? 'active' : ''} onClick={() => setMode('pessoal')}>Céu × Meu mapa</button>
            <button className={mode === 'ceu' ? 'active' : ''} onClick={() => setMode('ceu')}>Céu do lugar</button>
          </div>
        )}
      </header>

      <section className="wheel-layout">
        <div className="wheel-box">
          {mode === 'pessoal' && natal
            ? <ChartWheel chart={natal} outer={sky} outerHits={hits} showAspects={false} />
            : <ChartWheel chart={sky} />}
          <p className="hint">{mode === 'pessoal' && natal ? 'Anel externo (turquesa): planetas em trânsito agora · interno: seu mapa natal' : 'Posições dos planetas e casas para o local escolhido'}</p>
        </div>
        <aside className="glass detail moon-panel">
          <div className="moon-big">
            <MoonPhase angle={moon.angle} size={150} south={loc.lat < 0} />
          </div>
          <h3>{moon.name}</h3>
          <p className="muted">
            Lua em {SIGNS[sky.points.moon.sign].name} {formatDegree(sky.points.moon.lon, false)} · {Math.round(moon.illumination * 100)}% iluminada · {moon.waxing ? 'crescendo' : 'minguando'}
          </p>
          <p>{moonSignOfDayText(sky.points.moon.sign)}</p>
          <ul className="phase-list">
            {phases.map((p, i) => (
              <li key={i}>
                <MoonPhase angle={p.quarter * 90} size={26} south={loc.lat < 0} />
                <span>{p.name}</span>
                <small>{p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {p.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {mode === 'pessoal' && natal && score && (
        <section className="personal">
          <div className="glass pad">
            <div className="section-title">
              <h2>Seu dia sob este céu</h2>
              <span className={`flow-badge ${score.flow > 20 ? 'good' : score.flow < -20 ? 'hard' : ''}`}>
                Fluxo {score.flow > 0 ? '+' : ''}{score.flow} · Intensidade {score.intensity}
              </span>
            </div>
            <AreaMeters areas={score.areas} />
          </div>
          <div className="transit-cards">
            {hits.slice(0, 8).map((h, i) => (
              <article key={i} className="glass transit-card" style={{ ['--accent' as string]: h.type.color, animationDelay: `${i * 0.05}s` }}>
                <div className="tc-glyphs">
                  <span style={{ color: POINTS[h.transit].color }}>{POINTS[h.transit].glyph}</span>
                  <span className="tc-asp" style={{ color: h.type.color }}>{h.type.glyph}</span>
                  <span style={{ color: POINTS[h.natal].color }}>{POINTS[h.natal].glyph}</span>
                </div>
                <h4>{transitHeadline(h.transit, h.natal, h.type.key)}</h4>
                <p className="muted small">{h.type.name} · orbe {h.orb.toFixed(2)}° · {h.applying ? 'aproximando' : 'afastando'}{h.transitRetro ? ' · ℞' : ''}{natal.hasHouses ? ` · trânsito pela casa ${h.house}` : ''}</p>
                <p>{transitText(h.transit, h.natal, h.type.key)}</p>
              </article>
            ))}
            {hits.length === 0 && <p className="glass pad">Nenhum trânsito exato neste momento — um céu tranquilo para você.</p>}
          </div>
          <button className="cta" onClick={() => go('previsoes')}><span>✧ Ver projeção dos próximos dias ✧</span></button>
        </section>
      )}

      <section className="sky-grid">
        <div className="glass pad">
          <h2>Planetas agora</h2>
          <ul className="planet-rows">
            {(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'] as PlanetKey[]).map((k) => {
              const p = sky.points[k]
              const s = SIGNS[p.sign]
              return (
                <li key={k}>
                  <span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span>
                  <span className="pn">{POINTS[k].name}</span>
                  <span className="ps" style={{ color: ELEMENT_INFO[s.element].color }}>{s.glyph}</span>
                  <span className="mono">{formatDegree(p.lon)}</span>
                  {p.retro && <span className="retro">℞</span>}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="glass pad">
          <h2>Retrogradações</h2>
          {retros.length === 0 ? <p>Nenhum planeta retrógrado — energia de avanço direto.</p> : (
            <ul className="retro-list">
              {retros.map((k) => <li key={k}><span style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span> {RETRO_TEXT[k]}</li>)}
            </ul>
          )}
          <h2 className="mt">Aspectos do céu</h2>
          <ul className="aspect-list">
            {sky.aspects.filter((a) => a.type.major && a.a !== 'asc' && a.b !== 'asc' && a.a !== 'mc' && a.b !== 'mc' && a.a !== 'lilith' && a.b !== 'lilith').slice(0, 10).map((a, i) => (
              <li key={i}>
                <span style={{ color: a.type.color }}>{a.type.glyph}</span>
                {POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}
                <small>{a.orb.toFixed(1)}° {a.applying ? '↗' : '↘'}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
