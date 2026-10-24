import { afterEach, describe, expect, it, vi } from 'vitest'
import { chartFromBirth } from '../astro/chart'
import { buildDailyMessages } from './notifications'
import { DEFAULT_TOPICS } from './profiles'

describe('notificações por tema', () => {
  afterEach(() => vi.useRealTimers())
  const natal = chartFromBirth({ name: 'T', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
  it('the eclipse and Mars entering Cancer lead their days', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 11, 7, 0))
    const msgs = buildDailyMessages(natal, 8, 3, DEFAULT_TOPICS)
    const eclipseDay = msgs.find((m) => m.date === '2026-08-12')!
    expect(eclipseDay.title).toMatch(/Eclipse solar total/)
    expect(msgs.find((m) => m.date === '2026-08-11')!.title).toMatch(/Marte entra em Câncer/)
  })
  it('without topics it falls back to the Moon of the day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 11, 7, 0))
    const msgs = buildDailyMessages(natal, 8, 2, { transitos: false, lunacoes: false, planetas: false, luaSigno: false, foraDeCurso: false })
    expect(msgs[0].title).toMatch(/em /)
    expect(msgs[0].body.split('\n')).toHaveLength(1)
  })
})
