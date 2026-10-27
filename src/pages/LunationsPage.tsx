import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { ELEMENT_INFO, SIGNS, formatDegree } from '../astro/constants'
import { lunations, personalize, type PersonalLunation } from '../astro/lunations'
import { MoonPhase } from '../components/MoonPhase'
import { KIND_LABEL, lunationMeaning, lunationPersonal } from '../interpret/lunations'
import type { Route } from '../App'
import { locale, t } from '../i18n'

const fmt = (d: Date) => d.toLocaleString(locale(), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function LunationsPage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const [start] = useState(() => new Date())
  const [filter, setFilter] = useState<'todas' | 'eclipses'>('todas')
  const list = useMemo<(PersonalLunation | (ReturnType<typeof lunations>[number] & { house: null; contacts: [] }))[]>(
    () => lunations(start, 12).map((l) => (natal ? personalize(l, natal) : { ...l, house: null, contacts: [] })),
    [start, natal],
  )
  const shown = filter === 'eclipses' ? list.filter((l) => l.eclipse) : list
  const nextEclipse = list.find((l) => l.eclipse)

  return (
    <div className="lunations">
      <header className="page-head">
        <p className="eyebrow">{t('Próximos 12 meses')}</p>
        <h1 className="title-glow">{t('Eclipses e Lunações')}</h1>
        <p className="muted">
          {natal?.birth ? t('Luas Novas, Luas Cheias e eclipses sobre o mapa de {name}.', { name: natal.birth.name }) : t('Luas Novas, Luas Cheias e eclipses — crie seu mapa para ver em que casa cada um cai para você.')}
        </p>
        <div className="segmented">
          <button className={filter === 'todas' ? 'active' : ''} onClick={() => setFilter('todas')}>{t('Todas')}</button>
          <button className={filter === 'eclipses' ? 'active' : ''} onClick={() => setFilter('eclipses')}>{t('Só eclipses')}</button>
        </div>
      </header>

      {nextEclipse && filter === 'todas' && (
        <section className="glass pad eclipse-hero">
          <p className="eyebrow">{t('Próximo eclipse')}</p>
          <h2>{t('{phase} em {sign}', { phase: KIND_LABEL(nextEclipse), sign: SIGNS[nextEclipse.sign].name })}</h2>
          <p className="muted">{fmt(nextEclipse.date)} · {formatDegree(nextEclipse.lon)}</p>
          <p>{lunationMeaning(nextEclipse)}</p>
          {lunationPersonal(nextEclipse as PersonalLunation).map((line, i) => <p key={i} className="personal">✦ {line}</p>)}
        </section>
      )}

      <section className="lunation-list">
        {shown.map((l) => {
          const color = ELEMENT_INFO[SIGNS[l.sign].element].color
          const personal = natal ? lunationPersonal(l as PersonalLunation) : []
          return (
            <article key={l.date.getTime()} className={`glass lunation-card ${l.eclipse ? 'is-eclipse' : ''}`} style={{ ['--accent' as string]: color }}>
              <div className="lc-icon">
                <MoonPhase angle={l.kind === 'nova' ? 0 : 180} size={44} south={(natal?.latitude ?? -23) < 0} />
              </div>
              <div className="lc-body">
                <h3>
                  {KIND_LABEL(l)} {t('em')} <span style={{ color }}>{SIGNS[l.sign].glyph} {SIGNS[l.sign].name}</span>
                  {l.house && <span className="lc-house">{t('casa {n}', { n: l.house })}</span>}
                </h3>
                <p className="muted small">{fmt(l.date)} · {formatDegree(l.lon)}</p>
                <p>{lunationMeaning(l)}</p>
                {personal.map((line, i) => <p key={i} className="personal">✦ {line}</p>)}
              </div>
            </article>
          )
        })}
      </section>

      {!natal && (
        <section className="glass pad center">
          <h3>{t('Veja onde cada eclipse cai no seu mapa')}</h3>
          <button className="cta" onClick={() => go('inicio')}><span>✦ {t('Criar meu mapa grátis')}</span></button>
        </section>
      )}
    </div>
  )
}
