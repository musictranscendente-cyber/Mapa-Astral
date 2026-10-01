import { computeChart, type Chart } from './chart'
import { angDiff } from './constants'
import { bodyLongitude, toTime } from './ephemeris'
import type { HouseSystem } from './houses'

/**
 * Exact instant (UTC) when the Sun returns to its natal longitude in `year`.
 * Newton iteration on the apparent solar longitude; converges to < 1 s.
 */
export function solarReturnDate(natal: Chart, year: number): Date {
  const birth = natal.date
  let t = new Date(Date.UTC(year, birth.getUTCMonth(), birth.getUTCDate(), birth.getUTCHours(), birth.getUTCMinutes()))
  const target = natal.points.sun.lon
  for (let i = 0; i < 20; i++) {
    const lon = bodyLongitude('sun', toTime(t))
    const diff = angDiff(lon, target) // degrees still to travel
    const step = (diff / 0.9856) * 86400000
    t = new Date(t.getTime() + step)
    if (Math.abs(diff) < 1e-6) break
  }
  return t
}

export function solarReturnChart(
  natal: Chart,
  year: number,
  where: { latitude: number; longitude: number },
  houseSystem: HouseSystem = 'placidus',
): Chart {
  const date = solarReturnDate(natal, year)
  return computeChart(date, where.latitude, where.longitude, houseSystem)
}

/** Year of the solar return currently in force (the last birthday that has passed). */
export function currentReturnYear(natal: Chart, now = new Date()): number {
  const y = now.getUTCFullYear()
  return solarReturnDate(natal, y) <= now ? y : y - 1
}
