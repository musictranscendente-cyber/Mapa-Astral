import { computeChart, type Chart } from './chart'
import { angDiff, norm360 } from './constants'
import { bodyLongitude, bodySpeed, toTime } from './ephemeris'
import type { HouseSystem } from './houses'

const DAY = 86400000

/** First instant after `after` when the Moon returns to its natal longitude (Newton, < 1 s). */
export function lunarReturnAfter(natal: Chart, after: Date): Date {
  const target = natal.points.moon.lon
  const ahead = norm360(target - bodyLongitude('moon', toTime(after)))
  let t = new Date(after.getTime() + (ahead / 13.176) * DAY)
  for (let i = 0; i < 12; i++) {
    const tt = toTime(t)
    const diff = angDiff(bodyLongitude('moon', tt), target)
    t = new Date(t.getTime() + (diff / bodySpeed('moon', tt)) * DAY)
    if (Math.abs(diff) < 1e-6) break
  }
  return t
}

/** The lunar return in force at `now` (the last one that has happened). */
export function currentLunarReturn(natal: Chart, now = new Date()): Date {
  let r = lunarReturnAfter(natal, new Date(now.getTime() - 30 * DAY))
  for (let next = lunarReturnAfter(natal, new Date(r.getTime() + DAY)); next <= now; next = lunarReturnAfter(natal, new Date(next.getTime() + DAY))) r = next
  return r
}

export const nextLunarReturn = (natal: Chart, from: Date) => lunarReturnAfter(natal, new Date(from.getTime() + DAY))
export const previousLunarReturn = (natal: Chart, from: Date) => lunarReturnAfter(natal, new Date(from.getTime() - 29 * DAY))

export function lunarReturnChart(date: Date, where: { latitude: number; longitude: number }, houseSystem: HouseSystem = 'placidus'): Chart {
  return computeChart(date, where.latitude, where.longitude, houseSystem)
}
