import { useEffect, useMemo, useRef, useState } from 'react'
import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, ELEMENT_INFO, angDiff, formatDegree, type PointKey } from '../astro/constants'
import { houseOf, type HouseSystem } from '../astro/houses'
import { currentReturnYear, solarReturnChart } from '../astro/solarReturn'
import { solarReturnSummary } from '../ai/prompts'
import { AiReading } from '../components/AiReading'
import { ChartWheel } from '../components/ChartWheel'
import { ElementBars } from '../components/Charts'
import { HOUSE_TEXT } from '../interpret/planets'
import { SR_ASC, SR_MOON_HOUSE, SR_SUN_HOUSE } from '../interpret/solarReturn'
import { placeLabel, searchPlaces, type Place } from '../lib/geo'
import type { Route } from '../App'

interface Props {
  natal: Chart | null
  houseSystem: HouseSystem
  go: (r: Route) => void
}

interface Where { latitude: number; longitude: number; label: string }

export function SolarReturnPage({ natal, houseSystem, go }: Props) {
  const [year, setYear] = useState(() => (natal ? currentReturnYear(natal) : new Date().getFullYear()))
  const [where, setWhere] = useState<Where | null>(() =>
    natal?.birth ? { latitude: natal.latitude, longitude: natal.longitude, label: natal.birth.place } : null)

  const sr = useMemo(() => (natal && where ? solarReturnChart(natal, year, where, houseSystem) : null), [natal, where, year, houseSystem])

  if (!natal || !natal.birth || !where) {
    return (
      <div className="empty glass">
        <h2>Revolução Solar</h2>
        <p>Crie primeiro o seu mapa natal para calcular o mapa do seu ano pessoal.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }
  if (!sr) return null

  const ascSign = SIGNS[sr.points.asc.sign]
  const sunHouse = sr.points.sun.house
  const moonHouse = sr.points.moon.house
  const ascInNatal = natal.hasHouses ? houseOf(sr.asc, natal.cusps) : null
  const angular = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as PointKey[])
    .flatMap((k) => ([['AC', sr.asc], ['MC', sr.mc], ['DC', sr.asc + 180], ['IC', sr.mc + 180]] as const)
      .filter(([, lon]) => Math.abs(angDiff(lon, sr.points[k].lon)) <= 6)
      .map(([ang]) => ({ k, ang })))
  const when = sr.date.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const thisYear = currentReturnYear(natal)

  return (
    <div className="solar-return">
      <header className="page-head">
        <p className="eyebrow">Seu ano astrológico</p>
        <h1 className="title-glow">Revolução Solar {year}</h1>
        <p className="muted">
          O Sol retorna a {formatDegree(natal.points.sun.lon)} em <b>{when}</b> (horário deste aparelho) · válida até o aniversário de {year + 1}
        </p>
        <div className="head-tools">
          <button className="ghost" onClick={() => setYear((y) => y - 1)}>‹ {year - 1}</button>
          {year !== thisYear && <button className="ghost" onClick={() => setYear(thisYear)}>Ano atual</button>}
          <button className="ghost" onClick={() => setYear((y) => y + 1)}>{year + 1} ›</button>
        </div>
        <LocationPicker where={where} natal={natal} onChange={setWhere} />
      </header>

      <section className="wheel-layout">
        <div className="wheel-box">
          <ChartWheel chart={sr} />
          <p className="hint">Mapa do instante exato do retorno solar, para {where.label}</p>
        </div>
        <aside className="glass detail">
          <p className="eyebrow">O tom do ano</p>
          <div className="pd-head">
            <span className="pd-glyph" style={{ color: ELEMENT_INFO[ascSign.element].color }}>{ascSign.glyph}</span>
            <div>
              <h3>Ascendente em {ascSign.name}</h3>
              <p className="muted">{formatDegree(sr.asc)}{ascInNatal ? ` · na casa ${ascInNatal} natal` : ''}</p>
            </div>
          </div>
          <p className="serif">{SR_ASC[sr.points.asc.sign]}</p>
          {ascInNatal && (
            <p className="serif">O Ascendente do ano cai na sua {HOUSE_TEXT[ascInNatal - 1].name.toLowerCase()} natal: o ano mobiliza especialmente {HOUSE_TEXT[ascInNatal - 1].theme.toLowerCase()}.</p>
          )}
        </aside>
      </section>

      <section className="sr-cards">
        <article className="glass report-card" style={{ ['--accent' as string]: POINTS.sun.color }}>
          <div className="report-glyph">{POINTS.sun.glyph}</div>
          <div>
            <h3>Onde está a luz do ano</h3>
            <p className="subtitle">Sol na casa {sunHouse} · {HOUSE_TEXT[sunHouse - 1].theme}</p>
            <p>{SR_SUN_HOUSE[sunHouse - 1]}</p>
          </div>
        </article>
        <article className="glass report-card" style={{ ['--accent' as string]: POINTS.moon.color }}>
          <div className="report-glyph">{POINTS.moon.glyph}</div>
          <div>
            <h3>O clima emocional</h3>
            <p className="subtitle">Lua em {SIGNS[sr.points.moon.sign].name}, casa {moonHouse}</p>
            <p>{SR_MOON_HOUSE[moonHouse - 1]}</p>
          </div>
        </article>
        <article className="glass report-card" style={{ ['--accent' as string]: '#ffe8a3' }}>
          <div className="report-glyph">✶</div>
          <div>
            <h3>Planetas em destaque</h3>
            <p className="subtitle">Planetas próximos aos ângulos ganham força no ano</p>
            {angular.length === 0
              ? <p>Nenhum planeta angular: a energia do ano se distribui de forma equilibrada entre as casas.</p>
              : angular.map(({ k, ang }, i) => <p key={i}><b style={{ color: POINTS[k].color }}>{POINTS[k].glyph} {POINTS[k].name}</b> junto ao {ang}: {ANGLE_TEXT[ang]}</p>)}
          </div>
        </article>
      </section>

      <section className="sky-grid">
        <div className="glass pad">
          <h2>Posições do ano</h2>
          <ul className="planet-rows">
            {(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'] as PointKey[]).map((k) => {
              const p = sr.points[k]
              return (
                <li key={k}>
                  <span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span>
                  <span className="pn">{POINTS[k].name}</span>
                  <span className="ps" style={{ color: ELEMENT_INFO[SIGNS[p.sign].element].color }}>{SIGNS[p.sign].glyph}</span>
                  <span className="mono">{formatDegree(p.lon)} · casa {p.house}</span>
                  {p.retro && <span className="retro">℞</span>}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="glass pad">
          <h2>Elementos do ano</h2>
          <ElementBars balance={sr.balance} />
          <h2 className="mt">Aspectos principais</h2>
          <ul className="aspect-list">
            {sr.aspects.filter((a) => a.type.major && a.a !== 'lilith' && a.b !== 'lilith').slice(0, 10).map((a, i) => (
              <li key={i}>
                <span style={{ color: a.type.color }}>{a.type.glyph}</span>
                {POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}
                <small>{a.orb.toFixed(1)}°</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AiReading
        kind="revolucao"
        cacheKey={`${natal.birth.name}|${natal.date.toISOString()}|${year}|${where.latitude.toFixed(2)},${where.longitude.toFixed(2)}|${houseSystem}`}
        getSummary={() => solarReturnSummary(natal, sr, year, where.label)}
        onOpenSettings={() => go('ajustes')}
      />
    </div>
  )
}

const ANGLE_TEXT: Record<string, string> = {
  AC: 'marca a sua personalidade e o corpo durante todo o ano.',
  MC: 'coloca carreira e reputação em evidência.',
  DC: 'traz esse tema através das relações e parcerias.',
  IC: 'atua no lar, na família e nas bases emocionais.',
}

/** The return is cast for where you will be on your birthday. */
function LocationPicker({ where, natal, onChange }: { where: Where; natal: Chart; onChange: (w: Where) => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    if (q.trim().length < 2) return
    const id = setTimeout(async () => {
      abort.current?.abort()
      const ctl = new AbortController()
      abort.current = ctl
      try { setResults(await searchPlaces(q, ctl.signal)) } catch { /* aborted */ }
    }, 300)
    return () => clearTimeout(id)
  }, [q])

  const birth = natal.birth!
  return (
    <div className="sr-location">
      <p className="muted small">Calcule para o lugar onde você estará no aniversário — isso muda as casas do ano.</p>
      <div className="head-tools">
        <button className={`ghost ${where.label === birth.place ? 'on' : ''}`} onClick={() => onChange({ latitude: natal.latitude, longitude: natal.longitude, label: birth.place })}>⌂ Cidade natal</button>
        <button className="ghost" onClick={() => navigator.geolocation?.getCurrentPosition((p) => onChange({ latitude: p.coords.latitude, longitude: p.coords.longitude, label: 'Minha localização' }))}>⌖ Onde estou</button>
        <div className="field city small-city">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Outra cidade…" />
          {q.trim().length >= 2 && results.length > 0 && (
            <ul className="dropdown glass">
              {results.map((r, i) => (
                <li key={i}>
                  <button type="button" onClick={() => { onChange({ latitude: r.latitude, longitude: r.longitude, label: placeLabel(r) }); setQ(''); setResults([]) }}>
                    <strong>{r.name}</strong><small>{[r.region, r.country].filter(Boolean).join(', ')}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
