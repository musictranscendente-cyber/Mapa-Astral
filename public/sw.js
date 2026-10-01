/* Mapa Astral service worker — daily sky notifications.
 * The page pre-computes the next days' personal messages (astro math runs in the app)
 * and hands them to this worker, which shows today's message at the chosen hour via
 * Periodic Background Sync (installed app on Chromium) or when the app is opened. */
const STORE = 'mapa-astral-notif'
const KEY = './__notif.json'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

async function load() {
  const cache = await caches.open(STORE)
  const res = await cache.match(KEY)
  return res ? res.json() : null
}

async function save(data) {
  const cache = await caches.open(STORE)
  await cache.put(KEY, new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } }))
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function showDue(force) {
  const data = await load()
  if (!data || !data.enabled) return
  const day = today()
  if (!force && (data.lastShown === day || new Date().getHours() < data.hour)) return
  const msg = (data.messages || []).find((m) => m.date === day)
  if (!msg) return
  await self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: './favicon.svg',
    badge: './favicon.svg',
    tag: 'daily-sky',
    data: { url: './#/ceu' },
  })
  data.lastShown = day
  await save(data)
}

self.addEventListener('message', (event) => {
  const msg = event.data || {}
  if (msg.type === 'schedule') event.waitUntil(load().then((old) => save({ ...msg.payload, lastShown: old ? old.lastShown : null })))
  if (msg.type === 'check') event.waitUntil(showDue(false))
  if (msg.type === 'test') event.waitUntil(showDue(true))
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sky') event.waitUntil(showDue(false))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || './'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus() }
      }
      return self.clients.openWindow(url)
    }),
  )
})
