import type { BirthData } from '../astro/chart'

/**
 * Stable id of a birth chart, used to tie purchases to a person. It depends only on the
 * birth moment and place (not on the name or the device), so it survives renames and sync.
 */
export function birthKey(b: Pick<BirthData, 'local' | 'timeZone' | 'latitude' | 'longitude'>): string {
  const l = b.local
  const s = `${l.year}-${l.month}-${l.day}T${l.hour}:${l.minute}|${b.timeZone}|${b.latitude.toFixed(3)}|${b.longitude.toFixed(3)}`
  let h1 = 5381
  let h2 = 52711
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = (Math.imul(h1, 33) ^ c) | 0
    h2 = (Math.imul(h2, 31) + c) | 0
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)
}
