import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SHARED } from '../../scripts/sync-functions.mjs'
import { birthKey } from './keys'
import {
  EMPTY_ACCESS, analysisAllowance, buildAccess, extendPlan, grantKeys, pairKey, paidEnough,
  solarKey, unlocked, validAnalysisKey, type AccessData,
} from './rules'

const now = new Date('2026-10-15T12:00:00Z')
const birth = { local: { year: 1990, month: 5, day: 1, hour: 14, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63 }

describe('billing rules', () => {
  it('copies of the shared modules match the source', () => {
    for (const [from, to] of SHARED) expect(readFileSync(to, 'utf8'), `${to} desatualizado: rode npm run sync:functions`).toBe(readFileSync(from, 'utf8'))
  })

  it('birth key is stable, short and ignores the name', () => {
    const k = birthKey(birth)
    expect(k).toMatch(/^[a-z0-9]{4,40}$/)
    expect(birthKey({ ...birth })).toBe(k)
    expect(birthKey({ ...birth, latitude: -22.9 })).not.toBe(k)
  })

  it('grant keys validate the scope of each product', () => {
    const b = birthKey(birth)
    expect(grantKeys('natal', { birth: b })).toEqual([`natal:${b}`])
    expect(grantKeys('natal', {})).toBeNull()
    expect(grantKeys('retorno_lunar', { birth: b })).toEqual([`retorno-lunar:${b}`])
    expect(grantKeys('progressoes', { birth: b })).toEqual([`progressoes:${b}`])
    expect(grantKeys('astrocarto', { birth: b })).toEqual([`astrocartografia:${b}`])
    expect(grantKeys('sinastria', { birth: b, other: 'abcd1234' })).toEqual([pairKey('abcd1234', b)])
    expect(grantKeys('sinastria', { birth: b, other: b })).toBeNull()
    expect(grantKeys('revolucao', { birth: b })).toBeNull()
    expect(grantKeys('pacote', { birth: b, year: 2026 })).toEqual([solarKey(b, 2026), `previsao:${b}`])
    expect(grantKeys('cosmos_anual', {})).toEqual([])
    for (const k of grantKeys('pacote', { birth: b, year: 2026 })!) {
      expect(validAnalysisKey(k.startsWith('revolucao') ? 'revolucao' : 'previsao', k)).toBe(true)
    }
    expect(validAnalysisKey('sinastria', pairKey(b, 'abcd1234'))).toBe(true)
    expect(validAnalysisKey('natal', 'natal:../x')).toBe(false)
  })

  it('analysis allowance: grant, then plan, then the welcome gift', () => {
    const free = buildAccess(null, [], [], now)
    expect(analysisAllowance(free, 'natal:abcd', now)).toMatchObject({ ok: true, source: 'welcome' })
    const welcomed = buildAccess(null, [], [{ source: 'welcome', access_key: 'natal:abcd', created_at: now.toISOString() }], now)
    expect(analysisAllowance(welcomed, 'natal:abcd', now).ok).toBe(false)

    const bought: AccessData = { ...welcomed, grants: [{ key: 'natal:abcd', expiresAt: null }] }
    expect(analysisAllowance(bought, 'natal:abcd', now)).toMatchObject({ ok: true, source: 'grant', left: 0 })
    expect(analysisAllowance({ ...bought, usedByKey: { 'natal:abcd': 1 } }, 'natal:abcd', now).ok).toBe(false)
    const rebought: AccessData = { ...bought, grants: [...bought.grants, { key: 'natal:abcd', expiresAt: null }], usedByKey: { 'natal:abcd': 1 } }
    expect(analysisAllowance(rebought, 'natal:abcd', now)).toMatchObject({ ok: true, source: 'grant', left: 0 })

    const estrela = buildAccess({ plan: 'estrela', plan_until: '2026-11-01T00:00:00Z' }, [], [
      { source: 'welcome', access_key: 'x', created_at: '2026-01-01T00:00:00Z' },
      { source: 'plan', access_key: 'a', created_at: '2026-09-30T23:00:00Z' }, // last month: doesn't count
      { source: 'plan', access_key: 'b', created_at: '2026-10-02T00:00:00Z' },
      { source: 'plan', access_key: 'c', created_at: '2026-10-03T00:00:00Z' },
    ], now)
    expect(estrela.planUsedThisMonth).toBe(2)
    expect(analysisAllowance(estrela, 'natal:zzzz', now)).toMatchObject({ ok: true, source: 'plan', left: 0 })
    expect(unlocked(estrela, 'sinastria:a+b', now)).toBe(true)
    const expired = { ...estrela, planUntil: '2026-10-01T00:00:00Z' }
    expect(unlocked(expired, 'sinastria:a+b', now)).toBe(false)
  })

  it('expired purchases stop unlocking', () => {
    const a = buildAccess(null, [{ grants: ['previsao:abcd'], expires_at: '2026-10-01T00:00:00Z' }], [], now)
    expect(unlocked(a, 'previsao:abcd', now)).toBe(false)
    expect(unlocked(EMPTY_ACCESS, 'previsao:abcd', now)).toBe(false)
  })

  it('renewing the same plan adds time; switching starts now', () => {
    const until = '2026-10-20T12:00:00.000Z'
    expect(extendPlan({ plan: 'estrela', planUntil: until }, 'estrela', 30, now)).toBe('2026-11-19T12:00:00.000Z')
    expect(extendPlan({ plan: 'estrela', planUntil: until }, 'cosmos', 30, now)).toBe('2026-11-14T12:00:00.000Z')
    expect(extendPlan({ plan: null, planUntil: null }, 'cosmos', 365, now)).toBe('2027-10-15T12:00:00.000Z')
  })

  it('checks the amount paid', () => {
    expect(paidEnough('estrela_mensal', 29.9)).toBe(true)
    expect(paidEnough('cosmos_anual', 39.9)).toBe(false)
  })
})
