import { useMemo, useState } from 'react'
import type { Aspect, Chart } from '../astro/chart'
import { ELEMENT_INFO, POINTS, SIGNS, norm360, type PointKey } from '../astro/constants'
import type { TransitHit } from '../astro/transits'

const C = 400
const rad = Math.PI / 180

interface Props {
  chart: Chart
  /** Optional outer ring: transiting sky. */
  outer?: Chart
  outerHits?: TransitHit[]
  selected?: PointKey | null
  onSelect?: (k: PointKey | null) => void
  showAspects?: boolean
  size?: number | string
  spin?: boolean
}

const WHEEL_POINTS: PointKey[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'node', 'lilith', 'fortune',
]

const OUTER_POINTS: PointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node']

/** Spread labels apart so glyphs never overlap, keeping order. */
function spread(items: { key: PointKey; lon: number }[], minGap: number) {
  const sorted = [...items].sort((a, b) => a.lon - b.lon).map((p) => ({ ...p, pos: p.lon }))
  for (let iter = 0; iter < 60; iter++) {
    let moved = false
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i]
      const b = sorted[(i + 1) % sorted.length]
      if (sorted.length < 2) break
      const gap = norm360(b.pos - a.pos)
      if (gap < minGap && !(i === sorted.length - 1 && gap > 180)) {
        const push = (minGap - gap) / 2
        a.pos = norm360(a.pos - push)
        b.pos = norm360(b.pos + push)
        moved = true
      }
    }
    if (!moved) break
  }
  return sorted
}

export function ChartWheel({ chart, outer, outerHits, selected, onSelect, showAspects = true, size = '100%', spin = true }: Props) {
  const [hover, setHover] = useState<PointKey | null>(null)
  const focus = hover ?? selected ?? null
  const rotation = chart.hasHouses ? chart.asc : 0
  const bi = !!outer

  const R = bi
    ? { outer: 392, zIn: 348, tOuter: 348, tIn: 300, pRing: 300, glyph: 262, house: 150, aspect: 150 }
    : { outer: 390, zIn: 336, tOuter: 336, tIn: 336, pRing: 336, glyph: 292, house: 165, aspect: 165 }

  const ang = (lon: number) => (180 + lon - rotation) * rad
  const pt = (lon: number, r: number) => {
    const a = ang(lon)
    return [C + r * Math.cos(a), C - r * Math.sin(a)] as const
  }

  const natalItems = useMemo(
    () => WHEEL_POINTS.filter((k) => chart.hasHouses || k !== 'fortune').map((k) => ({ key: k, lon: chart.points[k].lon })),
    [chart],
  )
  const natalSpread = useMemo(() => spread(natalItems, bi ? 7.5 : 6.5), [natalItems, bi])
  const outerSpread = useMemo(
    () => (outer ? spread(OUTER_POINTS.map((k) => ({ key: k, lon: outer.points[k].lon })), 7) : []),
    [outer],
  )

  const aspects: Aspect[] = showAspects
    ? chart.aspects.filter((a) => a.a !== 'lilith' && a.b !== 'lilith' && (a.type.major || a.orb < 2))
    : []

  const involved = (a: { a: PointKey; b: PointKey }) => !focus || a.a === focus || a.b === focus

  return (
    <svg
      className={`wheel ${spin ? 'wheel-spin' : ''}`}
      viewBox="0 0 800 800"
      width={size}
      height={size}
      role="img"
      aria-label="Roda do mapa astral"
      onClick={() => onSelect?.(null)}
    >
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1b1446" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#0d0b2a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#060515" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="goldRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#ffe8a3" />
        </linearGradient>
      </defs>

      <circle cx={C} cy={C} r={R.outer} fill="url(#wheelBg)" stroke="url(#goldRing)" strokeWidth="2" />
      <circle cx={C} cy={C} r={R.aspect} fill="url(#coreGlow)" />

      {/* Zodiac band */}
      <g className="zodiac-band">
        {SIGNS.map((s) => {
          const a0 = s.id * 30, a1 = a0 + 30
          const [x0, y0] = pt(a0, R.outer)
          const [x1, y1] = pt(a1, R.outer)
          const [x2, y2] = pt(a1, R.zIn)
          const [x3, y3] = pt(a0, R.zIn)
          const color = ELEMENT_INFO[s.element].color
          const d = `M${x0},${y0} A${R.outer},${R.outer} 0 0 0 ${x1},${y1} L${x2},${y2} A${R.zIn},${R.zIn} 0 0 1 ${x3},${y3} Z`
          const [gx, gy] = pt(a0 + 15, (R.outer + R.zIn) / 2)
          return (
            <g key={s.id}>
              <path d={d} fill={color} fillOpacity={0.09} stroke="rgba(255,232,163,0.35)" strokeWidth="1" />
              <text x={gx} y={gy} className="sign-glyph" fill={color} fontSize={bi ? 24 : 28} textAnchor="middle" dominantBaseline="central" filter="url(#glow)">
                {s.glyph}
              </text>
            </g>
          )
        })}
        {Array.from({ length: 360 }, (_, i) => {
          const len = i % 10 === 0 ? 10 : i % 5 === 0 ? 7 : 3.5
          const [x0, y0] = pt(i, R.zIn)
          const [x1, y1] = pt(i, R.zIn - len)
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(255,232,163,0.45)" strokeWidth={i % 10 === 0 ? 1 : 0.6} />
        })}
      </g>

      {bi && <circle cx={C} cy={C} r={R.tIn} fill="none" stroke="rgba(110,240,224,0.35)" strokeWidth="1" />}

      {/* Houses */}
      {chart.hasHouses && (
        <g className="houses">
          <circle cx={C} cy={C} r={R.house} fill="none" stroke="rgba(255,255,255,0.18)" />
          {chart.cusps.map((c, i) => {
            const angular = i % 3 === 0
            const [x0, y0] = pt(c, R.house)
            const [x1, y1] = pt(c, bi ? R.pRing : R.zIn - 10)
            const next = chart.cusps[(i + 1) % 12]
            const mid = c + norm360(next - c) / 2
            const [nx, ny] = pt(mid, R.house + 14)
            return (
              <g key={i}>
                <line x1={x0} y1={y0} x2={x1} y2={y1}
                  stroke={angular ? '#ffe8a3' : 'rgba(255,255,255,0.22)'}
                  strokeWidth={angular ? 1.8 : 0.8} />
                <text x={nx} y={ny} className="house-num" fontSize="12" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
              </g>
            )
          })}
          {/* Axis labels */}
          {([['AC', chart.asc], ['MC', chart.mc], ['DC', chart.asc + 180], ['IC', chart.mc + 180]] as const).map(([lbl, lon]) => {
            const [x, y] = pt(lon, bi ? R.tIn - 12 : R.zIn - 22)
            return <text key={lbl} x={x} y={y} className="axis-label" fontSize="13" textAnchor="middle" dominantBaseline="central">{lbl}</text>
          })}
        </g>
      )}

      {/* Aspects */}
      <g className="aspects">
        {aspects.map((a, i) => {
          const [x0, y0] = pt(chart.points[a.a].lon, R.aspect)
          const [x1, y1] = pt(chart.points[a.b].lon, R.aspect)
          const on = involved(a)
          return (
            <line
              key={i}
              className="aspect-line"
              style={{ animationDelay: `${0.6 + i * 0.03}s` }}
              x1={x0} y1={y0} x2={x1} y2={y1}
              stroke={a.type.color}
              strokeWidth={on && focus ? 2.2 : 0.6 + a.exactness * 1.4}
              strokeOpacity={on ? 0.35 + a.exactness * 0.6 : 0.06}
              strokeDasharray={a.type.major ? undefined : '4 4'}
            />
          )
        })}
        {outer && outerHits?.filter((h) => !focus || h.natal === focus || h.transit === focus).slice(0, 14).map((h, i) => {
          const [x0, y0] = pt(h.transitLon, R.aspect)
          const [x1, y1] = pt(chart.points[h.natal].lon, R.aspect)
          return <line key={'t' + i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={h.type.color} strokeWidth={1.4} strokeOpacity={0.75} strokeDasharray="2 3" />
        })}
      </g>

      {/* Natal planets */}
      <g className="planets">
        {natalSpread.map((p, i) => {
          const info = POINTS[p.key]
          const real = chart.points[p.key]
          const [tx0, ty0] = pt(p.lon, R.pRing)
          const [tx1, ty1] = pt(p.lon, R.pRing - 9)
          const [lx, ly] = pt(p.pos, R.glyph + 18)
          const [gx, gy] = pt(p.pos, R.glyph)
          const [dx, dy] = pt(p.pos, R.glyph - 26)
          const [ax, ay] = pt(p.lon, R.aspect)
          const dim = focus && focus !== p.key && !chart.aspects.some((a) => (a.a === focus && a.b === p.key) || (a.b === focus && a.a === p.key))
          return (
            <g
              key={p.key}
              className={`planet ${dim ? 'dim' : ''} ${focus === p.key ? 'focus' : ''}`}
              style={{ animationDelay: `${0.25 + i * 0.05}s` }}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => { e.stopPropagation(); onSelect?.(p.key) }}
            >
              <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke={info.color} strokeWidth="2" />
              <line x1={tx1} y1={ty1} x2={lx} y2={ly} stroke={info.color} strokeOpacity="0.25" strokeWidth="0.8" />
              <circle cx={ax} cy={ay} r="3" fill={info.color} />
              <circle cx={gx} cy={gy} r="19" className="planet-halo" fill={info.color} fillOpacity="0.08" />
              <text x={gx} y={gy} className="planet-glyph" fill={info.color} fontSize={p.key === 'fortune' ? 20 : 26} textAnchor="middle" dominantBaseline="central" filter="url(#glow)">
                {info.glyph}
              </text>
              <text x={dx} y={dy} className="planet-deg" fontSize="12" textAnchor="middle" dominantBaseline="central">
                {Math.floor(norm360(real.lon) % 30)}°{real.retro ? '℞' : ''}
              </text>
              <title>{info.name}</title>
            </g>
          )
        })}
      </g>

      {/* Transit planets */}
      {outer && (
        <g className="planets outer">
          {outerSpread.map((p) => {
            const info = POINTS[p.key]
            const real = outer.points[p.key]
            const [tx0, ty0] = pt(p.lon, R.tIn)
            const [tx1, ty1] = pt(p.lon, R.tIn + 7)
            const [gx, gy] = pt(p.pos, (R.tIn + R.tOuter) / 2 + 2)
            return (
              <g key={p.key} className="planet" onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)}>
                <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="#6ef0e0" strokeWidth="2" />
                <text x={gx} y={gy} className="planet-glyph" fill="#6ef0e0" fontSize="18" textAnchor="middle" dominantBaseline="central">
                  {info.glyph}
                </text>
                <title>{`${info.name} em trânsito ${Math.floor(real.lon % 30)}° ${SIGNS[real.sign].name}${real.retro ? ' ℞' : ''}`}</title>
              </g>
            )
          })}
        </g>
      )}

      <circle cx={C} cy={C} r="4" fill="#ffe8a3" filter="url(#glow)" />
    </svg>
  )
}
