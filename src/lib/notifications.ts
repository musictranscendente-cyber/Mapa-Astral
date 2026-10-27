import type { Chart } from '../astro/chart'
import { SIGNS } from '../astro/constants'
import { bodyLongitude, moonPhaseInfo, toTime } from '../astro/ephemeris'
import { scoreDay, transitsAt } from '../astro/transits'
import { transitHeadline } from '../interpret/aspects'
import { moonSignOfDayText } from '../interpret/report'
import { calendarEvents, type CalEvent } from '../astro/calendar'
import { eventTime, eventTitle } from '../interpret/calendar'
import { DEFAULT_TOPICS, type NotifyTopics } from './profiles'
import { locale } from '../i18n'

const FAST = ['moon', 'sun', 'mercury', 'venus', 'mars']

export interface DailyMessage {
  date: string // YYYY-MM-DD (local)
  title: string
  body: string
}

export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const time = (d: Date) => d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })
const ICON: Partial<Record<CalEvent['kind'], string>> = { eclipse: '🌘', estacao: '℞', ingresso: '✦', 'lua-signo': '☽', 'fora-de-curso': '∅' }

/** Personal message for each of the next `days` days, at the chosen local hour, following the chosen topics. */
export function buildDailyMessages(natal: Chart, hour: number, days = 21, topics: NotifyTopics = DEFAULT_TOPICS): DailyMessage[] {
  const out: DailyMessage[] = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + days * 86400000)
  const events = topics.lunacoes || topics.planetas || topics.luaSigno || topics.foraDeCurso
    ? calendarEvents(start, end, { voc: topics.foraDeCurso, moonSigns: topics.luaSigno })
    : []
  let previous = ''
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, 0)
    const key = localDay(d)
    const moonSign = Math.floor(bodyLongitude('moon', toTime(d)) / 30)
    const phase = moonPhaseInfo(d)
    const today = events.filter((e) => localDay(e.date) === key || (e.kind === 'fora-de-curso' && localDay(e.end!) === key))
    const pick = (kinds: CalEvent['kind'][]) => today.filter((e) => kinds.includes(e.kind))
    const featured = [
      ...(topics.lunacoes ? pick(['eclipse']) : []),
      ...(topics.lunacoes ? pick(['fase']).filter((e) => e.quarter === 0 || e.quarter === 2) : []),
      ...(topics.planetas ? pick(['estacao', 'ingresso']) : []),
    ]
    const extras = [...(topics.luaSigno ? pick(['lua-signo']) : []), ...(topics.foraDeCurso ? pick(['fora-de-curso']) : [])]

    let title: string
    if (featured.length) {
      const f = featured[0]
      title = `${f.kind === 'fase' ? (f.quarter === 0 ? '🌑' : '🌕') : ICON[f.kind] ?? '✦'} ${eventTitle(f)} · ${time(f.date)}`
    } else if (topics.transitos) {
      // Fast movers change daily; slow transits would repeat for weeks. Never repeat yesterday's headline.
      const score = scoreDay(natal, d)
      const hits = transitsAt(natal, d)
      const top = [...hits.filter((h) => FAST.includes(h.transit)), ...hits].find((h) => transitHeadline(h.transit, h.natal, h.type.key) !== previous)
      previous = top ? transitHeadline(top.transit, top.natal, top.type.key) : ''
      const mood = score.flow > 25 ? 'dia de fluxo ✦' : score.flow < -25 ? 'dia de atenção ⚠' : 'dia de equilíbrio ☯'
      title = top ? `${previous} · ${mood}` : `${phase.name} em ${SIGNS[moonSign].name} · ${mood}`
    } else {
      title = `${phase.emoji} ${phase.name} em ${SIGNS[moonSign].name}`
    }
    const lines = [`${phase.emoji} ${moonSignOfDayText(moonSign)}`]
    for (const e of [...featured.slice(1), ...extras]) lines.push(`${ICON[e.kind] ?? '✦'} ${eventTitle(e)} · ${eventTime(e)}`)
    out.push({ date: key, title, body: lines.join('\n') })
  }
  return out
}

let registration: Promise<ServiceWorkerRegistration | null> | null = null

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  registration ??= navigator.serviceWorker
    .register('./sw.js')
    .then(() => navigator.serviceWorker.ready)
    .catch(() => null)
  return registration
}

async function post(message: unknown) {
  const reg = await registerServiceWorker()
  reg?.active?.postMessage(message)
}

export async function enableNotifications(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return 'denied'
  const reg = await registerServiceWorker()
  // Periodic Background Sync: Chromium, installed app only — best effort.
  const periodic = (reg as ServiceWorkerRegistration & { periodicSync?: { register: (tag: string, o: { minInterval: number }) => Promise<void> } } | null)?.periodicSync
  try { await periodic?.register('daily-sky', { minInterval: 6 * 3600 * 1000 }) } catch { /* not allowed */ }
  return 'granted'
}

export async function scheduleMessages(natal: Chart | null, enabled: boolean, hour: number, topics: NotifyTopics = DEFAULT_TOPICS) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const messages = enabled && natal ? buildDailyMessages(natal, hour, 21, topics) : []
  await post({ type: 'schedule', payload: { enabled: enabled && !!natal, hour, messages } })
  if (enabled) await post({ type: 'check' })
}

export const testNotification = () => post({ type: 'test' })

/** While the app is open, fire the daily message right at the chosen hour. */
export function armInAppTimer(hour: number): () => void {
  const now = new Date()
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 5)
  if (at <= now) return () => {}
  const id = window.setTimeout(() => post({ type: 'check' }), at.getTime() - now.getTime())
  return () => window.clearTimeout(id)
}
