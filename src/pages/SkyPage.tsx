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
import { locale, t } from '../i18n'

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

  const MINE = 'sua localização atual'
  const placeName = loc.label === MINE ? t(MINE) : loc.label
  const retros = (['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron'] as PlanetKey[]).filter((k) => sky.points[k].retro)

  const [locating, setLocating] = useState<'' | 'busy' | 'error'>('')
  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocating('error'); return }
    setLocating('busy')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: MINE })
        setLocating('')
      },
      () => setLocating('error'),
      { timeout: 15000, maximumAge: 600000 },
    )
  }

  const shift = (days: number) => {
    setLive(false)
    setDate((d) => new Date(d.getTime() + days * 86400000))
  }

  return (
    <div className="sky">
      <header className="page-head">
        <p className="eyebrow">{t('Céu do momento')}</p>
        <h1 className="title-glow">{date.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h1>
        <p className="muted">
          {date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })} ({userTimeZone()}) · {placeName}
          {live && <span className="live-dot"> ● {t('ao vivo')}</span>}
        </p>
      </header>

      <section className="wheel-layout">
        <div>
          <div className="wheel-box">
            {mode === 'pessoal' && natal
              ? <ChartWheel chart={natal} outer={sky} outerHits={hits} showAspects={false} />
              : <ChartWheel chart={sky} />}
            <p className="hint">{t(mode === 'pessoal' && natal ? 'Anel externo (turquesa): planetas em trânsito agora · interno: seu mapa natal' : 'Posições dos planetas e casas para o local escolhido')}</p>
          </div>
          {/* controls sit under the wheel so the drawing shows whole on first view */}
          <div className="sky-controls">
            <div className="head-tools">
              <button className="ghost" onClick={() => shift(-1)}>‹ {t('Ontem')}</button>
              <button className="ghost" onClick={() => { setLive(true); setDate(new Date()) }}>{t('Agora')}</button>
              <button className="ghost" onClick={() => shift(1)}>{t('Amanhã')} ›</button>
            </div>
            <input
              type="datetime-local"
              aria-label={t('Data e hora')}
              value={toInput(date)}
              onChange={(e) => { if (e.target.value) { setLive(false); setDate(new Date(e.target.value)) } }}
            />
            {natal && (
              <div className="segmented">
                <button className={mode === 'pessoal' ? 'active' : ''} onClick={() => setMode('pessoal')}>{t('Céu × Meu mapa')}</button>
                <button className={mode === 'ceu' ? 'active' : ''} onClick={() => setMode('ceu')}>{t('Céu do lugar')}</button>
              </div>
            )}
            {/* the place only changes the houses and angles, so it belongs to the "sky of a place" view */}
            {mode === 'ceu' ? (
              <p className="sky-place">
                <span>📍 {t('Céu visto de')} <b>{placeName}</b></span>
                {loc.label === MINE && profile ? (
                  <button className="ghost" onClick={() => setLoc({ lat: profile.latitude, lon: profile.longitude, label: profile.place })}>⌂ {t('Voltar para {place}', { place: profile.place.split(',')[0] })}</button>
                ) : (
                  <button className="ghost" disabled={locating === 'busy'} onClick={useMyLocation}>
                    {locating === 'busy' ? t('Localizando…') : `⌖ ${t('Usar minha localização')}`}
                  </button>
                )}
                {locating === 'error' && <span className="muted small">{t('Não foi possível obter sua localização. Libere a localização para este site e tente de novo.')}</span>}
              </p>
            ) : (
              <p className="sky-place muted small">{t('Seu mapa natal por dentro, os planetas de agora por fora.')}</p>
            )}
          </div>
        </div>
        <aside className="glass detail moon-panel">
          <div className="moon-big">
            <MoonPhase angle={moon.angle} size={150} south={loc.lat < 0} />
          </div>
          <h3>{t(moon.name)}</h3>
          <p className="muted">
            {t('{planet} em {sign}', { planet: POINTS.moon.name, sign: SIGNS[sky.points.moon.sign].name })} {formatDegree(sky.points.moon.lon, false)} · {t('{pct}% iluminada', { pct: Math.round(moon.illumination * 100) })} · {t(moon.waxing ? 'crescendo' : 'minguando')}
          </p>
          <p>{moonSignOfDayText(sky.points.moon.sign)}</p>
          <ul className="phase-list">
            {phases.map((p, i) => (
              <li key={i}>
                <MoonPhase angle={p.quarter * 90} size={26} south={loc.lat < 0} />
                <span>{t(p.name)}</span>
                <small>{p.date.toLocaleDateString(locale(), { day: '2-digit', month: 'short' })} · {p.date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}</small>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {mode === 'pessoal' && natal && score && (
        <section className="personal">
          <div className="glass pad">
            <div className="section-title">
              <h2>{t('Seu dia sob este céu')}</h2>
              <span className={`flow-badge ${score.flow > 20 ? 'good' : score.flow < -20 ? 'hard' : ''}`}>
                {t('Fluxo')} {score.flow > 0 ? '+' : ''}{score.flow} · {t('Intensidade')} {score.intensity}
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
                <p className="muted small">{h.type.name} · {t('orbe')} {h.orb.toFixed(2)}° · {t(h.applying ? 'aproximando' : 'afastando')}{h.transitRetro ? ' · ℞' : ''}{natal.hasHouses ? ` · ${t('trânsito pela casa {n}', { n: h.house })}` : ''}</p>
                <p>{transitText(h.transit, h.natal, h.type.key)}</p>
              </article>
            ))}
            {hits.length === 0 && <p className="glass pad">{t('Nenhum trânsito exato neste momento — um céu tranquilo para você.')}</p>}
          </div>
          <button className="cta" onClick={() => go('previsoes')}><span>✧ {t('Ver projeção dos próximos dias')} ✧</span></button>
        </section>
      )}

      <section className="sky-grid">
        <div className="glass pad">
          <h2>{t('Planetas agora')}</h2>
          <ul className="planet-rows">
            {(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node'] as PlanetKey[]).map((k) => {
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
          <h2>{t('Retrogradações')}</h2>
          {retros.length === 0 ? <p>{t('Nenhum planeta retrógrado — energia de avanço direto.')}</p> : (
            <ul className="retro-list">
              {retros.map((k) => <li key={k}><span style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span> {RETRO_TEXT[k]}</li>)}
            </ul>
          )}
          <h2 className="mt">{t('Aspectos do céu')}</h2>
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
