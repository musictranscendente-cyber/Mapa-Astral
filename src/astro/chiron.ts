import * as A from 'astronomy-engine'
import { CHIRON_TABLE } from './chironData'
import { norm360 } from './constants'

/**
 * Chiron (2060) from a heliocentric table taken from the Swiss Ephemeris (1800–2100),
 * combined with the Earth from astronomy-engine: light-time, annual aberration and
 * rotation to the true ecliptic of date, like the other bodies.
 */

const J2000_JD = 2451545.0
const AU_PER_DAY_C = 173.1446326846693 // speed of light in AU/day

let table: Float64Array | null = null
function samples(): Float64Array {
  if (table) return table
  const bin = atob(CHIRON_TABLE.data)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const ints = new Int32Array(bytes.buffer)
  table = Float64Array.from(ints, (v) => v / 1e7)
  return table
}

/** Heliocentric J2000 equatorial position (AU) at a Julian Day (TT), 4-point Lagrange interpolation. */
function helio(jdTT: number): [number, number, number] {
  const s = samples()
  const { startJd, step, count } = CHIRON_TABLE
  const f = (jdTT - startJd) / step
  const i0 = Math.min(Math.max(Math.floor(f) - 1, 0), count - 4)
  const u = f - i0 // position within the 4 nodes i0..i0+3 (≈1..2 inside the range)
  const w = [
    (-(u - 1) * (u - 2) * (u - 3)) / 6,
    (u * (u - 2) * (u - 3)) / 2,
    (-u * (u - 1) * (u - 3)) / 2,
    (u * (u - 1) * (u - 2)) / 6,
  ]
  const out: [number, number, number] = [0, 0, 0]
  for (let k = 0; k < 4; k++) {
    const base = (i0 + k) * 3
    out[0] += w[k] * s[base]
    out[1] += w[k] * s[base + 1]
    out[2] += w[k] * s[base + 2]
  }
  return out
}

/** Dates the table covers (others are extrapolated and lose accuracy). */
export const CHIRON_RANGE = {
  from: new Date((CHIRON_TABLE.startJd - 2440587.5) * 86400000),
  to: new Date((CHIRON_TABLE.startJd + CHIRON_TABLE.step * (CHIRON_TABLE.count - 1) - 2440587.5) * 86400000),
}

/** Apparent geocentric ecliptic longitude/latitude of Chiron (true equinox and ecliptic of date). */
export function chironEcliptic(t: A.AstroTime): { lon: number; lat: number } {
  const earth = A.HelioState(A.Body.Earth, t)
  const jd = t.tt + J2000_JD
  let gx = 0, gy = 0, gz = 0
  let tau = 0
  for (let iter = 0; iter < 3; iter++) {
    const [x, y, z] = helio(jd - tau)
    gx = x - earth.x
    gy = y - earth.y
    gz = z - earth.z
    tau = Math.hypot(gx, gy, gz) / AU_PER_DAY_C
  }
  // Annual aberration: shift by the Earth's velocity times the light-time.
  gx += earth.vx * tau
  gy += earth.vy * tau
  gz += earth.vz * tau
  const ect = A.RotateVector(A.Rotation_EQJ_ECT(t), new A.Vector(gx, gy, gz, t))
  const lon = norm360(Math.atan2(ect.y, ect.x) * (180 / Math.PI))
  const lat = Math.atan2(ect.z, Math.hypot(ect.x, ect.y)) * (180 / Math.PI)
  return { lon, lat }
}
