import { useEffect, useMemo, useState } from 'react'
import { POINTS } from '../astro/constants'
import { calendarEvents, retrogradesAt, type CalEvent, type CalEventKind } from '../astro/calendar'
import { KIND_INFO, eventHint, eventTime, eventTitle } from '../interpret/calendar'
import { locale, t } from '../i18n'

const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const DEFAULT_KINDS: CalEventKind[] = ['fase', 'eclipse', 'ingresso', 'estacao', 'fora-de-curso']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export function CalendarPage() {
  const [base] = useState(() => new Date())
  const [offset, setOffset] = useState(0)
  const [kinds, setKinds] = useState<CalEventKind[]>(DEFAULT_KINDS)
  const [selected, setSelected] = useState<string | null>(null)
  const month = useMemo(() => new Date(base.getFullYear(), base.getMonth() + offset, 1), [base, offset])
  // Computing a month takes a moment on phones: do it after painting the new month.
  const [result, setResult] = useState<{ key: number; events: CalEvent[] } | null>(null)
  useEffect(() => {
    const id = setTimeout(() => setResult({ key: month.getTime(), events: calendarEvents(month, new Date(month.getFullYear(), month.getMonth() + 1, 1)) }), 30)
    return () => clearTimeout(id)
  }, [month])
  const loading = result?.key !== month.getTime()
  const events = loading ? [] : result!.events
  const visible = events.filter((e) => kinds.includes(e.kind))
  const byDay = new Map<string, CalEvent[]>()
  for (const e of visible) {
    const k = dayKey(e.date)
    if (!byDay.has(k)) byDay.set(k, [])
    byDay.get(k)!.push(e)
  }
  const first = month.getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const today = dayKey(base)
  const retros = useMemo(() => retrogradesAt(offset === 0 ? base : month), [base, month, offset])
  const toggle = (k: CalEventKind) => setKinds((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))
  const listDays = [...byDay.entries()].filter(([k]) => !selected || k === selected)

  return (
    <div className="calendar">
      <header className="page-head">
        <p className="eyebrow">{t('Calendário astral')}</p>
        <h1 className="title-glow">{cap(month.toLocaleDateString(locale(), { month: 'long', year: 'numeric' }))}</h1>
        <div className="head-tools">
          <button className="ghost" onClick={() => { setOffset((o) => o - 1); setSelected(null) }}>‹ {t('Anterior')}</button>
          {offset !== 0 && <button className="ghost" onClick={() => { setOffset(0); setSelected(null) }}>{t('Hoje')}</button>}
          <button className="ghost" onClick={() => { setOffset((o) => o + 1); setSelected(null) }}>{t('Próximo')} ›</button>
        </div>
        <p className="muted small">
          {retros.length ? `${t(offset === 0 ? 'Retrógrados agora:' : 'Retrógrados no início do mês:')} ${retros.map((k) => POINTS[k].name).join(', ')}` : t('Nenhum planeta retrógrado neste momento.')}
        </p>
      </header>

      <div className="acg-chips">
        {(Object.keys(KIND_INFO) as CalEventKind[]).map((k) => (
          <button key={k} className={kinds.includes(k) ? 'on' : ''} onClick={() => toggle(k)} style={{ ['--c' as string]: 'var(--gold)' }}>
            <span className="g">{KIND_INFO[k].icon}</span> {t(KIND_INFO[k].label)}
          </button>
        ))}
      </div>

      <section className="glass pad cal-grid" aria-label={t('Dias do mês')}>
        {WEEK.map((w) => <span key={w} className="cal-wd">{w}</span>)}
        {Array.from({ length: first }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
          const k = dayKey(d)
          const evs = byDay.get(k) ?? []
          return (
            <button key={k} className={`cal-day ${k === today ? 'today' : ''} ${k === selected ? 'sel' : ''} ${evs.some((e) => e.kind === 'eclipse') ? 'ecl' : ''}`}
              onClick={() => setSelected(k === selected ? null : k)} aria-label={`${i + 1}: ${evs.length} eventos`}>
              <span className="n">{i + 1}</span>
              <span className="icons">{evs.slice(0, 3).map((e, j) => <i key={j}>{KIND_INFO[e.kind].icon}</i>)}</span>
            </button>
          )
        })}
      </section>

      {loading && <div className="loader"><span /> {t('Calculando o céu do mês…')}</div>}
      <section className="cal-list">
        {selected && <button className="link" onClick={() => setSelected(null)}>{t('Ver o mês inteiro')}</button>}
        {!loading && listDays.length === 0 && <p className="glass pad muted">{t('Nenhum evento com os filtros escolhidos.')}</p>}
        {listDays.map(([k, evs]) => (
          <div key={k} className="glass cal-day-block">
            <h3>{cap(evs[0].date.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
            <ul>
              {evs.map((e, i) => (
                <li key={i} className={`k-${e.kind}`}>
                  <span className="ic">{KIND_INFO[e.kind].icon}</span>
                  <div>
                    <b>{eventTitle(e)}</b> <small className="muted">{eventTime(e)}</small>
                    <p className="muted small">{eventHint(e)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
