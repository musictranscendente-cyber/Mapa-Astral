import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { POINTS, type PlanetKey } from '../astro/constants'
import { ACG_PLANETS, astroLines, distanceToLine, type AcgLine } from '../astro/astrocarto'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { Locked } from '../components/Locked'
import { PlacePicker, type Where } from '../components/PlacePicker'
import { ANGLE_NAME, BENEFIC, lineMeaning } from '../interpret/astrocarto'
import { WORLD_LAND_PATH } from '../lib/worldPath'
import type { Route } from '../App'

const DASH: Record<string, string | undefined> = { AC: undefined, MC: undefined, DC: '3 2', IC: '1 1.5' }
const toXY = ([lon, lat]: [number, number]) => `${(lon + 180).toFixed(2)},${(90 - lat).toFixed(2)}`
const NEAR_KM = 700

export function AstroMapPage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const access = useAccess()
  const [shown, setShown] = useState<PlanetKey[]>(['sun', 'moon', 'venus', 'jupiter', 'mars', 'saturn'])
  const [place, setPlace] = useState<Where | null>(null)
  const lines = useMemo(() => (natal ? astroLines(natal) : []), [natal])

  if (!natal?.birth) {
    return (
      <div className="empty glass">
        <h2>Astrocartografia</h2>
        <p>Crie seu mapa natal para ver onde no mundo cada planeta fica mais forte para você.</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }
  if (natal.birth.timeUnknown) {
    return <div className="empty glass"><h2>Astrocartografia</h2><p>A astrocartografia precisa da hora de nascimento. Edite o perfil e informe a hora.</p></div>
  }
  const needsLogin = access.enabled && !access.loggedIn
  const full = access.full(`astrocartografia:${birthKey(natal.birth)}`)
  const visible = lines.filter((l) => shown.includes(l.planet))
  const near: (AcgLine & { km: number })[] = place
    ? lines.map((l) => ({ ...l, km: distanceToLine(l, place.longitude, place.latitude) })).filter((l) => l.km <= NEAR_KM).sort((a, b) => a.km - b.km)
    : []
  const toggle = (k: PlanetKey) => setShown((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))
  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    setPlace({ longitude: p.x - 180, latitude: 90 - p.y, label: `ponto escolhido (${(90 - p.y).toFixed(1)}°, ${(p.x - 180).toFixed(1)}°)`, mode: 'cidade' })
  }

  return (
    <div className="astromap">
      <header className="page-head">
        <p className="eyebrow">Onde o seu céu brilha mais</p>
        <h1 className="title-glow">Astrocartografia</h1>
        <p className="muted">As linhas mostram onde cada planeta estava nascendo (AC), no alto do céu (MC), se pondo (DC) ou no fundo do céu (IC) no momento em que {natal.birth.name.split(' ')[0]} nasceu.</p>
      </header>

      {needsLogin ? (
        <Locked title="Seu mapa-múndi astral" text="Entre grátis para ver as linhas dos seus planetas pelo mundo." go={go} />
      ) : (
        <>
          <div className="acg-chips">
            {ACG_PLANETS.map((k) => (
              <button key={k} className={shown.includes(k) ? 'on' : ''} onClick={() => toggle(k)} style={{ ['--c' as string]: POINTS[k].color }}>
                <span className="g">{POINTS[k].glyph}</span> {POINTS[k].name}
              </button>
            ))}
          </div>
          <div className="glass acg-map">
            <svg viewBox="0 12 360 150" role="img" aria-label="Mapa-múndi com as linhas planetárias" onClick={full ? pick : undefined}>
              <rect x="0" y="0" width="360" height="180" className="acg-sea" />
              {[-60, -30, 0, 30, 60].map((lat) => <line key={lat} x1="0" x2="360" y1={90 - lat} y2={90 - lat} className="acg-grid" />)}
              {[-120, -60, 0, 60, 120].map((lon) => <line key={lon} y1="0" y2="180" x1={lon + 180} x2={lon + 180} className="acg-grid" />)}
              <path d={WORLD_LAND_PATH} className="acg-land" />
              {visible.map((l) => l.segments.map((seg, i) => (
                <polyline key={`${l.planet}${l.angle}${i}`} points={seg.map(toXY).join(' ')} fill="none" stroke={POINTS[l.planet].color}
                  strokeWidth={l.angle === 'MC' || l.angle === 'AC' ? 0.7 : 0.5} strokeDasharray={DASH[l.angle]} opacity={0.9} />
              )))}
              {visible.filter((l) => l.angle === 'MC').map((l) => (
                <text key={`t${l.planet}`} x={l.segments[0][0][0] + 180 + 1} y="16" className="acg-label" fill={POINTS[l.planet].color}>{POINTS[l.planet].glyph}</text>
              ))}
              <circle cx={natal.longitude + 180} cy={90 - natal.latitude} r="1.6" className="acg-birth" />
              {place && <circle cx={place.longitude + 180} cy={90 - place.latitude} r="1.8" className="acg-place" />}
            </svg>
            <p className="muted small acg-legend">— AC/MC (linha cheia) · - - DC (tracejada) · ··· IC (pontilhada) · ● local de nascimento{full ? ' · toque no mapa para analisar um lugar' : ''}</p>
          </div>

          {full ? (
            <section className="glass pad">
              <PlacePicker title="Analisar uma cidade" value={place ?? { latitude: natal.latitude, longitude: natal.longitude, label: natal.birth.place, mode: 'natal' }}
                natal={{ latitude: natal.latitude, longitude: natal.longitude, place: natal.birth.place }} onChange={setPlace} />
              {place && (
                near.length === 0 ? (
                  <p className="muted">Nenhuma linha planetária passa a menos de {NEAR_KM} km de {place.label}: um lugar neutro, onde o seu mapa natal age sem grandes reforços.</p>
                ) : (
                  <ul className="acg-near">
                    {near.map((l) => (
                      <li key={l.planet + l.angle} className={BENEFIC.includes(l.planet) ? 'good' : ''}>
                        <b style={{ color: POINTS[l.planet].color }}>{POINTS[l.planet].glyph} {POINTS[l.planet].name} no {ANGLE_NAME[l.angle]}</b>
                        <small className="muted"> · a {Math.round(l.km)} km</small>
                        <p>{lineMeaning(l.planet, l.angle)}{l.km < 250 ? ' Influência forte.' : ''}</p>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ) : (
            <Locked title="Análise de cidades" text="Toque no mapa ou busque uma cidade para ver quais linhas passam perto e o que elas trazem — incluso nos planos." go={go} />
          )}
        </>
      )}
    </div>
  )
}
