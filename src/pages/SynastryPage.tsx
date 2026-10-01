import { useMemo, useState } from 'react'
import { chartFromBirth, type BirthData } from '../astro/chart'
import { POINTS, SIGNS, ELEMENT_INFO, type PlanetKey } from '../astro/constants'
import type { HouseSystem } from '../astro/houses'
import { SYN_AREAS, houseOverlays, synastryAspects, synastryScore } from '../astro/synastry'
import type { TransitHit } from '../astro/transits'
import { synastrySummary } from '../ai/prompts'
import { AiReading } from '../components/AiReading'
import { BirthForm } from '../components/BirthForm'
import { ChartWheel } from '../components/ChartWheel'
import { overlayText, synAspectText, synSummary } from '../interpret/synastry'
import type { Profile } from '../lib/profiles'
import type { Route } from '../App'

interface Props {
  profiles: Profile[]
  activeId: string | null
  houseSystem: HouseSystem
  onSave: (d: BirthData) => string
  go: (r: Route) => void
}

const first = (n: string) => n.split(' ')[0]

export function SynastryPage({ profiles, activeId, houseSystem, onSave, go }: Props) {
  const [aId, setAId] = useState<string | null>(activeId ?? profiles[0]?.id ?? null)
  const [bId, setBId] = useState<string | null>(() => profiles.find((p) => p.id !== (activeId ?? profiles[0]?.id))?.id ?? null)
  const [adding, setAdding] = useState(false)

  const A = profiles.find((p) => p.id === aId) ?? null
  const B = profiles.find((p) => p.id === bId) ?? null

  const data = useMemo(() => {
    if (!A || !B || A.id === B.id) return null
    try {
      const ca = chartFromBirth(A, houseSystem)
      const cb = chartFromBirth(B, houseSystem)
      const aspects = synastryAspects(ca, cb)
      return { ca, cb, aspects, score: synastryScore(aspects) }
    } catch {
      return null
    }
  }, [A, B, houseSystem])

  if (profiles.length === 0) {
    return (
      <div className="empty glass">
        <h2>Sinastria</h2>
        <p>Crie primeiro o seu mapa; depois adicione a pessoa com quem deseja comparar.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar meu mapa</span></button>
      </div>
    )
  }

  const nameA = A ? first(A.name) : 'A'
  const nameB = B ? first(B.name) : 'B'
  const hits: TransitHit[] = data
    ? data.aspects
        .filter((s) => s.b !== 'asc' && s.b !== 'mc')
        .slice(0, 14)
        .map((s) => ({
          transit: s.b as PlanetKey, natal: s.a, type: s.type, orb: s.orb, applying: false,
          transitLon: data.cb.points[s.b].lon, transitRetro: false, house: 0, strength: s.weight,
        }))
    : []
  const flow = data?.aspects.filter((s) => s.type.nature !== 'tenso').slice(0, 6) ?? []
  const tense = data?.aspects.filter((s) => s.type.nature === 'tenso').slice(0, 6) ?? []
  const summary = data ? synSummary(data.score.total) : null

  return (
    <div className="synastry">
      <header className="page-head">
        <p className="eyebrow">Compatibilidade astrológica</p>
        <h1 className="title-glow">Sinastria</h1>
        <p className="muted">Como dois céus conversam: atração, afeto, comunicação e propósito.</p>
        <div className="pair-pick">
          <label className="select">
            <span>Pessoa A</span>
            <select value={aId ?? ''} onChange={(e) => setAId(e.target.value)}>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <span className="pair-heart">♡</span>
          <label className="select">
            <span>Pessoa B</span>
            <select value={bId ?? ''} onChange={(e) => setBId(e.target.value || null)}>
              <option value="">— escolher —</option>
              {profiles.filter((p) => p.id !== aId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <button className="ghost" onClick={() => setAdding((v) => !v)}>{adding ? '− Cancelar' : '+ Nova pessoa'}</button>
        </div>
      </header>

      {(adding || (!B && profiles.length < 2)) && (
        <section className="edit-box">
          <p className="muted">Dados de nascimento da outra pessoa:</p>
          <BirthForm submitLabel="Adicionar e comparar" onSubmit={(d) => { const id = onSave(d); setBId(id); setAdding(false) }} />
        </section>
      )}

      {data && summary && A && B && (
        <>
          <section className="syn-hero glass">
            <div className="syn-person">
              <span className="syn-glyph" style={{ color: ELEMENT_INFO[SIGNS[data.ca.points.sun.sign].element].color }}>{SIGNS[data.ca.points.sun.sign].glyph}</span>
              <strong>{A.name}</strong>
              <small>☉ {SIGNS[data.ca.points.sun.sign].name} · ☽ {SIGNS[data.ca.points.moon.sign].name}{data.ca.hasHouses ? ` · AC ${SIGNS[data.ca.points.asc.sign].name}` : ''}</small>
            </div>
            <div className="syn-score">
              <div className="energy-orb big" style={{ ['--flow' as string]: data.score.total / 100 }}>
                <span>{data.score.total}</span>
              </div>
              <h3>{summary.title}</h3>
            </div>
            <div className="syn-person">
              <span className="syn-glyph" style={{ color: ELEMENT_INFO[SIGNS[data.cb.points.sun.sign].element].color }}>{SIGNS[data.cb.points.sun.sign].glyph}</span>
              <strong>{B.name}</strong>
              <small>☉ {SIGNS[data.cb.points.sun.sign].name} · ☽ {SIGNS[data.cb.points.moon.sign].name}{data.cb.hasHouses ? ` · AC ${SIGNS[data.cb.points.asc.sign].name}` : ''}</small>
            </div>
            <p className="syn-summary">{summary.text}</p>
          </section>

          <section className="wheel-layout">
            <div className="wheel-box">
              <ChartWheel chart={data.ca} outer={data.cb} outerHits={hits} showAspects={false} />
              <p className="hint">Interno: {A.name} · anel externo (turquesa): {B.name}. Linhas: contatos entre os mapas.</p>
            </div>
            <aside className="glass detail">
              <p className="eyebrow">Dimensões da relação</p>
              <div className="meter-list areas">
                {SYN_AREAS.map((a) => {
                  const v = data.score.areas[a.key]
                  return (
                    <div className="meter" key={a.key} title={a.desc}>
                      <span className="meter-label"><span className="area-icon" style={{ color: a.color }}>{a.icon}</span>{a.name}</span>
                      <span className="meter-track"><span className="meter-mid" /><span className="meter-fill" style={{ width: `${v}%`, background: `linear-gradient(90deg, rgba(255,255,255,0.15), ${a.color})` }} /></span>
                      <span className="meter-val">{v}</span>
                    </div>
                  )
                })}
              </div>
              <p className="muted small">{data.aspects.length} contatos entre os mapas · harmonia {Math.round(data.score.harmony)} · tensão {Math.round(data.score.tension)}</p>
            </aside>
          </section>

          <section className="syn-columns">
            <div>
              <h2>✦ O que flui</h2>
              {flow.map((s, i) => (
                <article key={i} className="glass transit-card" style={{ ['--accent' as string]: s.type.color }}>
                  <div className="tc-glyphs">
                    <span style={{ color: POINTS[s.a].color }}>{POINTS[s.a].glyph}</span>
                    <span className="tc-asp" style={{ color: s.type.color }}>{s.type.glyph}</span>
                    <span style={{ color: POINTS[s.b].color }}>{POINTS[s.b].glyph}</span>
                  </div>
                  <p>{synAspectText(s, nameA, nameB)}</p>
                  <p className="muted small">{s.type.name} · orbe {s.orb.toFixed(1)}°</p>
                </article>
              ))}
            </div>
            <div>
              <h2>⚡ O que desafia</h2>
              {tense.length === 0 && <p className="glass pad">Poucos atritos relevantes entre os mapas.</p>}
              {tense.map((s, i) => (
                <article key={i} className="glass transit-card" style={{ ['--accent' as string]: s.type.color }}>
                  <div className="tc-glyphs">
                    <span style={{ color: POINTS[s.a].color }}>{POINTS[s.a].glyph}</span>
                    <span className="tc-asp" style={{ color: s.type.color }}>{s.type.glyph}</span>
                    <span style={{ color: POINTS[s.b].color }}>{POINTS[s.b].glyph}</span>
                  </div>
                  <p>{synAspectText(s, nameA, nameB)}</p>
                  <p className="muted small">{s.type.name} · orbe {s.orb.toFixed(1)}°</p>
                </article>
              ))}
            </div>
          </section>

          {(data.ca.hasHouses || data.cb.hasHouses) && (
            <section className="glass pad">
              <h2>Sobreposição de casas</h2>
              <p className="muted">Em que áreas da vida um ativa o outro.</p>
              <div className="overlay-cols">
                {data.ca.hasHouses && (
                  <ul className="retro-list">
                    {houseOverlays(data.ca, data.cb).filter((o) => ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'].includes(o.planet)).map((o) => (
                      <li key={o.planet}><span style={{ color: POINTS[o.planet].color }}>{POINTS[o.planet].glyph}</span>{overlayText(o.planet, o.house, nameB, nameA)}</li>
                    ))}
                  </ul>
                )}
                {data.cb.hasHouses && (
                  <ul className="retro-list">
                    {houseOverlays(data.cb, data.ca).filter((o) => ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'].includes(o.planet)).map((o) => (
                      <li key={o.planet}><span style={{ color: POINTS[o.planet].color }}>{POINTS[o.planet].glyph}</span>{overlayText(o.planet, o.house, nameA, nameB)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          <AiReading
            kind="sinastria"
            cacheKey={`${A.id}|${B.id}|${houseSystem}`}
            getSummary={() => synastrySummary(data.ca, data.cb, data.aspects, data.score.total)}
            onOpenSettings={() => go('ajustes')}
          />
        </>
      )}
    </div>
  )
}
