import { describe, expect, it } from 'vitest'
import { calendarEvents } from './calendar'

describe('calendário astral', () => {
  const ev = calendarEvents(new Date('2026-07-01T00:00:00Z'), new Date('2026-08-31T23:59:59Z'))
  it('has moon phases, moon sign changes and the 12 Aug 2026 solar eclipse', () => {
    expect(ev.filter((e) => e.kind === 'fase').length).toBeGreaterThanOrEqual(8)
    expect(ev.filter((e) => e.kind === 'lua-signo').length).toBeGreaterThanOrEqual(22)
    expect(ev.some((e) => e.kind === 'eclipse' && e.date.toISOString().startsWith('2026-08-12'))).toBe(true)
  })
  it('finds the Sun entering Leo around 22–23 July and Virgo around 22–23 August', () => {
    const leo = ev.find((e) => e.kind === 'ingresso' && e.planet === 'sun' && e.sign === 4)!
    expect(leo.date.toISOString().slice(0, 10) >= '2026-07-22' && leo.date.toISOString().slice(0, 10) <= '2026-07-23').toBe(true)
    expect(ev.some((e) => e.kind === 'ingresso' && e.planet === 'sun' && e.sign === 5)).toBe(true)
  })
  it('Mercury station retrograde in 2026 summer (late June/early July → direct ~23 July)', () => {
    const st = calendarEvents(new Date('2026-06-15T00:00:00Z'), new Date('2026-07-31T00:00:00Z')).filter((e) => e.kind === 'estacao' && e.planet === 'mercury')
    expect(st.some((e) => e.retro)).toBe(true)
    expect(st.some((e) => !e.retro)).toBe(true)
  })
  it('void-of-course periods end at a Moon sign change', () => {
    const voc = ev.filter((e) => e.kind === 'fora-de-curso')
    expect(voc.length).toBeGreaterThan(10)
    for (const v of voc) expect(ev.some((e) => e.kind === 'lua-signo' && e.date.getTime() === v.end!.getTime())).toBe(true)
  })
})
