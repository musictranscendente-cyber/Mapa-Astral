import { ELEMENT_INFO, POINTS, SIGNS } from '../astro/constants'

/** Decorative rotating zodiac mandala for the hero. */
export function ZodiacHalo() {
  const C = 300
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const
  return (
    <div className="halo-wrap" aria-hidden>
      <svg viewBox="0 0 600 600" className="halo">
        <defs>
          <radialGradient id="haloCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe8a3" stopOpacity="0.55" />
            <stop offset="25%" stopColor="#c084fc" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="290" fill="url(#haloCore)" />
        <g className="halo-ring r1">
          <circle cx={C} cy={C} r="270" fill="none" stroke="rgba(255,232,163,0.45)" strokeWidth="1" />
          <circle cx={C} cy={C} r="225" fill="none" stroke="rgba(255,232,163,0.3)" strokeWidth="1" />
          {SIGNS.map((s, i) => {
            const a = ((i * 30 + 15) * Math.PI) / 180
            const a0 = (i * 30 * Math.PI) / 180
            return (
              <g key={s.id}>
                <line x1={C + 225 * Math.cos(a0)} y1={C + 225 * Math.sin(a0)} x2={C + 270 * Math.cos(a0)} y2={C + 270 * Math.sin(a0)} stroke="rgba(255,232,163,0.35)" />
                <text x={C + 247 * Math.cos(a)} y={C + 247 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="24" fill={ELEMENT_INFO[s.element].color} className="sign-glyph">
                  {s.glyph}
                </text>
              </g>
            )
          })}
        </g>
        <g className="halo-ring r2">
          <circle cx={C} cy={C} r="180" fill="none" stroke="rgba(192,132,252,0.35)" strokeDasharray="2 6" />
          {planets.map((k, i) => {
            const a = ((i / planets.length) * 360 * Math.PI) / 180
            return (
              <text key={k} x={C + 180 * Math.cos(a)} y={C + 180 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="20" fill={POINTS[k].color} className="planet-glyph">
                {POINTS[k].glyph}
              </text>
            )
          })}
        </g>
        <g className="halo-ring r3">
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * 60 * Math.PI) / 180
            const b = ((i * 60 + 120) * Math.PI) / 180
            return <line key={i} x1={C + 130 * Math.cos(a)} y1={C + 130 * Math.sin(a)} x2={C + 130 * Math.cos(b)} y2={C + 130 * Math.sin(b)} stroke="rgba(255,232,163,0.25)" />
          })}
          <circle cx={C} cy={C} r="130" fill="none" stroke="rgba(255,232,163,0.25)" />
        </g>
        <circle cx={C} cy={C} r="38" fill="#ffe8a3" opacity="0.9" className="halo-sun" />
      </svg>
    </div>
  )
}
