import { useId } from 'react'

/** Realistic moon disc for a given Sun–Moon elongation (0 = nova, 180 = cheia). */
export function MoonPhase({ angle, size = 160, south = false }: { angle: number; size?: number; south?: boolean }) {
  const id = useId().replace(/:/g, '')
  const R = 48
  const cx = 50, cy = 50
  const phi = (angle * Math.PI) / 180
  const waxing = angle < 180
  const rx = Math.abs(Math.cos(phi)) * R
  const gibbous = Math.cos(phi) < 0
  let d: string
  if (waxing) {
    d = `M${cx},${cy - R} A${R},${R} 0 0 1 ${cx},${cy + R} A${rx},${R} 0 0 ${gibbous ? 1 : 0} ${cx},${cy - R} Z`
  } else {
    d = `M${cx},${cy - R} A${R},${R} 0 0 0 ${cx},${cy + R} A${rx},${R} 0 0 ${gibbous ? 0 : 1} ${cx},${cy - R} Z`
  }
  const craters = [
    [38, 34, 7], [60, 30, 4], [62, 58, 9], [40, 64, 5], [52, 46, 3.5], [30, 50, 4], [70, 44, 3],
  ]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="moon-svg" style={south ? { transform: 'scaleX(-1)' } : undefined}>
      <defs>
        <radialGradient id={`lit${id}`} cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fffdf2" />
          <stop offset="60%" stopColor="#e9e4d4" />
          <stop offset="100%" stopColor="#b9b2a0" />
        </radialGradient>
        <radialGradient id={`halo${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#fff6d6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip${id}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={R + 2} fill={`url(#halo${id})`} opacity={0.3 + 0.7 * ((1 - Math.cos(phi)) / 2)} />
      <circle cx={cx} cy={cy} r={R} fill="#191a2e" />
      <circle cx={cx} cy={cy} r={R} fill="#2a2b45" opacity="0.5" />
      <g clipPath={`url(#clip${id})`}>
        <circle cx={cx} cy={cy} r={R} fill={`url(#lit${id})`} />
        {craters.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#a59f8c" opacity="0.35" />
        ))}
      </g>
    </svg>
  )
}
