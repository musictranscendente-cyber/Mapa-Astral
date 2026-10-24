import { CHART_PLANETS, chartFromPositions, computeChart, type Chart, type PlanetPosition } from './chart'
import { angDiff, norm360, type PlanetKey } from './constants'
import type { HouseSystem } from './houses'

const rad = Math.PI / 180

/** Midpoint along the shorter arc between two longitudes. */
export const midpoint = (a: number, b: number) => norm360(a + angDiff(a, b) / 2)

/** Geographic midpoint of two longitudes, in −180..180. */
const geoMid = (a: number, b: number) => {
  const m = midpoint(norm360(a), norm360(b))
  return m > 180 ? m - 360 : m
}

/**
 * Composite chart: every planet at the midpoint of the two natal positions; the MC is the
 * midpoint of the MCs and the other houses are derived from it at the mean latitude.
 */
export function compositeChart(a: Chart, b: Chart, houseSystem: HouseSystem): Chart {
  const planets = {} as Record<PlanetKey, PlanetPosition>
  for (const k of CHART_PLANETS) planets[k] = { lon: midpoint(a.points[k].lon, b.points[k].lon), lat: 0, speed: 1 }
  planets.southNode = { lon: norm360(planets.node.lon + 180), lat: 0, speed: 1 }
  const eps = (a.obliquity + b.obliquity) / 2
  const mc = midpoint(a.mc, b.mc)
  const ramc = norm360(Math.atan2(Math.sin(mc * rad) * Math.cos(eps * rad), Math.cos(mc * rad)) / rad)
  return chartFromPositions({
    date: new Date((a.date.getTime() + b.date.getTime()) / 2),
    latitude: (a.latitude + b.latitude) / 2,
    longitude: geoMid(a.longitude, b.longitude),
    houseSystem, planets, eps, ramc,
    hasHouses: a.hasHouses && b.hasHouses,
  })
}

/** Davison chart: a real sky for the midpoint in time and in space between the two births. */
export function davisonChart(a: Chart, b: Chart, houseSystem: HouseSystem): Chart {
  return computeChart(
    new Date((a.date.getTime() + b.date.getTime()) / 2),
    (a.latitude + b.latitude) / 2,
    geoMid(a.longitude, b.longitude),
    houseSystem,
    { hasHouses: a.hasHouses && b.hasHouses },
  )
}
