import { useEffect, useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { POINTS, type PlanetKey } from '../astro/constants'
import { ACG_PLANETS, astroLines, distanceToLine, type AcgLine } from '../astro/astrocarto'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { Locked } from '../components/Locked'
import { PlacePicker, type Where } from '../components/PlacePicker'
import { ANGLE_GUIDE, ANGLE_NAME, BENEFIC, PLANET_GUIDE, lineMeaning, strengthLabel } from '../interpret/astrocarto'
import { track } from '../lib/analytics'
import { astroMapUrl, renderAstroMapImage } from '../lib/astroMapImage'
import { WORLD_LAND_PATH } from '../lib/worldPath'
import type { Route } from '../App'
import { t } from '../i18n'

const DASH: Record<string, string | undefined> = { AC: undefined, MC: undefined, DC: '3 2', IC: '1 1.5' }
const toXY = ([lon, lat]: [number, number]) => `${(lon + 180).toFixed(2)},${(90 - lat).toFixed(2)}`
const NEAR_KM = 700

export function AstroMapPage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const access = useAccess()
  const [shown, setShown] = useState<PlanetKey[]>(['sun', 'moon', 'venus', 'jupiter', 'mars', 'saturn'])
  const [place, setPlace] = useState<Where | null>(null)
  const lines = useMemo(() => (natal ? astroLines(natal) : []), [natal])
  const [sharing, setSharing] = useState(false)

  if (!natal?.birth) {
    return (
      <div className="empty glass">
        <h2>{t('Astrocartografia')}</h2>
        <p>{t('Crie seu mapa natal para ver onde no mundo cada planeta fica mais forte para você.')}</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ {t('Criar mapa')}</span></button>
      </div>
    )
  }
  if (natal.birth.timeUnknown) {
    return <div className="empty glass"><h2>{t('Astrocartografia')}</h2><p>{t('A astrocartografia precisa da hora de nascimento. Edite o perfil e informe a hora.')}</p></div>
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
    setPlace({ longitude: p.x - 180, latitude: 90 - p.y, label: `${t('ponto escolhido')} (${(90 - p.y).toFixed(1)}°, ${(p.x - 180).toFixed(1)}°)`, mode: 'cidade' })
  }

  return (
    <div className="astromap">
      <header className="page-head">
        <p className="eyebrow">{t('Onde o seu céu brilha mais')}</p>
        <h1 className="title-glow">{t('Astrocartografia')}</h1>
        <p className="muted">{t('As linhas mostram onde cada planeta estava nascendo (AC), no alto do céu (MC), se pondo (DC) ou no fundo do céu (IC) no momento em que {name} nasceu.', { name: natal.birth.name.split(' ')[0] })}</p>
      </header>

      {needsLogin ? (
        <Locked title={t('Seu mapa-múndi astral')} text={t('Entre grátis para ver as linhas dos seus planetas pelo mundo.')} go={go} />
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
            <svg viewBox="0 12 360 150" role="img" aria-label={t('Mapa-múndi com as linhas planetárias')} onClick={full ? pick : undefined}>
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
            <div className="acg-legend">
              <span><i className="acg-key" /> AC / MC</span>
              <span><i className="acg-key dc" /> DC</span>
              <span><i className="acg-key ic" /> IC</span>
              <span><i className="acg-dot" /> {t('seu nascimento')}</span>
              {place && <span><i className="acg-dot place" /> {t('lugar escolhido')}</span>}
            </div>
            {full && <p className="muted small acg-tip">{t('Toque em qualquer ponto do mapa para ver quais linhas passam perto.')}</p>}
          </div>

          <div className="acg-actions">
            <button className="ghost" onClick={() => setSharing(true)}>✦ {t('Compartilhar meu mapa-múndi')}</button>
          </div>
          {sharing && <AstroMapShare name={natal.birth.name.split(' ')[0]} lines={lines} planets={shown} birth={natal} onClose={() => setSharing(false)} />}

          <details className="glass pad acg-guide">
            <summary>{t('Como ler o seu mapa-múndi')}</summary>
            <p>
              {t('Cada planeta desenha quatro linhas no mundo: os lugares onde, no instante do seu nascimento, ele estava nascendo, no alto do céu, se pondo ou embaixo da Terra. Morar, viajar ou passar o aniversário perto de uma linha deixa aquele planeta mais forte na sua vida ali — quanto mais perto, mais forte (até uns 250 km é forte; até 700 km ainda se sente).')}
            </p>
            <div className="acg-angles">
              {(['AC', 'MC', 'DC', 'IC'] as const).map((a) => (
                <div key={a}>
                  <h4><i className={`acg-key ${a === 'DC' ? 'dc' : a === 'IC' ? 'ic' : ''}`} /> {ANGLE_GUIDE[a].title}</h4>
                  <p>{ANGLE_GUIDE[a].text}</p>
                </div>
              ))}
            </div>
            <h4>{t('O que cada planeta traz')}</h4>
            <ul className="acg-planets">
              {ACG_PLANETS.map((k) => (
                <li key={k}>
                  <b style={{ color: POINTS[k].color }}><span className="g">{POINTS[k].glyph}</span> {POINTS[k].name}</b>
                  <span>{PLANET_GUIDE[k]}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">
              {t('Linhas de Vênus, Júpiter, Sol e Lua costumam ser as mais agradáveis; Marte, Saturno, Urano, Netuno e Plutão trazem crescimento, mas pedem mais consciência. Nenhuma linha é "proibida": ela mostra o tema que fica em evidência naquele lugar.')}
            </p>
          </details>

          {full ? (
            <section className="glass pad">
              <PlacePicker title={t('Analisar uma cidade')} value={place ?? { latitude: natal.latitude, longitude: natal.longitude, label: natal.birth.place, mode: 'natal' }}
                natal={{ latitude: natal.latitude, longitude: natal.longitude, place: natal.birth.place }} onChange={setPlace} />
              {place && (
                near.length === 0 ? (
                  <p className="muted">{t('Nenhuma linha planetária passa a menos de {km} km de {place}: um lugar neutro, onde o seu mapa natal age sem grandes reforços.', { km: NEAR_KM, place: place.label })}</p>
                ) : (
                  <ul className="acg-near">
                    {near.map((l) => (
                      <li key={l.planet + l.angle} className={BENEFIC.includes(l.planet) ? 'good' : ''}>
                        <b style={{ color: POINTS[l.planet].color }}>{POINTS[l.planet].glyph} {t('{planet} no {angle}', { planet: POINTS[l.planet].name, angle: ANGLE_NAME[l.angle] })}</b>
                        <small className="muted"> · {t('a {km} km', { km: Math.round(l.km) })} · {t(strengthLabel(l.km))}</small>
                        <p>{lineMeaning(l.planet, l.angle)}</p>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ) : (
            <Locked title={t('Análise de cidades')} text={t('Toque no mapa ou busque uma cidade para ver quais linhas passam perto e o que elas trazem — incluso nos planos.')} go={go} />
          )}
        </>
      )}
    </div>
  )
}

/** Preview + share/download of the world map image. */
function AstroMapShare({ name, lines, planets, birth, onClose }: { name: string; lines: AcgLine[]; planets: PlanetKey[]; birth: Chart; onClose: () => void }) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let url = ''
    let alive = true
    renderAstroMapImage(name, lines, planets, birth)
      .then((blob) => { if (!alive) return; url = URL.createObjectURL(blob); setImage({ blob, url }) })
      .catch(() => setMsg(t('Não foi possível gerar a imagem.')))
    return () => { alive = false; if (url) URL.revokeObjectURL(url) }
  }, [name, lines, planets, birth])

  const file = image ? new File([image.blob], 'meu-mapa-mundi-astral.png', { type: 'image/png' }) : null
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
  const text = t('Onde no mundo o meu céu brilha ✦ Faça a sua astrocartografia: {url}', { url: astroMapUrl() })
  const share = async () => {
    if (!file) return
    try { await navigator.share({ files: [file], text }); track('compartilhar', 'astrocartografia') } catch { /* cancelled */ }
  }
  const download = () => {
    if (!image) return
    const el = document.createElement('a')
    el.href = image.url
    el.download = 'meu-mapa-mundi-astral.png'
    el.click()
    track('compartilhar', 'astrocartografia-download')
    setMsg(t('Imagem salva! Poste no feed, nos Stories ou no WhatsApp.'))
  }
  return (
    <div className="share-backdrop" role="dialog" aria-modal="true" aria-label={t('Compartilhar meu mapa-múndi')} onClick={onClose}>
      <div className="share-dialog glass" onClick={(e) => e.stopPropagation()}>
        <div className="share-head">
          <h2>✦ {t('Compartilhar meu mapa-múndi')}</h2>
          <button className="icon-btn" aria-label={t('Fechar')} onClick={onClose}>✕</button>
        </div>
        <p className="muted small">{t('A imagem mostra as linhas dos planetas selecionados no mapa.')}</p>
        <div className="share-preview acg-preview">{image ? <img src={image.url} alt={t('Prévia da imagem')} /> : <div className="loader"><span /> {t('Gerando imagem…')}</div>}</div>
        <div className="share-actions">
          {canShare && <button className="cta" onClick={share}><span>{t('Compartilhar')}</span></button>}
          <button className={canShare ? 'ghost' : 'cta'} disabled={!image} onClick={download}>{canShare ? `⤓ ${t('Salvar imagem')}` : <span>⤓ {t('Salvar imagem')}</span>}</button>
        </div>
        {msg && <p className="muted small center">{msg}</p>}
      </div>
    </div>
  )
}
