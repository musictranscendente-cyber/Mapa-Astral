import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { ASPECT_POINTS } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, formatDegree, type PointKey } from '../astro/constants'
import { HOUSE_SYSTEMS } from '../astro/houses'
import { formatInZone, localToUtc, offsetLabel } from '../astro/time'
import { AiReading } from '../components/AiReading'
import { ChartWheel } from '../components/ChartWheel'
import { chartSummary } from '../ai/prompts'
import { ElementBars } from '../components/Charts'
import { natalAspectText } from '../interpret/aspects'
import { houseReading } from '../interpret/houses'
import { HOUSE_TEXT, PLANET_TEXT, planetInHouse } from '../interpret/planets'
import { buildNatalReport, planetInSign } from '../interpret/report'
import { SIGN_TEXT } from '../interpret/signs'
import type { Settings } from '../lib/profiles'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { natalKey } from '../billing/rules'
import { Locked } from '../components/Locked'
import { ShareDialog } from '../components/ShareDialog'
import { PrintReport } from '../components/PrintReport'
import type { Route } from '../App'
import { t } from '../i18n'

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
  const access = useAccess()
  const [sharing, setSharing] = useState(false)

  if (!natal || !natal.birth) {
    return (
      <div className="empty glass">
        <h2>{t('Nenhum mapa ainda')}</h2>
        <p>{t('Crie seu primeiro mapa astral para desbloquear o relatório completo.')}</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ {t('Criar mapa')}</span></button>
      </div>
    )
  }

  const b = natal.birth
  const utc = localToUtc(b.local, b.timeZone)
  const bk = birthKey(b)
  const needsLogin = access.enabled && !access.loggedIn
  const loginLock = (title: string) => <Locked title={title} text={t('Crie sua conta grátis: seus mapas ficam salvos e você libera o relatório completo.')} go={go} />
  const when = formatInZone(utc, b.timeZone, { dateStyle: 'long', ...(b.timeUnknown ? {} : { timeStyle: 'short' }) })

  return (
    <div className="natal">
      <header className="page-head">
        <p className="eyebrow">{t('Mapa Natal')}</p>
        <h1 className="title-glow">{b.name}</h1>
        <p className="muted">
          {when} · {b.place} · {offsetLabel(utc, b.timeZone)}
          {b.timeUnknown && ` · ${t('hora desconhecida (mapa solar ao meio-dia)')}`}
        </p>
        <div className="head-tools">
          <label className="select">
            <span>{t('Sistema de casas')}</span>
            <select value={settings.houseSystem} onChange={(e) => setSettings((s) => ({ ...s, houseSystem: e.target.value as Settings['houseSystem'] }))}>
              {HOUSE_SYSTEMS.map((h) => <option key={h.key} value={h.key}>{t(h.name)}</option>)}
            </select>
          </label>
          <button className="ghost share-btn" onClick={() => setSharing(true)}>✦ {t('Compartilhar meu mapa')}</button>
          <button className="ghost" onClick={() => window.print()}>⎙ {t('Baixar PDF')}</button>
        </div>
        {natal.houseFallback && <p className="warn">{t('Latitude polar: o sistema escolhido não é definido aqui — usando Porfírio.')}</p>}
      </header>

      {sharing && <ShareDialog chart={natal} onClose={() => setSharing(false)} />}
      <PrintReport chart={natal} report={needsLogin ? report.slice(0, 3) : report} when={when} />

      <section className="wheel-layout">
        <div className="wheel-box">
          <ChartWheel chart={natal} selected={selected} onSelect={setSelected} />
          <p className="hint">{t('Toque em um planeta para ver seus aspectos e interpretação')}</p>
        </div>
        <aside className="glass detail">
          {selected ? <PointDetail chart={natal} k={selected} /> : <Overview chart={natal} />}
        </aside>
      </section>

      <nav className="tabs">
        {([
          ['relatorio', 'Relatório'],
          ['ia', 'Análise completa'],
          ['planetas', 'Planetas'],
          ['casas', 'Casas'],
          ['aspectos', 'Aspectos'],
          ['elementos', 'Elementos'],
        ] as [Tab, string][]).map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{k === 'ia' ? '✦ ' : ''}{t(l)}</button>
        ))}
      </nav>

      <section className="tab-body" key={tab}>
        {tab === 'relatorio' && (
          <div className="report">
            {(needsLogin ? report.slice(0, 3) : report).map((s, i) => (
              <article key={s.id} className="glass report-card" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s`, ['--accent' as string]: s.color ?? '#ffe8a3' }}>
                <div className="report-glyph">{s.glyph}</div>
                <div>
                  <h3>{s.title}</h3>
                  {s.subtitle && <p className="subtitle">{s.subtitle}</p>}
                  {s.paragraphs.filter(Boolean).map((p, j) => <p key={j}>{p}</p>)}
                  {s.tags && <div className="tags">{s.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                </div>
              </article>
            ))}
            {needsLogin && loginLock(`Mais ${report.length - 3} capítulos do seu relatório`)}
          </div>
        )}
        {tab === 'ia' && (
          <AiReading
            kind="natal"
            subject={b.name}
            cacheKey={`${b.name}|${utc.toISOString()}|${b.latitude},${b.longitude}|${natal.houseSystem}`}
            accessKey={natalKey(bk)}
            offer={{ product: 'natal', scope: { birth: bk }, label: b.name }}
            getSummary={() => chartSummary(natal)}
            go={go}
          />
        )}
        {tab === 'planetas' && <PlanetTable chart={natal} onPick={(k) => { setSelected(k); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}
        {needsLogin && (tab === 'casas' || tab === 'aspectos' || tab === 'elementos') && loginLock(t('Casas, aspectos e elementos do seu mapa'))}
        {!needsLogin && tab === 'casas' && <HouseTable chart={natal} />}
        {!needsLogin && tab === 'aspectos' && <AspectGrid chart={natal} />}
        {!needsLogin && tab === 'elementos' && (
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
      <p className="eyebrow">{t('Síntese')}</p>
      <h3>{SIGN_TEXT[P.sun.sign].title}</h3>
      <ul className="trio">
        <li><span style={{ color: POINTS.sun.color }}>{POINTS.sun.glyph}</span> {POINTS.sun.name} <b>{formatDegree(P.sun.lon)}</b></li>
        <li><span style={{ color: POINTS.moon.color }}>{POINTS.moon.glyph}</span> {POINTS.moon.name} <b>{formatDegree(P.moon.lon)}</b></li>
        {chart.hasHouses && <li><span className="ac">AC</span> {POINTS.asc.name} <b>{formatDegree(chart.asc)}</b></li>}
        {chart.hasHouses && <li><span className="ac">MC</span> {POINTS.mc.name} <b>{formatDegree(chart.mc)}</b></li>}
      </ul>
      <p>
        {t('Elemento dominante:')} <b style={{ color: ELEMENT_INFO[el].color }}>{ELEMENT_INFO[el].name}</b> — {ELEMENT_INFO[el].essence}.
      </p>
      <p className="muted">
        {t(chart.hasHouses ? (chart.isDayChart ? 'Mapa diurno: o Sol estava acima do horizonte.' : 'Mapa noturno: o Sol estava abaixo do horizonte.') : 'Sem hora de nascimento, as casas e o ascendente não são exibidos.')}
      </p>
      <p className="muted small">{t('Obliquidade {obl}° · RAMC {ramc}° · {n} aspectos', { obl: chart.obliquity.toFixed(4), ramc: chart.ramc.toFixed(3), n: chart.aspects.length })}</p>
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
          <h3>{t('{planet} em {sign}', { planet: info.name, sign: SIGNS[p.sign].name })}</h3>
          <p className="muted">
            {formatDegree(p.lon)}{chart.hasHouses ? ` · ${t('Casa {n}', { n: p.house })}` : ''}{p.retro ? ` · ℞ ${t('Retrógrado')}` : ''}{p.dignity ? ` · ${t(p.dignity)}` : ''}
          </p>
        </div>
      </div>
      {PLANET_TEXT[k] && <p>{PLANET_TEXT[k]!.description}</p>}
      {PLANET_TEXT[k] && k !== 'asc' && k !== 'mc' && <p>{planetInSign(k, p.sign)}</p>}
      {chart.hasHouses && PLANET_TEXT[k] && k !== 'asc' && k !== 'mc' && <p>{planetInHouse(k, p.house)}</p>}
      {k === 'fortune' && <p>{t('A Roda da Fortuna indica onde você encontra prosperidade e alegria espontânea — na {house}: {theme}.', { house: HOUSE_TEXT[p.house - 1].name, theme: HOUSE_TEXT[p.house - 1].theme.toLowerCase() })}</p>}
      {aspects.length > 0 && (
        <>
          <p className="eyebrow">{t('Aspectos')}</p>
          <ul className="aspect-list">
            {aspects.map((a, i) => {
              const other = a.a === k ? a.b : a.a
              return (
                <li key={i} title={natalAspectText(a.a, a.b, a.type.key)}>
                  <span style={{ color: a.type.color }}>{a.type.glyph}</span>
                  {a.type.name} {POINTS[other].name}
                  <small>{a.orb.toFixed(1)}° {t(a.applying ? 'aplicativo' : 'separativo')}</small>
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
  const keys: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node', 'southNode', 'lilith']
  if (chart.hasHouses) keys.push('fortune', 'asc', 'mc')
  return (
    <div className="glass table-wrap">
      <table className="astro-table">
        <thead>
          <tr><th>{t('Ponto')}</th><th>{t('Posição')}</th><th>{t('Signo')}</th>{chart.hasHouses && <th>{t('Casa')}</th>}<th>{t('Velocidade')}</th><th>{t('Dignidade')}</th></tr>
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
                <td>{p.dignity ? t(p.dignity) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HouseTable({ chart }: { chart: Chart }) {
  if (!chart.hasHouses) return <div className="glass pad"><p>{t('Sem hora de nascimento não é possível calcular as casas.')}</p></div>
  return (
    <>
      <p className="muted house-intro">
        {t('As 12 casas são as áreas da sua vida. O signo na cúspide mostra o jeito como você vive cada área, o regente mostra com que outra área ela se conecta e os planetas dentro dela mostram onde está a sua energia. Toque em uma casa para ver tudo.')}
      </p>
      <div className="house-grid">
        {chart.cusps.map((c, i) => {
          const r = houseReading(chart, i)
          const s = SIGNS[r.sign]
          return (
            <details key={i} className="glass house-card" style={{ ['--el' as string]: ELEMENT_INFO[s.element].color }}>
              <summary>
                <div className="house-num-big">{i + 1}</div>
                <h4>{HOUSE_TEXT[i].theme}</h4>
                <p className="muted mono">{s.glyph} {formatDegree(c)}</p>
                <p className="small">{HOUSE_TEXT[i].description}</p>
                {r.planets.length > 0 && (
                  <p className="inside">{r.planets.map(({ planet }) => <span key={planet} style={{ color: POINTS[planet].color }} title={POINTS[planet].name}>{POINTS[planet].glyph}</span>)}</p>
                )}
                <span className="house-more">{t('Ver interpretação')}</span>
              </summary>
              <div className="house-body">
                <p>{r.detail}</p>
                <h5>{s.glyph} {t('Signo na cúspide: {sign}', { sign: s.name })}</h5>
                <p>{r.cusp}</p>
                <h5><span style={{ color: POINTS[r.ruler.planet].color }}>{POINTS[r.ruler.planet].glyph}</span> {t('Regente da casa')}</h5>
                <p>{r.ruler.text}</p>
                <h5>{t('Planetas nesta casa')}</h5>
                {r.empty ? <p className="muted">{r.empty}</p> : r.planets.map(({ planet, text }) => (
                  <p key={planet}><b style={{ color: POINTS[planet].color }}>{POINTS[planet].glyph} {POINTS[planet].name}{chart.points[planet].retro ? ' ℞' : ''}:</b> {text}</p>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </>
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
      <p className="aspect-hover">{hover || t('Passe o dedo/mouse sobre um aspecto para ler sua interpretação.')}</p>
      <ul className="aspect-cards">
        {chart.aspects.map((a, i) => (
          <li key={i} className="glass-soft">
            <span className="ag" style={{ color: a.type.color }}>{a.type.glyph}</span>
            <div>
              <strong>{POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}</strong>
              <small> · {t('orbe')} {a.orb.toFixed(2)}° · {t(a.applying ? 'aplicativo' : 'separativo')}</small>
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
        <span className="hl t">{t('Acima do horizonte')} {above}%</span>
        <span className="hl b">{t('Abaixo')} {100 - above}%</span>
        <span className="hl l">{t('Leste')} {east}%</span>
        <span className="hl r">{t('Oeste')} {100 - east}%</span>
      </div>
      <p>
        {t(above > 55 ? 'Com a maioria dos planetas acima do horizonte, sua vida tende a se voltar para o mundo, a carreira e a vida pública.' : above < 45 ? 'Com a maioria dos planetas abaixo do horizonte, sua força está na vida interior, na intimidade e na construção de bases sólidas.' : 'Seus planetas se dividem entre o mundo interior e o exterior: equilíbrio entre vida privada e pública.')}{' '}
        {east > 55 ? t('A ênfase no Leste indica autonomia: você é o autor do próprio destino.') : east < 45 ? t('A ênfase no Oeste indica que você se realiza através das relações e parcerias.') : ''}
      </p>
    </div>
  )
}
