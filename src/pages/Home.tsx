import { useMemo, useState } from 'react'
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

interface Props {
  natal: Chart | null
  profile: BirthData | null
  onCreate: (d: BirthData) => void
  go: (r: Route) => void
}

export function Home({ natal, profile, onCreate, go }: Props) {
  const [now] = useState(() => new Date())
  const moon = useMemo(() => moonPhaseInfo(now), [now])
  const t = toTime(now)
  const moonSign = Math.floor(bodyLongitude('moon', t) / 30)
  const sunSign = Math.floor(bodyLongitude('sun', t) / 30)
  const today = useMemo(() => (natal ? scoreDay(natal, now) : null), [natal, now])

  return (
    <div className="home">
      <section className="hero">
        <ZodiacHalo />
        <div className="hero-copy">
          <p className="eyebrow">✧ astrologia de precisão ✧</p>
          <h1 className="title-glow">
            O céu do seu nascimento<br /><em>ainda fala com você</em>
          </h1>
          <p className="lead">
            Descubra seu mapa astral com cálculos astronômicos precisos, acompanhe o céu de cada dia e veja
            como os trânsitos dos planetas tocam a sua história — hoje e nos dias que virão.
          </p>
          {natal && profile && (
            <div className="hero-actions">
              <button className="cta" onClick={() => go('mapa')}><span>✦ Ver mapa de {profile.name.split(' ')[0]}</span></button>
              <button className="ghost" onClick={() => go('ceu')}>☽ Céu de hoje</button>
            </div>
          )}
        </div>
      </section>

      <section className="today-strip">
        <div className="glass sky-card">
          <MoonPhase angle={moon.angle} size={96} south={(profile?.latitude ?? -23) < 0} />
          <div>
            <p className="eyebrow">Agora no céu</p>
            <h3>{moon.name} em {SIGNS[moonSign].name}</h3>
            <p className="muted">{Math.round(moon.illumination * 100)}% iluminada · Sol em {SIGNS[sunSign].name}</p>
            <p>{moonSignOfDayText(moonSign)}</p>
          </div>
        </div>
        {natal && today && (
          <div className="glass sky-card energy" onClick={() => go('previsoes')} role="button">
            <div className="energy-orb" style={{ ['--flow' as string]: (today.flow + 100) / 200 }}>
              <span>{today.flow > 0 ? '+' : ''}{today.flow}</span>
            </div>
            <div>
              <p className="eyebrow">Sua energia hoje</p>
              <h3>{today.flow > 25 ? 'Dia de fluxo e abertura' : today.flow < -25 ? 'Dia de desafios e crescimento' : 'Dia de equilíbrio'}</h3>
              <p className="muted">Intensidade {today.intensity}/100 · toque para ver previsões</p>
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
            <h2>Crie seu mapa</h2>
            <p>
              Precisamos da data, hora e cidade de nascimento. O fuso horário histórico (incluindo horário de verão)
              é aplicado automaticamente para garantir um Ascendente e casas precisos.
            </p>
            <ul className="features">
              <li><span>☉</span> Planetas, Nodos, Lilith e Roda da Fortuna</li>
              <li><span>⌂</span> Casas Placidus, Koch, Porfírio, Iguais ou Signos Inteiros</li>
              <li><span>✧</span> Relatório completo de interpretação</li>
              <li><span>☽</span> Céu do dia e trânsitos pessoais</li>
              <li><span>✶</span> Projeção de até 1 ano à frente</li>
            </ul>
          </div>
          <BirthForm onSubmit={onCreate} />
        </section>
      )}
    </div>
  )
}
