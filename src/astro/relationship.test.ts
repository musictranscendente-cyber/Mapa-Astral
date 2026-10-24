import { describe, expect, it } from 'vitest'
import { chartFromBirth } from './chart'
import { angDiff } from './constants'
import { compositeChart, davisonChart, midpoint } from './relationship'

describe('mapa composto e Davison', () => {
  const a = chartFromBirth({ name: 'A', local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 }, timeZone: 'America/Sao_Paulo', latitude: -23.55, longitude: -46.63, place: 'SP' })
  const b = chartFromBirth({ name: 'B', local: { year: 1988, month: 2, day: 3, hour: 20, minute: 10 }, timeZone: 'America/Sao_Paulo', latitude: -22.9, longitude: -43.2, place: 'RJ' })
  it('midpoint uses the shorter arc', () => {
    expect(midpoint(350, 10)).toBeCloseTo(0, 6)
    expect(midpoint(10, 350)).toBeCloseTo(0, 6)
    expect(midpoint(100, 200)).toBeCloseTo(150, 6)
  })
  it('composite planets sit at the midpoints and the MC at the midpoint of the MCs', () => {
    const c = compositeChart(a, b, 'placidus')
    expect(Math.abs(angDiff(c.points.sun.lon, midpoint(a.points.sun.lon, b.points.sun.lon)))).toBeLessThan(1e-9)
    expect(Math.abs(angDiff(c.mc, midpoint(a.mc, b.mc)))).toBeLessThan(0.01)
    expect(Math.abs(angDiff(c.points.southNode.lon, c.points.node.lon))).toBeCloseTo(180, 6)
  })
  it('davison is a real chart at the mean time and place', () => {
    const d = davisonChart(a, b, 'placidus')
    expect(d.date.getTime()).toBe((a.date.getTime() + b.date.getTime()) / 2)
    expect(d.latitude).toBeCloseTo((-23.55 - 22.9) / 2, 6)
  })
})
