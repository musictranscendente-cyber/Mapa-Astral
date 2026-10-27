import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS } from '../astro/constants'
import { SIGN_DATES, horoscope } from '../astro/horoscope'
import { MoonPhase } from '../components/MoonPhase'
import { horoscopeText } from '../interpret/horoscope'
import type { Route } from '../App'
import { locale, t } from '../i18n'

const DAYS = [
  { offset: -1, label: 'Ontem' },
  { offset: 0, label: 'Hoje' },
  { offset: 1, label: 'Amanhã' },
]

/** `#/horoscopo?signo=leao` opens a sign directly (shareable link). */
function signFromHash(): number | null {
  const key = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('signo')
  const i = SIGNS.findIndex((s) => s.key === key || slug(s.name) === key)
  return i >= 0 ? i : null
}
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Stars({ n, label }: { n: number; label: string }) {
  return (
    <div className="h-score" aria-label={`${label}: ${t('{n} de 5', { n })}`}>
      <span className="muted small">{label}</span>
      <span className="h-stars">{'★'.repeat(n)}<span className="off">{'★'.repeat(5 - n)}</span></span>
    </div>
  )
}

export function HoroscopePage({ natal, go }: { natal: Chart | null; go: (r: Route) => void }) {
  const [sign, setSign] = useState<number>(() => signFromHash() ?? natal?.points.sun.sign ?? Math.floor(Date.now() / 86400000) % 12)
  const [offset, setOffset] = useState(0)
  const [copied, setCopied] = useState(false)
  const [base] = useState(() => new Date())
  const date = useMemo(() => new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset), [base, offset])
  const h = useMemo(() => horoscope(sign, date), [sign, date])
  const text = horoscopeText(h)
  const s = SIGNS[sign]
  const color = ELEMENT_INFO[s.element].color

  const choose = (i: number) => {
    setSign(i)
    setCopied(false)
    window.history.replaceState(null, '', `${window.location.pathname}#/horoscopo?signo=${SIGNS[i].key}`)
  }
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=horoscopo#/horoscopo?signo=${s.key}`
    const msg = t('Horóscopo de {sign} hoje no Cosmic Sky ✦ {url}', { sign: s.name, url })
    try {
      if (navigator.share) await navigator.share({ text: msg })
      else { await navigator.clipboard.writeText(msg); setCopied(true) }
    } catch { /* cancelled */ }
  }

  return (
    <div className="horoscope">
      <header className="page-head">
        <p className="eyebrow">{t('Horóscopo do dia')}</p>
        <h1 className="title-glow">{s.name}</h1>
        <p className="muted">
          {SIGN_DATES[sign]} · {date.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <div className="segmented">
          {DAYS.map((d) => <button key={d.offset} className={offset === d.offset ? 'active' : ''} onClick={() => setOffset(d.offset)}>{t(d.label)}</button>)}
        </div>
      </header>

      <nav className="sign-picker" aria-label={t('Escolha o signo')}>
        {SIGNS.map((x, i) => (
          <button key={x.key} className={i === sign ? 'active' : ''} onClick={() => choose(i)} style={{ ['--el' as string]: ELEMENT_INFO[x.element].color }}>
            <span className="sign-glyph">{x.glyph}</span>
            <span>{x.name}</span>
          </button>
        ))}
      </nav>

      <section className="glass pad h-card" style={{ ['--accent' as string]: color }}>
        <div className="h-head">
          <span className="h-glyph sign-glyph" style={{ color }}>{s.glyph}</span>
          <div>
            <h2>{text.headline}</h2>
            <div className="h-scores">
              <Stars n={h.scores.amor} label={t('Amor')} />
              <Stars n={h.scores.trabalho} label={t('Trabalho')} />
              <Stars n={h.scores.energia} label={t('Energia')} />
            </div>
          </div>
        </div>
        <p className="serif h-lead">{text.day}</p>
        <div className="h-grid">
          <article><h3>♡ {t('Amor')}</h3><p>{text.love}</p></article>
          <article><h3>♂︎ {t('Trabalho e ação')}</h3><p>{text.work}</p></article>
          <article><h3>☿︎ {t('Mente e conversas')}</h3><p>{text.mind}</p></article>
        </div>
        {text.highlight && <p className="h-highlight">✦ {t('Destaque do céu:')} {text.highlight}</p>}
        <div className="h-moon">
          <MoonPhase angle={h.phase.angle} size={46} south={(natal?.latitude ?? -23) < 0} />
          <p className="muted small">{text.tip}</p>
        </div>
        <div className="head-tools left">
          <button className="ghost" onClick={share}>{copied ? t('Link copiado ✓') : `↗ ${t('Compartilhar este horóscopo')}`}</button>
        </div>
        <p className="muted small">
          {t('Calculado com as posições reais dos planetas hoje, a partir do signo solar (casas solares). Para uma previsão feita sob medida para você, com o seu Ascendente e todos os planetas, use as Previsões.')}
        </p>
      </section>

      <section className="glass pad center h-cta">
        {natal ? (
          <>
            <h3>{t('Quer ir além do signo solar?')}</h3>
            <p className="muted">{t('As Previsões usam o seu mapa completo, com o Ascendente e todos os planetas.')}</p>
            <button className="cta" onClick={() => go('previsoes')}><span>✧ {t('Ver minhas previsões')}</span></button>
          </>
        ) : (
          <>
            <h3>{t('Seu signo é só o começo')}</h3>
            <p className="muted">{t('Crie seu mapa astral grátis e receba previsões feitas para o seu céu de nascimento.')}</p>
            <button className="cta" onClick={() => go('inicio')}><span>✦ {t('Criar meu mapa grátis')}</span></button>
          </>
        )}
      </section>
      <p className="muted small center">Planetas hoje: {(['sun', 'moon', 'mercury', 'venus', 'mars'] as const).map((k) => `${POINTS[k].name} em ${SIGNS[h.planets[k].sign].name}${h.planets[k].retro ? ' ℞' : ''}`).join(' · ')}</p>
    </div>
  )
}
