import { useMemo, useState } from 'react'
import type { Chart } from '../astro/chart'
import { POINTS, SIGNS, ELEMENT_INFO, angDiff, formatDegree, type PointKey } from '../astro/constants'
import { houseOf, type HouseSystem } from '../astro/houses'
import { currentReturnYear, solarReturnChart } from '../astro/solarReturn'
import { solarReturnSummary } from '../ai/prompts'
import { AiReading } from '../components/AiReading'
import { ChartWheel } from '../components/ChartWheel'
import { ElementBars } from '../components/Charts'
import { HOUSE_TEXT } from '../interpret/planets'
import { SR_ASC, SR_MOON_HOUSE, SR_SUN_HOUSE } from '../interpret/solarReturn'
import { PlacePicker, type Where } from '../components/PlacePicker'
import { SR_GOALS, evaluateLocation, type SrEvaluation, type SrGoal } from '../astro/srCompare'
import type { Route } from '../App'
import { useAccess } from '../billing/context'
import { birthKey } from '../billing/keys'
import { solarKey } from '../billing/rules'
import { Locked } from '../components/Locked'
import { locale, t } from '../i18n'

interface Props {
  natal: Chart | null
  houseSystem: HouseSystem
  go: (r: Route) => void
}

export function SolarReturnPage({ natal, houseSystem, go }: Props) {
  const [year, setYear] = useState(() => (natal ? currentReturnYear(natal) : new Date().getFullYear()))
  const natalWhere = (): Where | null =>
    natal?.birth ? { latitude: natal.latitude, longitude: natal.longitude, label: natal.birth.place, mode: 'natal' } : null
  const [where, setWhere] = useState<Where | null>(natalWhere)
  const [tab, setTab] = useState<'ano' | 'comparar'>('ano')
  const access = useAccess()

  const sr = useMemo(() => (natal && where ? solarReturnChart(natal, year, where, houseSystem) : null), [natal, where, year, houseSystem])

  if (!natal || !natal.birth || !where) {
    return (
      <div className="empty glass">
        <h2>{t('Revolução Solar')}</h2>
        <p>{t('Crie primeiro o seu mapa natal para calcular o mapa do seu ano pessoal.')}</p>
        <button className="cta" onClick={() => go('inicio')}><span>✦ Criar mapa</span></button>
      </div>
    )
  }
  if (!sr) return null

  const ascSign = SIGNS[sr.points.asc.sign]
  const sunHouse = sr.points.sun.house
  const moonHouse = sr.points.moon.house
  const ascInNatal = natal.hasHouses ? houseOf(sr.asc, natal.cusps) : null
  const angular = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as PointKey[])
    .flatMap((k) => ([['AC', sr.asc], ['MC', sr.mc], ['DC', sr.asc + 180], ['IC', sr.mc + 180]] as const)
      .filter(([, lon]) => Math.abs(angDiff(lon, sr.points[k].lon)) <= 6)
      .map(([ang]) => ({ k, ang })))
  const when = sr.date.toLocaleString(locale(), { dateStyle: 'long', timeStyle: 'short' })
  const thisYear = currentReturnYear(natal)
  const bk = birthKey(natal.birth)
  const key = solarKey(bk, year)
  const full = access.full(key)
  const needsLogin = access.enabled && !access.loggedIn
  const offer = { product: 'revolucao' as const, scope: { birth: bk, year }, label: `${natal.birth.name} · ${year}` }

  return (
    <div className="solar-return">
      <header className="page-head">
        <p className="eyebrow">{t('Seu ano astrológico')}</p>
        <h1 className="title-glow">{t('Revolução Solar')} {year}</h1>
        <p className="muted">
          {t('O Sol retorna a {deg} em', { deg: formatDegree(natal.points.sun.lon) })} <b>{when}</b> {t('(horário deste aparelho) · válida até o aniversário de {year}', { year: year + 1 })}
        </p>
        <div className="head-tools">
          <button className="ghost" onClick={() => setYear((y) => y - 1)}>‹ {year - 1}</button>
          {year !== thisYear && <button className="ghost" onClick={() => setYear(thisYear)}>{t('Ano atual')}</button>}
          <button className="ghost" onClick={() => setYear((y) => y + 1)}>{year + 1} ›</button>
        </div>
        <div className="segmented">
          <button className={tab === 'ano' ? 'active' : ''} onClick={() => setTab('ano')}>☼ {t('Meu ano')}</button>
          <button className={tab === 'comparar' ? 'active' : ''} onClick={() => setTab('comparar')}>⚖ {t('Comparar cidades')}</button>
        </div>
      </header>

      {needsLogin ? (
        <Locked
          title={`O mapa do seu ano ${year}`}
          text={t('Entre grátis para ver o Ascendente do ano e onde estão o Sol e a Lua: as áreas da vida em destaque até o próximo aniversário.')}
          go={go}
        />
      ) : tab === 'comparar' ? (
        full ? <CompareCities natal={natal} year={year} houseSystem={houseSystem} /> : (
          <Locked
            title={t('Onde passar o aniversário')}
            text={t('Compare cidades e descubra qual local favorece mais o seu ano, conforme o seu objetivo.')}
            offer={offer}
            go={go}
          />
        )
      ) : (
      <>
      <section className="glass pad sr-where">
        <PlacePicker
          title={t('Onde você vai passar o aniversário?')}
          value={where}
          natal={{ latitude: natal.latitude, longitude: natal.longitude, place: natal.birth.place }}
          onChange={setWhere}
        />
        <p className="muted small">{t('As posições dos planetas são as mesmas em qualquer lugar; o que muda são as casas — ou seja, em que áreas da vida o ano acontece.')}</p>
      </section>

      <section className="wheel-layout">
        <div className="wheel-box">
          <ChartWheel chart={sr} />
          <p className="hint">{t('Mapa do instante exato do retorno solar, para {place}', { place: where.label })}</p>
        </div>
        <aside className="glass detail">
          <p className="eyebrow">{t('O tom do ano')}</p>
          <div className="pd-head">
            <span className="pd-glyph" style={{ color: ELEMENT_INFO[ascSign.element].color }}>{ascSign.glyph}</span>
            <div>
              <h3>{t('{planet} em {sign}', { planet: POINTS.asc.name, sign: ascSign.name })}</h3>
              <p className="muted">{formatDegree(sr.asc)}{ascInNatal ? ` · ${t('na casa {n} natal', { n: ascInNatal })}` : ''}</p>
            </div>
          </div>
          <p className="serif">{SR_ASC[sr.points.asc.sign]}</p>
          {ascInNatal && (
            <p className="serif">{t('O Ascendente do ano cai na sua {house} natal: o ano mobiliza especialmente {theme}.', { house: HOUSE_TEXT[ascInNatal - 1].name.toLowerCase(), theme: HOUSE_TEXT[ascInNatal - 1].theme.toLowerCase() })}</p>
          )}
        </aside>
      </section>

      <section className="sr-cards">
        <article className="glass report-card" style={{ ['--accent' as string]: POINTS.sun.color }}>
          <div className="report-glyph">{POINTS.sun.glyph}</div>
          <div>
            <h3>{t('Onde está a luz do ano')}</h3>
            <p className="subtitle">{t('{planet} na casa {n}', { planet: POINTS.sun.name, n: sunHouse })} · {HOUSE_TEXT[sunHouse - 1].theme}</p>
            <p>{SR_SUN_HOUSE[sunHouse - 1]}</p>
          </div>
        </article>
        <article className="glass report-card" style={{ ['--accent' as string]: POINTS.moon.color }}>
          <div className="report-glyph">{POINTS.moon.glyph}</div>
          <div>
            <h3>{t('O clima emocional')}</h3>
            <p className="subtitle">{t('{planet} em {sign}', { planet: POINTS.moon.name, sign: SIGNS[sr.points.moon.sign].name })}, {t('casa {n}', { n: moonHouse })}</p>
            <p>{SR_MOON_HOUSE[moonHouse - 1]}</p>
          </div>
        </article>
        {full && <article className="glass report-card" style={{ ['--accent' as string]: '#ffe8a3' }}>
          <div className="report-glyph">✶</div>
          <div>
            <h3>{t('Planetas em destaque')}</h3>
            <p className="subtitle">{t('Planetas próximos aos ângulos ganham força no ano')}</p>
            {angular.length === 0
              ? <p>{t('Nenhum planeta angular: a energia do ano se distribui de forma equilibrada entre as casas.')}</p>
              : angular.map(({ k, ang }, i) => <p key={i}><b style={{ color: POINTS[k].color }}>{POINTS[k].glyph} {POINTS[k].name}</b> {t('junto ao {angle}:', { angle: ang })} {t(ANGLE_TEXT[ang])}</p>)}
          </div>
        </article>}
      </section>

      {!full && (
        <Locked
          title={t('Revolução Solar completa')}
          text={t('Planetas em destaque no ano, todas as posições e aspectos, o comparador de cidades para o aniversário e a análise completa.')}
          offer={offer}
          go={go}
        />
      )}

      {full && <section className="sky-grid">
        <div className="glass pad">
          <h2>{t('Posições do ano')}</h2>
          <ul className="planet-rows">
            {(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node'] as PointKey[]).map((k) => {
              const p = sr.points[k]
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
          <h2>{t('Elementos do ano')}</h2>
          <ElementBars balance={sr.balance} />
          <h2 className="mt">{t('Aspectos principais')}</h2>
          <ul className="aspect-list">
            {sr.aspects.filter((a) => a.type.major && a.a !== 'lilith' && a.b !== 'lilith').slice(0, 10).map((a, i) => (
              <li key={i}>
                <span style={{ color: a.type.color }}>{a.type.glyph}</span>
                {POINTS[a.a].name} {a.type.name.toLowerCase()} {POINTS[a.b].name}
                <small>{a.orb.toFixed(1)}°</small>
              </li>
            ))}
          </ul>
        </div>
      </section>}

      <AiReading
        kind="revolucao"
        subject={`${natal.birth.name} · ${year}`}
        cacheKey={`${natal.birth.name}|${natal.date.toISOString()}|${year}|${where.latitude.toFixed(2)},${where.longitude.toFixed(2)}|${houseSystem}`}
        accessKey={key}
        offer={offer}
        getSummary={() => solarReturnSummary(natal, sr, year, where.label)}
        go={go}
      />
      </>
      )}
    </div>
  )
}

const ANGLE_TEXT: Record<string, string> = {
  AC: 'marca a sua personalidade e o corpo durante todo o ano.',
  MC: 'coloca carreira e reputação em evidência.',
  DC: 'traz esse tema através das relações e parcerias.',
  IC: 'atua no lar, na família e nas bases emocionais.',
}

function CompareCities({ natal, year, houseSystem }: { natal: Chart; year: number; houseSystem: HouseSystem }) {
  const birth = natal.birth!
  const natalPlace = { latitude: natal.latitude, longitude: natal.longitude, place: birth.place }
  const [a, setA] = useState<Where>({ latitude: natal.latitude, longitude: natal.longitude, label: birth.place, mode: 'natal' })
  const [b, setB] = useState<Where | null>(null)
  const [goal, setGoal] = useState<SrGoal>('geral')

  const srA = useMemo(() => solarReturnChart(natal, year, a, houseSystem), [natal, year, a, houseSystem])
  const srB = useMemo(() => (b ? solarReturnChart(natal, year, b, houseSystem) : null), [natal, year, b, houseSystem])
  const evA = useMemo(() => evaluateLocation(srA, goal), [srA, goal])
  const evB = useMemo(() => (srB ? evaluateLocation(srB, goal) : null), [srB, goal])

  const winner = evB ? (evA.score === evB.score ? null : evA.score > evB.score ? 'a' : 'b') : null
  const placeholderB: Where = { latitude: 0, longitude: 0, label: t('escolha um local'), mode: 'cidade' }

  return (
    <div className="sr-compare">
      <section className="glass pad">
        <p className="eyebrow">{t('Qual é o seu objetivo para este ano?')}</p>
        <div className="segmented small left">
          {SR_GOALS.map((g) => (
            <button key={g.key} className={goal === g.key ? 'active' : ''} onClick={() => setGoal(g.key)}>{g.icon} {t(g.name)}</button>
          ))}
        </div>
      </section>

      <section className="cmp-pickers">
        <div className="glass pad"><PlacePicker title={t('Local A')} value={a} natal={natalPlace} onChange={setA} /></div>
        <div className="glass pad"><PlacePicker title={t('Local B')} value={b ?? placeholderB} natal={natalPlace} onChange={setB} /></div>
      </section>

      {!srB || !evB ? (
        <p className="glass pad center">{t('Escolha o Local B para ver o comparativo.')}</p>
      ) : (
        <>
          <section className={`glass pad cmp-verdict ${winner ?? 'tie'}`}>
            <p className="eyebrow">{t('Resultado para:')} {t(SR_GOALS.find((g) => g.key === goal)!.name)}</p>
            {winner ? (
              <h2>🏆 {t('Melhor local:')} {winner === 'a' ? a.label : b!.label}</h2>
            ) : (
              <h2>{t('Empate — os dois locais têm força parecida')}</h2>
            )}
            <p className="muted">
              {winner
                ? `${t('Diferença de {n} pontos.', { n: Math.abs(evA.score - evB.score) })} ${t(Math.abs(evA.score - evB.score) < 8 ? 'É uma vantagem pequena: considere também conforto, pessoas queridas e praticidade.' : 'Uma vantagem clara segundo os critérios clássicos da Revolução Solar.')}`
                : t('Escolha pelo que for mais confortável para você — ou teste um terceiro local.')}
            </p>
          </section>

          <section className="cmp-grid">
            <CompareColumn tag="A" where={a} sr={srA} ev={evA} win={winner === 'a'} />
            <CompareColumn tag="B" where={b!} sr={srB} ev={evB} win={winner === 'b'} />
          </section>

          <section className="glass pad">
            <h2>{t('Lado a lado')}</h2>
            <div className="table-wrap">
              <table className="astro-table cmp-table">
                <thead><tr><th></th><th>A · {shortLabel(a.label)}</th><th>B · {shortLabel(b!.label)}</th></tr></thead>
                <tbody>
                  <tr><td>{t('Ascendente do ano')}</td><td>{SIGNS[srA.points.asc.sign].glyph} {SIGNS[srA.points.asc.sign].name}</td><td>{SIGNS[srB.points.asc.sign].glyph} {SIGNS[srB.points.asc.sign].name}</td></tr>
                  <tr><td>{POINTS.mc.name}</td><td>{SIGNS[srA.points.mc.sign].name}</td><td>{SIGNS[srB.points.mc.sign].name}</td></tr>
                  {(['sun', 'moon', 'jupiter', 'venus', 'saturn', 'mars'] as PointKey[]).map((k) => (
                    <tr key={k}>
                      <td><span style={{ color: POINTS[k].color }}>{POINTS[k].glyph}</span> {POINTS[k].name}</td>
                      <td>{t('casa {n}', { n: srA.points[k].house })} · {HOUSE_TEXT[srA.points[k].house - 1].theme.toLowerCase()}</td>
                      <td>{t('casa {n}', { n: srB.points[k].house })} · {HOUSE_TEXT[srB.points[k].house - 1].theme.toLowerCase()}</td>
                    </tr>
                  ))}
                  <tr className="cmp-score-row"><td>{t('Pontuação')}</td><td>{evA.score}/100</td><td>{evB.score}/100</td></tr>
                </tbody>
              </table>
            </div>
            <p className="muted small">
              {t('Critérios clássicos de "relocação" da Revolução Solar: Júpiter e Vênus em casas fortes (1, 10, 7, 4) favorecem; Saturno e Marte nessas casas, e o Sol na casa 12, pedem mais esforço. A pontuação é um guia de comparação, não uma regra absoluta.')}
            </p>
          </section>
        </>
      )}
    </div>
  )
}

const shortLabel = (s: string) => s.split(',')[0]

function CompareColumn({ tag, where, sr, ev, win }: { tag: string; where: Where; sr: Chart; ev: SrEvaluation; win: boolean }) {
  const asc = SIGNS[sr.points.asc.sign]
  return (
    <article className={`glass pad cmp-col ${win ? 'win' : ''}`}>
      <div className="cmp-head">
        <span className="cmp-tag">{tag}</span>
        <div>
          <h3>{shortLabel(where.label)}</h3>
          <p className="muted small">{where.label}</p>
        </div>
        {win && <span className="cmp-badge">🏆 {t('Melhor')}</span>}
      </div>
      <div className="cmp-score">
        <div className="meter-track"><span className="meter-fill" style={{ width: `${ev.score}%`, background: win ? 'linear-gradient(90deg,#ffe8a3,#4ade80)' : 'linear-gradient(90deg,#c4b5fd,#a78bfa)' }} /></div>
        <b>{ev.score}</b>
      </div>
      <div className="cmp-wheel"><ChartWheel chart={sr} spin={false} showAspects={false} /></div>
      <p><b style={{ color: ELEMENT_INFO[asc.element].color }}>{asc.glyph} {t('{planet} em {sign}', { planet: POINTS.asc.name, sign: asc.name })}</b> — {SR_ASC[sr.points.asc.sign].split(':')[1]?.trim()}</p>
      {ev.pros.length > 0 && (
        <>
          <p className="eyebrow good">{t('A favor')}</p>
          <ul className="cmp-list good">{ev.pros.slice(0, 5).map((f, i) => <li key={i}>✓ {f.text}</li>)}</ul>
        </>
      )}
      {ev.cons.length > 0 && (
        <>
          <p className="eyebrow bad">{t('Pontos de atenção')}</p>
          <ul className="cmp-list bad">{ev.cons.slice(0, 5).map((f, i) => <li key={i}>! {f.text}</li>)}</ul>
        </>
      )}
    </article>
  )
}
