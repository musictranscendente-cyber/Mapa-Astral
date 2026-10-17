import { supabase } from './supabase'

/**
 * Anonymous usage counting: a random id per device (no personal data), one "visita" per
 * device per day, plus charts created and images shared. Read only by the owner (app_stats).
 */
export type EventKind = 'visita' | 'mapa' | 'compartilhar'

const VISITOR = 'mapa-astral:visitante'
const LAST_DAY = 'mapa-astral:visita-dia'

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR)
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem(VISITOR, id)
    }
    return id
  } catch {
    return 'anonimo-sem-armazenamento'
  }
}

export function track(kind: EventKind, source?: string) {
  if (!supabase) return
  supabase.from('app_events').insert({ kind, visitor: visitorId(), source: source?.slice(0, 60) ?? null }).then(() => {}, () => {})
}

/** Where this visit came from: a shared image (?ref=…), another site, or typed directly. */
function visitSource(): string {
  const url = new URL(window.location.href)
  const ref = url.searchParams.get('ref')
  if (ref) {
    url.searchParams.delete('ref')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    return ref
  }
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
    if (host && host !== window.location.hostname) {
      if (/instagram/.test(host)) return 'instagram'
      if (/whatsapp|wa\.me/.test(host)) return 'whatsapp'
      if (/facebook|fb\./.test(host)) return 'facebook'
      if (/google\./.test(host)) return 'google'
      return host
    }
  } catch { /* ignore */ }
  return 'direto'
}

/** Counts one visit per device per day. */
export function trackVisit() {
  const source = visitSource()
  const today = new Date().toISOString().slice(0, 10)
  try {
    if (localStorage.getItem(LAST_DAY) === today) return
    localStorage.setItem(LAST_DAY, today)
  } catch { /* count anyway */ }
  track('visita', source)
}

export interface DayStat { day: string; visitantes: number; mapas: number; compartilhamentos: number }
export interface AppStats {
  daily: DayStat[]
  totals: { visitantes: number; visitas: number; mapas: number; compartilhamentos: number; contas: number }
  sources: { origem: string; visitas: number }[]
}

export async function fetchStats(days = 30): Promise<AppStats> {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase.rpc('app_stats', { p_days: days })
  if (error) throw error
  return data as AppStats
}
