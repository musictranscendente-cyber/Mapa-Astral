import { useMemo, useState } from 'react'
import { ShareDialog } from '../components/ShareDialog'
import type { BirthData, Chart } from '../astro/chart'
import { POINTS, SIGNS, ELEMENT_INFO } from '../astro/constants'
import { bodyLongitude, moonPhaseInfo, toTime } from '../astro/ephemeris'
import { scoreDay } from '../astro/transits'
import { BirthForm } from '../components/BirthForm'
import { MoonPhase } from '../components/MoonPhase'
import { ZodiacHalo } from '../components/ZodiacHalo'
import { moonSignOfDayText } from '../interpret/report'
import { SIGN_TEXT } from '../interpret/signs'
import type { Route } from '../App'
import { t } from '../i18n'

interface Props {
  natal: Chart | null
  profile: BirthData | null
  onCreate: (d: BirthData) => void
  go: (r: Route) => void
}

export function Home({ natal, profile, onCreate, go }: Props) {
  const [now] = useState(() => new Date())
  const [sharing, setSharing] = useState(false)
  const moon = useMemo(() => moonPhaseInfo(now), [now])
  const time = toTime(now)
  const moonSign = Math.floor(bodyLongitude('moon', time) / 30)
  const sunSign = Math.floor(bodyLongitude('sun', time) / 30)
  const today = useMemo(() => (natal ? scoreDay(natal, now) : null), [natal, now])

  return (
    <div className="home">
      <section className="hero">
        <ZodiacHalo />
        <div className="hero-copy">
          <p className="eyebrow">✧ {t('astrologia de precisão')} ✧</p>
          <h1 className="title-glow">
            {t('O céu do seu nascimento')}<br /><em>{t('ainda fala com você')}</em>
          </h1>
          <p className="lead">
            {t('Descubra seu mapa astral com cálculos astronômicos precisos, acompanhe o céu de cada dia e veja como os trânsitos dos planetas tocam a sua história — hoje e nos dias que virão.')}
          </p>
          {natal && profile && (
            <div className="hero-actions">
              <button className="cta" onClick={() => go('mapa')}><span>✦ {t('Ver mapa de {name}', { name: profile.name.split(' ')[0] })}</span></button>
              <button className="ghost" onClick={() => go('ceu')}>☽ {t('Céu de hoje')}</button>
              <button className="ghost share-btn" onClick={() => setSharing(true)}>✦ {t('Compartilhar')}</button>
            </div>
          )}
          {sharing && natal && <ShareDialog chart={natal} onClose={() => setSharing(false)} />}
        </div>
      </section>

      <section className="home-signs">
        <div className="section-title">
          <h2>☀ {t('Horóscopo do dia')}</h2>
          <span className="muted small">{t('Escolha o seu signo')}</span>
        </div>
        <nav className="sign-picker" aria-label={t('Horóscopo por signo')}>
          {SIGNS.map((x) => (
            <button key={x.key} onClick={() => { window.location.hash = `/horoscopo?signo=${x.key}`; window.scrollTo({ top: 0 }) }} style={{ ['--el' as string]: ELEMENT_INFO[x.element].color }}>
              <span className="sign-glyph">{x.glyph}</span>
              <span>{x.name}</span>
            </button>
          ))}
        </nav>
        <button className="glass sint-teaser" onClick={() => go('sintonia')}>
          <span className="sint-heart">♥</span>
          <span><b>{t('Qual é a sua sintonia com alguém?')}</b><small className="muted">{t('Teste rápido só com as datas de nascimento — com imagem para os Stories')}</small></span>
          <span className="sint-go">›</span>
        </button>
      </section>

      <section className="today-strip">
        <div className="glass sky-card">
          <MoonPhase angle={moon.angle} size={96} south={(profile?.latitude ?? -23) < 0} />
          <div>
            <p className="eyebrow">{t('Agora no céu')}</p>
            <h3>{t('{phase} em {sign}', { phase: t(moon.name), sign: SIGNS[moonSign].name })}</h3>
            <p className="muted">{t('{pct}% iluminada · Sol em {sign}', { pct: Math.round(moon.illumination * 100), sign: SIGNS[sunSign].name })}</p>
            <p>{moonSignOfDayText(moonSign)}</p>
          </div>
        </div>
        {natal && today && (
          <div className="glass sky-card energy" onClick={() => go('previsoes')} role="button">
            <div className="energy-orb" style={{ ['--flow' as string]: (today.flow + 100) / 200 }}>
              <span>{today.flow > 0 ? '+' : ''}{today.flow}</span>
            </div>
            <div>
              <p className="eyebrow">{t('Sua energia hoje')}</p>
              <h3>{t(today.flow > 25 ? 'Dia de fluxo e abertura' : today.flow < -25 ? 'Dia de desafios e crescimento' : 'Dia de equilíbrio')}</h3>
              <p className="muted">{t('Intensidade {n}/100 · toque para ver previsões', { n: today.intensity })}</p>
            </div>
          </div>
        )}
      </section>

      {natal ? (
        <section className="big-three">
          {(['sun', 'moon', 'asc'] as const).filter((k) => natal.hasHouses || k !== 'asc').map((k, i) => {
            const p = natal.points[k]
            const s = SIGNS[p.sign]
            return (
              <article key={k} className="glass pillar" style={{ animationDelay: `${i * 0.12}s`, ['--el' as string]: ELEMENT_INFO[s.element].color }}>
                <div className="pillar-glyph">{s.glyph}</div>
                <p className="eyebrow">{POINTS[k].name}</p>
                <h3>{s.name}</h3>
                <p className="muted">{SIGN_TEXT[p.sign].title} · {ELEMENT_INFO[s.element].name}</p>
                <p className="pillar-text">{k === 'sun' ? SIGN_TEXT[p.sign].sun : k === 'moon' ? SIGN_TEXT[p.sign].moon : SIGN_TEXT[p.sign].asc}</p>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="onboard">
          <div className="onboard-copy">
            <h2>{t('Crie seu mapa')}</h2>
            <p>
              {t('Precisamos da data, hora e cidade de nascimento. O fuso horário histórico (incluindo horário de verão) é aplicado automaticamente para garantir um Ascendente e casas precisos.')}
            </p>
            <ul className="features">
              <li><span>☉</span> {t('Planetas, Nodos, Lilith e Roda da Fortuna')}</li>
              <li><span>⌂</span> {t('Casas Placidus, Koch, Porfírio, Iguais ou Signos Inteiros')}</li>
              <li><span>✧</span> {t('Relatório completo de interpretação')}</li>
              <li><span>☽</span> {t('Céu do dia e trânsitos pessoais')}</li>
              <li><span>✶</span> {t('Projeção de até 1 ano à frente')}</li>
            </ul>
          </div>
          <BirthForm onSubmit={onCreate} />
        </section>
      )}
    </div>
  )
}
