/**
 * Converts a wall-clock time in an IANA time zone to a UTC instant.
 * Uses the browser's tz database, which includes historical DST rules
 * (e.g. Brazil's horário de verão across the decades).
 */
export function zonedOffsetMinutes(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const parts: Record<string, number> = {}
  for (const p of dtf.formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value)
  }
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second)
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000)
}

export interface LocalDateTime {
  year: number
  month: number // 1..12
  day: number
  hour: number
  minute: number
}

export function localToUtc(local: LocalDateTime, timeZone: string): Date {
  const naive = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute)
  if (timeZone.startsWith('UTC')) {
    return new Date(naive - parseUtcOffset(timeZone) * 60000)
  }
  let off = zonedOffsetMinutes(naive, timeZone)
  let utc = naive - off * 60000
  const off2 = zonedOffsetMinutes(utc, timeZone)
  if (off2 !== off) {
    off = off2
    utc = naive - off * 60000
  }
  return new Date(utc)
}

/** "UTC-3", "UTC+5:30" → minutes. */
export function parseUtcOffset(tz: string): number {
  const m = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(tz.trim())
  if (!m) return 0
  const v = Number(m[2]) * 60 + Number(m[3] ?? 0)
  return m[1] === '-' ? -v : v
}

export function offsetLabel(date: Date, timeZone: string): string {
  const min = timeZone.startsWith('UTC') ? parseUtcOffset(timeZone) : zonedOffsetMinutes(date.getTime(), timeZone)
  const sign = min < 0 ? '-' : '+'
  const a = Math.abs(min)
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? ':' + String(a % 60).padStart(2, '0') : ''}`
}

export function formatInZone(date: Date, timeZone: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const tz = timeZone.startsWith('UTC') ? undefined : timeZone
  if (!tz) {
    const shifted = new Date(date.getTime() + parseUtcOffset(timeZone) * 60000)
    return new Intl.DateTimeFormat('pt-BR', { ...opts, timeZone: 'UTC' }).format(shifted)
  }
  return new Intl.DateTimeFormat('pt-BR', { ...opts, timeZone: tz }).format(date)
}

export const userTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
