import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { houseOf } from '../astro/houses'
import { ELEMENT_INFO, POINTS, SIGNS, formatDegree, type PlanetKey } from '../astro/constants'
import { progressions, upcomingProgressions, type ProgAspect } from '../astro/progressions'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { ChartWheel } from '../components/ChartWheel'
import { Locked } from '../components/Locked'
import { transitHeadline } from '../interpret/aspects'
import { HOUSE_TEXT } from '../interpret/planets'
import { PROG_MOON_SIGN, phaseOf } from '../interpret/progressions'
import type { Route } from '../App'

const headline = (a: { moving: string; natal: string; type: { key: string } }) =>
  transitHeadline(a.moving as PlanetKey, a.natal as PlanetKey, a.type.key as never)

function AspectRow({ a, kind }: { a: ProgAspect; kind: string }) {
  return (
    <li>
      <span style={{ color: POINTS[a.moving].color }}>{POINTS[a.moving].glyph}</span>
      <span style={{ color: a.type.color }}>{a.type.glyph}</span>
      <span style={{ color: POINTS[a.natal].color }}>{POINTS[a.natal].glyph}</span>
      {headline(a)} <small>{kind} · orbe {a.orb.toFixed(2)}° · {a.applying ? 'aproximando' : 'separando'}</small>
    </li>
  )
}

export function ProgressionsPage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const access = useAccess()
  const [at] = useState(() => new Date())
  const p = useMemo(() => (natal ? progressions(natal, at) : null), [natal, at])
  const upcoming = useMemo(() => (natal ? upcomingProgressions(natal, at, 3) : []), [natal, at])

  if (!natal?.birth || !p) {
    return (
      <div className="empty glass">
        <h2>Progressões</h2>
        <p>Crie seu mapa natal para ver como ele evoluiu até hoje.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }
  const needsLogin = access.enabled && !access.loggedIn
  const full = access.full(`progressoes:${birthKey(natal.birth)}`)
  const pm = p.chart.points.moon
  const ps = p.chart.points.sun
  const moonHouse = natal.hasHouses ? HOUSE_TEXT[houseOf(pm.lon, natal.cusps) - 1] : null
  const phase = phaseOf(p.lunarPhase)

  return (
    <div className="progressions">
      <header className="page-head">
        <p className="eyebrow">Técnicas de previsão</p>
        <h1 className="title-glow">Progressões e Arcos Solares</h1>
        <p className="muted">
          Como o mapa de {natal.birth.name} amadureceu até hoje · "um dia para cada ano de vida" · arco solar de {p.arc.toFixed(2)}°
        </p>
      </header>

      {needsLogin ? (
        <Locked title="Seu mapa progredido" text="Entre grátis para ver em que fase da vida você está segundo a Lua e o Sol progredidos." go={go} />
      ) : (
        <>
          <section className="wheel-layout">
            <div className="wheel-box">
              <ChartWheel chart={natal} outer={p.chart} showAspects={false} />
              <p className="hint">Interno: mapa natal · anel externo: planetas progredidos hoje</p>
            </div>
            <aside className="glass detail">
              <p className="eyebrow">Sua fase atual</p>
              <h3>{phase.name}</h3>
              <p className="serif">{phase.text}</p>
              <p className="serif">
                <b style={{ color: POINTS.moon.color }}>☽ Lua progredida em {SIGNS[pm.sign].name}</b> ({formatDegree(pm.lon)}): {PROG_MOON_SIGN[pm.sign]}
                {moonHouse && ` No seu mapa natal, ela passa pela ${moonHouse.name.toLowerCase()} — ${moonHouse.theme.toLowerCase()}.`}
              </p>
              <p className="muted small">Entra em {SIGNS[p.moonIngress.sign].name} em {p.moonIngress.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.</p>
              <p className="serif">
                <b style={{ color: POINTS.sun.color }}>☉ Sol progredido em {SIGNS[ps.sign].name}</b> ({formatDegree(ps.lon)})
                {ps.sign !== natal.points.sun.sign ? ` — sua identidade amadureceu de ${SIGNS[natal.points.sun.sign].name} para ${SIGNS[ps.sign].name}.` : ' — ainda no signo natal.'}
              </p>
            </aside>
          </section>

          {full ? (
            <>
              <section className="sky-grid">
                <div className="glass pad">
                  <h2>Aspectos progredidos ativos</h2>
                  {p.progressed.length === 0 ? <p className="muted">Nenhum aspecto progredido exato (até 1°) neste momento.</p> : (
                    <ul className="aspect-list">{p.progressed.map((a, i) => <AspectRow key={i} a={a} kind="progressão" />)}</ul>
                  )}
                </div>
                <div className="glass pad">
                  <h2>Arcos solares ativos</h2>
                  {p.directed.length === 0 ? <p className="muted">Nenhuma direção de arco solar exata (até 1°) neste momento.</p> : (
                    <ul className="aspect-list">{p.directed.map((a, i) => <AspectRow key={i} a={a} kind="arco solar" />)}</ul>
                  )}
                </div>
              </section>
              <section className="glass pad">
                <h2>Próximos 3 anos</h2>
                <p className="muted small">Datas em que aspectos progredidos e de arco solar ficam exatos — marcos de amadurecimento que costumam ser sentidos por meses.</p>
                <ul className="prog-timeline">
                  {upcoming.slice(0, 40).map((e, i) => (
                    <li key={i}>
                      <span className="pt-date">{e.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                      <span style={{ color: e.type.color }}>{e.type.glyph}</span>
                      <span>{headline(e)}</span>
                      <small className="muted">{e.kind}</small>
                    </li>
                  ))}
                  {upcoming.length === 0 && <li className="muted">Nenhum aspecto exato nos próximos 3 anos.</li>}
                </ul>
              </section>
              <section className="glass pad">
                <h2>Posições progredidas</h2>
                <ul className="planet-rows">
                  {(['sun', 'moon', 'mercury', 'venus', 'mars', ...(natal.hasHouses ? ['asc', 'mc'] : [])] as PlanetKey[]).map((k) => {
                    const q = p.chart.points[k]
                    return (
                      <li key={k}>
                        <span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span>
                        <span className="pn">{POINTS[k].name}</span>
                        <span className="ps" style={{ color: ELEMENT_INFO[SIGNS[q.sign].element].color }}>{SIGNS[q.sign].glyph}</span>
                        <span className="mono">{formatDegree(q.lon)}</span>
                        {q.retro && <span className="retro">℞</span>}
                      </li>
                    )
                  })}
                </ul>
              </section>
            </>
          ) : (
            <Locked title="Progressões completas" text="Aspectos progredidos e de arco solar ativos, os marcos dos próximos 3 anos e todas as posições progredidas — incluso nos planos." go={go} />
          )}
        </>
      )}
    </div>
  )
}
