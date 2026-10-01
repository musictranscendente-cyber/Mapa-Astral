import type { Chart } from '../astro/chart'
import { SIGNS } from '../astro/constants'
import { bodyLongitude, moonPhaseInfo, toTime } from '../astro/ephemeris'
import { scoreDay, transitsAt } from '../astro/transits'
import { transitHeadline } from '../interpret/aspects'
import { moonSignOfDayText } from '../interpret/report'

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

/** Personal message for each of the next `days` days, at the chosen local hour. */
export function buildDailyMessages(natal: Chart, hour: number, days = 21): DailyMessage[] {
  const out: DailyMessage[] = []
  const now = new Date()
  let previous = ''
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, 0)
    const score = scoreDay(natal, d)
    const moonSign = Math.floor(bodyLongitude('moon', toTime(d)) / 30)
    const phase = moonPhaseInfo(d)
    // Fast movers change daily; slow transits would repeat for weeks. Never repeat yesterday's headline.
    const hits = transitsAt(natal, d)
    const candidates = [...hits.filter((h) => FAST.includes(h.transit)), ...hits]
    const top = candidates.find((h) => transitHeadline(h.transit, h.natal, h.type.key) !== previous)
    previous = top ? transitHeadline(top.transit, top.natal, top.type.key) : ''
    const mood = score.flow > 25 ? 'dia de fluxo ✦' : score.flow < -25 ? 'dia de atenção ⚠' : 'dia de equilíbrio ☯'
    const title = top
      ? `${transitHeadline(top.transit, top.natal, top.type.key)} · ${mood}`
      : `${phase.name} em ${SIGNS[moonSign].name} · ${mood}`
    const body = `${phase.emoji} ${moonSignOfDayText(moonSign)}`
    out.push({ date: localDay(d), title, body })
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

export async function scheduleMessages(natal: Chart | null, enabled: boolean, hour: number) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const messages = enabled && natal ? buildDailyMessages(natal, hour) : []
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
