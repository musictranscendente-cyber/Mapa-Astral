import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { ASPECT_POINTS } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, formatDegree, norm360, type PointKey } from '../astro/constants'
import { HOUSE_SYSTEMS } from '../astro/houses'
import { formatInZone, localToUtc, offsetLabel } from '../astro/time'
import { AiReading } from '../components/AiReading'
import { ChartWheel } from '../components/ChartWheel'
import { chartSummary } from '../ai/prompts'
import { ElementBars } from '../components/Charts'
import { natalAspectText } from '../interpret/aspects'
import { HOUSE_TEXT, PLANET_TEXT, planetInHouse } from '../interpret/planets'
import { buildNatalReport, planetInSign } from '../interpret/report'
import { SIGN_TEXT } from '../interpret/signs'
import type { Settings } from '../lib/profiles'
import type { Route } from '../App'

type Tab = 'relatorio' | 'ia' | 'planetas' | 'casas' | 'aspectos' | 'elementos'

interface Props {
  natal: Chart | null
  settings: Settings
  setSettings: (fn: (s: Settings) => Settings) => void
  go: (r: Route) => void
}

export function NatalPage({ natal, settings, setSettings, go }: Props) {
  const [selected, setSelected] = useState<PointKey | null>(null)
  const [tab, setTab] = useState<Tab>('relatorio')
  const report = useMemo(() => (natal ? buildNatalReport(natal) : []), [natal])

  if (!natal || !natal.birth) {
    return (
      <div className="empty glass">
        <h2>Nenhum mapa ainda</h2>
        <p>Crie seu primeiro mapa astral para desbloquear o relatório completo.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }

  const b = natal.birth
  const utc = localToUtc(b.local, b.timeZone)
  const when = formatInZone(utc, b.timeZone, { dateStyle: 'long', ...(b.timeUnknown ? {} : { timeStyle: 'short' }) })

  return (
    <div className="natal">
      <header className="page-head">
        <p className="eyebrow">Mapa Natal</p>
        <h1 className="title-glow">{b.name}</h1>
        <p className="muted">
          {when} · {b.place} · {offsetLabel(utc, b.timeZone)}
          {b.timeUnknown && ' · hora desconhecida (mapa solar ao meio-dia)'}
        </p>
        <div className="head-tools">
          <label className="select">
            <span>Sistema de casas</span>
            <select value={settings.houseSystem} onChange={(e) => setSettings((s) => ({ ...s, houseSystem: e.target.value as Settings['houseSystem'] }))}>
              {HOUSE_SYSTEMS.map((h) => <option key={h.key} value={h.key}>{h.name}</option>)}
            </select>
          </label>
          <button className="ghost" onClick={() => window.print()}>⎙ Imprimir / PDF</button>
        </div>
        {natal.houseFallback && <p className="warn">Latitude polar: o sistema escolhido não é definido aqui — usando Porfírio.</p>}
      </header>

      <section className="wheel-layout">
        <div className="wheel-box">
          <ChartWheel chart={natal} selected={selected} onSelect={setSelected} />
          <p className="hint">Toque em um planeta para ver seus aspectos e interpretação</p>
        </div>
        <aside className="glass detail">
          {selected ? <PointDetail chart={natal} k={selected} /> : <Overview chart={natal} />}
        </aside>
      </section>

      <nav className="tabs">
        {([
          ['relatorio', 'Relatório'],
          ['ia', '✦ Leitura IA'],
          ['planetas', 'Planetas'],
          ['casas', 'Casas'],
          ['aspectos', 'Aspectos'],
          ['elementos', 'Elementos'],
        ] as [Tab, string][]).map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>

      <section className="tab-body" key={tab}>
        {tab === 'relatorio' && (
          <div className="report">
            {report.map((s, i) => (
              <article key={s.id} className="glass report-card" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s`, ['--accent' as string]: s.color ?? '#ffe8a3' }}>
                <div className="report-glyph">{s.glyph}</div>
                <div>
                  <h3>{s.title}</h3>
                  {s.subtitle && <p className="subtitle">{s.subtitle}</p>}
                  {s.paragraphs.filter(Boolean).map((p, j) => <p key={j}>{p}</p>)}
                  {s.tags && <div className="tags">{s.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === 'ia' && (
          <AiReading
            kind="natal"
            cacheKey={`${b.name}|${utc.toISOString()}|${b.latitude},${b.longitude}|${natal.houseSystem}`}
            getSummary={() => chartSummary(natal)}
            onOpenSettings={() => go('ajustes')}
          />
        )}
        {tab === 'planetas' && <PlanetTable chart={natal} onPick={(k) => { setSelected(k); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}
        {tab === 'casas' && <HouseTable chart={natal} />}
        {tab === 'aspectos' && <AspectGrid chart={natal} />}
        {tab === 'elementos' && (
          <div className="glass pad">
            <ElementBars balance={natal.balance} />
            {natal.hasHouses && <Hemispheres chart={natal} />}
          </div>
        )}
      </section>
    </div>
  )
}

function Overview({ chart }: { chart: Chart }) {
  const P = chart.points
  const el = Object.entries(chart.balance.elements).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof ELEMENT_INFO
  return (
    <div className="overview">
      <p className="eyebrow">Síntese</p>
      <h3>{SIGN_TEXT[P.sun.sign].title}</h3>
      <ul className="trio">
        <li><span style={{ color: POINTS.sun.color }}>{POINTS.sun.glyph}</span> Sol <b>{formatDegree(P.sun.lon)}</b></li>
        <li><span style={{ color: POINTS.moon.color }}>{POINTS.moon.glyph}</span> Lua <b>{formatDegree(P.moon.lon)}</b></li>
        {chart.hasHouses && <li><span className="ac">AC</span> Ascendente <b>{formatDegree(chart.asc)}</b></li>}
        {chart.hasHouses && <li><span className="ac">MC</span> Meio do Céu <b>{formatDegree(chart.mc)}</b></li>}
      </ul>
      <p>
        Elemento dominante: <b style={{ color: ELEMENT_INFO[el].color }}>{ELEMENT_INFO[el].name}</b> — {ELEMENT_INFO[el].essence}.
      </p>
      <p className="muted">
        {chart.hasHouses ? (chart.isDayChart ? 'Mapa diurno: o Sol estava acima do horizonte.' : 'Mapa noturno: o Sol estava abaixo do horizonte.') : 'Sem hora de nascimento, as casas e o ascendente não são exibidos.'}
      </p>
      <p className="muted small">Obliquidade {chart.obliquity.toFixed(4)}° · RAMC {chart.ramc.toFixed(3)}° · {chart.aspects.length} aspectos</p>
    </div>
  )
}

function PointDetail({ chart, k }: { chart: Chart; k: PointKey }) {
  const p = chart.points[k]
  const info = POINTS[k]
  const aspects = chart.aspects.filter((a) => a.a === k || a.b === k)
  return (
    <div className="point-detail">
      <div className="pd-head">
        <span className="pd-glyph" style={{ color: info.color }}>{info.glyph}</span>
        <div>
          <h3>{info.name} em {SIGNS[p.sign].name}</h3>
          <p className="muted">
            {formatDegree(p.lon)}{chart.hasHouses ? ` · Casa ${p.house}` : ''}{p.retro ? ' · ℞ Retrógrado' : ''}{p.dignity ? ` · ${p.dignity}` : ''}
          </p>
        </div>
      </div>
      {PLANET_TEXT[k] && <p>{PLANET_TEXT[k]!.description}</p>}
      {PLANET_TEXT[k] && k !== 'asc' && k !== 'mc' && <p>{planetInSign(k, p.sign)}</p>}
      {chart.hasHouses && PLANET_TEXT[k] && k !== 'asc' && k !== 'mc' && <p>{planetInHouse(k, p.house)}</p>}
      {k === 'fortune' && <p>A Roda da Fortuna indica onde você encontra prosperidade e alegria espontânea — na {HOUSE_TEXT[p.house - 1].name}: {HOUSE_TEXT[p.house - 1].theme.toLowerCase()}.</p>}
      {aspects.length > 0 && (
        <>
          <p className="eyebrow">Aspectos</p>
          <ul className="aspect-list">
            {aspects.map((a, i) => {
              const other = a.a === k ? a.b : a.a
              return (
                <li key={i} title={natalAspectText(a.a, a.b, a.type.key)}>
                  <span style={{ color: a.type.color }}>{a.type.glyph}</span>
                  {a.type.name} {POINTS[other].name}
                  <small>{a.orb.toFixed(1)}° {a.applying ? 'aplicativo' : 'separativo'}</small>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

function PlanetTable({ chart, onPick }: { chart: Chart; onPick: (k: PointKey) => void }) {
  const keys: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'southNode', 'lilith']
  if (chart.hasHouses) keys.push('fortune', 'asc', 'mc')
  return (
    <div className="glass table-wrap">
      <table className="astro-table">
        <thead>
          <tr><th>Ponto</th><th>Posição</th><th>Signo</th>{chart.hasHouses && <th>Casa</th>}<th>Velocidade</th><th>Dignidade</th></tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const p = chart.points[k]
            const s = SIGNS[p.sign]
            return (
              <tr key={k} onClick={() => onPick(k)}>
                <td><span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span> {POINTS[k].name}</td>
                <td className="mono">{formatDegree(p.lon, false)}{p.retro && <span className="retro"> ℞</span>}</td>
                <td><span style={{ color: ELEMENT_INFO[s.element].color }}>{s.glyph}</span> {s.name}</td>
                {chart.hasHouses && <td>{p.house}</td>}
                <td className="mono">{p.speed ? `${p.speed.toFixed(3)}°/d` : '—'}</td>
                <td>{p.dignity ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HouseTable({ chart }: { chart: Chart }) {
  if (!chart.hasHouses) return <div className="glass pad"><p>Sem hora de nascimento não é possível calcular as casas.</p></div>
  return (
    <div className="house-grid">
      {chart.cusps.map((c, i) => {
        const s = SIGNS[Math.floor(norm360(c) / 30)]
        const inside = (Object.keys(chart.points) as PointKey[]).filter((k) =>
          !['asc', 'mc', 'dsc', 'ic', 'southNode'].includes(k) && chart.points[k].house === i + 1)
        return (
          <article key={i} className="glass house-card" style={{ ['--el' as string]: ELEMENT_INFO[s.element].color }}>
            <div className="house-num-big">{i + 1}</div>
            <h4>{HOUSE_TEXT[i].theme}</h4>
            <p className="muted mono">{formatDegree(c)}</p>
            <p className="small">{HOUSE_TEXT[i].description}</p>
            {inside.length > 0 && (
              <p className="inside">{inside.map((k) => <span key={k} style={{ color: POINTS[k].color }} title={POINTS[k].name}>{POINTS[k].glyph}</span>)}</p>
            )}
          </article>
        )
      })}
    </div>
  )
}

function AspectGrid({ chart }: { chart: Chart }) {
  const keys = ASPECT_POINTS.filter((k) => chart.hasHouses || (k !== 'asc' && k !== 'mc'))
  const [hover, setHover] = useState<string>('')
  const find = (a: PointKey, b: PointKey) => chart.aspects.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a))
  return (
    <div className="glass pad aspects-tab">
      <div className="grid-scroll">
        <table className="aspect-grid">
          <tbody>
            {keys.map((row, i) => (
              <tr key={row}>
                {keys.slice(0, i).map((col) => {
                  const asp = find(row, col)
                  return (
                    <td
                      key={col}
                      className={asp ? 'has' : ''}
                      onMouseEnter={() => asp && setHover(`${asp.type.name} ${POINTS[row].name}–${POINTS[col].name} (${asp.orb.toFixed(2)}°): ${natalAspectText(asp.a, asp.b, asp.type.key)}`)}
                      style={asp ? { color: asp.type.color, background: `${asp.type.color}1a` } : undefined}
                    >
                      {asp?.type.glyph}
                    </td>
                  )
                })}
                <th style={{ color: POINTS[row].color }} title={POINTS[row].name}>{POINTS[row].glyph}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="aspect-hover">{hover || 'Passe o dedo/mouse sobre um aspecto para ler sua interpretação.'}</p>
      <ul className="aspect-cards">
        {chart.aspects.map((a, i) => (
          <li key={i} className="glass-soft">
            <span className="ag" style={{ color: a.type.color }}>{a.type.glyph}</span>
            <div>
              <strong>{POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}</strong>
              <small> · orbe {a.orb.toFixed(2)}° · {a.applying ? 'aplicativo' : 'separativo'}</small>
              <p>{natalAspectText(a.a, a.b, a.type.key)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Hemispheres({ chart }: { chart: Chart }) {
  const h = chart.balance.hemispheres
  const tot = h.north + h.south || 1
  const above = Math.round((h.south / tot) * 100)
  const east = Math.round((h.east / tot) * 100)
  return (
    <div className="hemis">
      <div className="hemi-box">
        <div className="hemi-fill top" style={{ height: `${above}%` }} />
        <div className="hemi-fill left" style={{ width: `${east}%` }} />
        <span className="hl t">Acima do horizonte {above}%</span>
        <span className="hl b">Abaixo {100 - above}%</span>
        <span className="hl l">Leste {east}%</span>
        <span className="hl r">Oeste {100 - east}%</span>
      </div>
      <p>
        {above > 55 ? 'Com a maioria dos planetas acima do horizonte, sua vida tende a se voltar para o mundo, a carreira e a vida pública.' : above < 45 ? 'Com a maioria dos planetas abaixo do horizonte, sua força está na vida interior, na intimidade e na construção de bases sólidas.' : 'Seus planetas se dividem entre o mundo interior e o exterior: equilíbrio entre vida privada e pública.'}{' '}
        {east > 55 ? 'A ênfase no Leste indica autonomia: você é o autor do próprio destino.' : east < 45 ? 'A ênfase no Oeste indica que você se realiza através das relações e parcerias.' : ''}
      </p>
    </div>
  )
}
