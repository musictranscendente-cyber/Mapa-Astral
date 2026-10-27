import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, formatDegree, type PointKey } from '../astro/constants'
import type { HouseSystem } from '../astro/houses'
import { currentLunarReturn, lunarReturnChart, nextLunarReturn, previousLunarReturn } from '../astro/lunarReturn'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { ChartWheel } from '../components/ChartWheel'
import { Locked } from '../components/Locked'
import { PlacePicker, type Where } from '../components/PlacePicker'
import { LR_ASC, LR_MOON_HOUSE, LR_SUN_HOUSE } from '../interpret/lunarReturn'
import { HOUSE_TEXT } from '../interpret/planets'
import type { Route } from '../App'
import { locale, t } from '../i18n'

interface Props {
  natal: Chart | null
  houseSystem: HouseSystem
  go: (r: Route) => void
}

const fmt = (d: Date) => d.toLocaleString(locale(), { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function LunarReturnPage({ natal, houseSystem, go }: Props) {
  const access = useAccess()
  const [date, setDate] = useState<Date | null>(() => (natal ? currentLunarReturn(natal) : null))
  const [where, setWhere] = useState<Where | null>(() =>
    natal?.birth ? { latitude: natal.latitude, longitude: natal.longitude, label: natal.birth.place, mode: 'natal' } : null)
  const lr = useMemo(() => (natal && date && where ? lunarReturnChart(date, where, houseSystem) : null), [natal, date, where, houseSystem])

  if (!natal?.birth || !date || !where || !lr) {
    return (
      <div className="empty glass">
        <h2>{t('Retorno Lunar')}</h2>
        <p>{t('Crie seu mapa natal para ver o mapa do seu mês.')}</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ {t('Criar mapa')}</span></button>
      </div>
    )
  }

  const needsLogin = access.enabled && !access.loggedIn
  const full = access.full(`retorno-lunar:${birthKey(natal.birth)}`)
  const next = nextLunarReturn(natal, date)
  const asc = SIGNS[lr.points.asc.sign]
  const moonHouse = lr.points.moon.house
  const sunHouse = lr.points.sun.house

  return (
    <div className="solar-return lunar-return">
      <header className="page-head">
        <p className="eyebrow">{t('O mapa do seu mês')}</p>
        <h1 className="title-glow">{t('Retorno Lunar')}</h1>
        <p className="muted">{t('A Lua volta a {deg} em', { deg: formatDegree(natal.points.moon.lon) })} <b>{fmt(date)}</b> · {t('vale até {date}', { date: fmt(next) })}</p>
        <div className="head-tools">
          <button className="ghost" onClick={() => setDate(previousLunarReturn(natal, date))}>‹ {t('Mês anterior')}</button>
          <button className="ghost" onClick={() => setDate(currentLunarReturn(natal))}>{t('Atual')}</button>
          <button className="ghost" onClick={() => setDate(next)}>{t('Próximo')} ›</button>
        </div>
      </header>

      {needsLogin ? (
        <Locked title={t('O mapa do seu mês')} text={t('Entre grátis para ver o tom emocional do mês e em que área da vida ele acontece.')} go={go} />
      ) : (
        <>
          <section className="glass pad sr-where">
            <PlacePicker title={t('Onde você estará no início do ciclo?')} value={where}
              natal={{ latitude: natal.latitude, longitude: natal.longitude, place: natal.birth.place }} onChange={setWhere} />
          </section>

          <section className="wheel-layout">
            <div className="wheel-box">
              <ChartWheel chart={lr} />
              <p className="hint">{t('Mapa do instante do retorno lunar, para {place}', { place: where.label })}</p>
            </div>
            <aside className="glass detail">
              <p className="eyebrow">{t('O clima do mês')}</p>
              <div className="pd-head">
                <span className="pd-glyph" style={{ color: ELEMENT_INFO[asc.element].color }}>{asc.glyph}</span>
                <div><h3>{t('{planet} em {sign}', { planet: POINTS.asc.name, sign: asc.name })}</h3><p className="muted">{formatDegree(lr.asc)}</p></div>
              </div>
              <p className="serif">{LR_ASC[lr.points.asc.sign]}</p>
              <p className="serif"><b style={{ color: POINTS.moon.color }}>☽ {t('{planet} na casa {n}', { planet: POINTS.moon.name, n: moonHouse })}</b> ({HOUSE_TEXT[moonHouse - 1].theme.toLowerCase()}): {LR_MOON_HOUSE[moonHouse - 1]}</p>
              <p className="serif"><b style={{ color: POINTS.sun.color }}>☉ {t('{planet} na casa {n}', { planet: POINTS.sun.name, n: sunHouse })}</b>: {LR_SUN_HOUSE[sunHouse - 1]}</p>
            </aside>
          </section>

          {full ? (
            <section className="sky-grid">
              <div className="glass pad">
                <h2>{t('Posições do mês')}</h2>
                <ul className="planet-rows">
                  {(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node'] as PointKey[]).map((k) => {
                    const p = lr.points[k]
                    return (
                      <li key={k}>
                        <span className="g" style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span>
                        <span className="pn">{POINTS[k].name}</span>
                        <span className="ps" style={{ color: ELEMENT_INFO[SIGNS[p.sign].element].color }}>{SIGNS[p.sign].glyph}</span>
                        <span className="mono">{formatDegree(p.lon)} · {t('casa {n}', { n: p.house })}</span>
                        {p.retro && <span className="retro">℞</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="glass pad">
                <h2>{t('Aspectos principais do mês')}</h2>
                <ul className="aspect-list">
                  {lr.aspects.filter((a) => a.type.major && a.a !== 'lilith' && a.b !== 'lilith').slice(0, 12).map((a, i) => (
                    <li key={i}><span style={{ color: a.type.color }}>{a.type.glyph}</span>{POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}<small>{a.orb.toFixed(1)}°</small></li>
                  ))}
                </ul>
              </div>
            </section>
          ) : (
            <Locked title={t('Retorno Lunar completo')} text={t('Todas as posições e aspectos do mês, para qualquer mês e qualquer cidade — incluso nos planos.')} go={go} />
          )}
        </>
      )}
    </div>
  )
}
