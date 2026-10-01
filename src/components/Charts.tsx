import { useEffect, useRef, useState } from 'react'
import { ELEMENT_INFO, MODALITY_INFO, type Element, type Modality } from '../astro/constants'
import type { Balance } from '../astro/chart'
import { LIFE_AREAS, type DayScore, type LifeArea } from '../astro/transits'

const ELEMENT_ICON: Record<Element, string> = { fogo: '🜂', terra: '🜃', ar: '🜁', agua: '🜄' }

export function ElementBars({ balance }: { balance: Balance }) {
  const total = Object.values(balance.elements).reduce((a, b) => a + b, 0) || 1
  const mTotal = Object.values(balance.modalities).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="balance">
      <div className="meter-list">
        {(Object.keys(balance.elements) as Element[]).map((e) => {
          const pct = Math.round((balance.elements[e] / total) * 100)
          return (
            <div className="meter" key={e} title={`${ELEMENT_INFO[e].name}: ${pct}% — ${ELEMENT_INFO[e].essence}`}>
              <span className="meter-label"><span className="alch" style={{ color: ELEMENT_INFO[e].color }}>{ELEMENT_ICON[e]}</span>{ELEMENT_INFO[e].name}</span>
              <span className="meter-track">
                <span className="meter-fill" style={{ width: `${pct}%`, background: ELEMENT_INFO[e].color, boxShadow: `0 0 14px ${ELEMENT_INFO[e].glow}` }} />
              </span>
              <span className="meter-val">{pct}%</span>
            </div>
          )
        })}
      </div>
      <div className="modalities">
        {(Object.keys(balance.modalities) as Modality[]).map((m) => {
          const pct = Math.round((balance.modalities[m] / mTotal) * 100)
          return (
            <div className="modality" key={m} title={MODALITY_INFO[m].essence}>
              <svg viewBox="0 0 64 64" width="64" height="64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="26" fill="none" stroke="#ffe8a3" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 163.4} 163.4`} transform="rotate(-90 32 32)"
                />
                <text x="32" y="33" textAnchor="middle" dominantBaseline="central" className="ring-val">{pct}%</text>
              </svg>
              <span>{MODALITY_INFO[m].name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AreaMeters({ areas }: { areas: Record<LifeArea, number> }) {
  return (
    <div className="meter-list areas">
      {LIFE_AREAS.map((a) => {
        const v = areas[a.key]
        const label = v >= 70 ? 'favorável' : v >= 55 ? 'positivo' : v > 45 ? 'neutro' : v > 30 ? 'atenção' : 'desafiador'
        return (
          <div className="meter" key={a.key} title={`${a.name}: ${v}/100 (${label})`}>
            <span className="meter-label"><span className="area-icon" style={{ color: a.color }}>{a.icon}</span>{a.name}</span>
            <span className="meter-track">
              <span className="meter-mid" />
              <span className="meter-fill" style={{ width: `${v}%`, background: `linear-gradient(90deg, rgba(255,255,255,0.15), ${a.color})` }} />
            </span>
            <span className="meter-val">{v}<small> {label}</small></span>
          </div>
        )
      })}
    </div>
  )
}

/** Day-by-day flow (−100 tense … +100 harmonious), with crosshair tooltip. */
export function FlowChart({ days, selected, onSelect }: { days: DayScore[]; selected?: number; onSelect?: (i: number) => void }) {
  const H = 220, padL = 34, padR = 12, padT = 16, padB = 28
  const [hover, setHover] = useState<number | null>(null)
  const [W, setW] = useState(760)
  const ref = useRef<SVGSVGElement>(null)
  // Draw in real pixels so labels never stretch on narrow screens.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const n = days.length
  const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (W - padL - padR))
  const y = (v: number) => padT + ((100 - v) / 200) * (H - padT - padB)
  const path = days.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.flow).toFixed(1)}`).join('')
  const area = `${path}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const step = Math.max(1, Math.ceil(n / Math.max(3, Math.floor(W / 95))))

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }
  const h = hover ?? selected ?? null
  return (
    <div className="flow-chart">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={() => hover != null && onSelect?.(hover)}
        role="img"
        aria-label="Fluxo energético por dia"
      >
        <defs>
          <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {[100, 50, 0, -50, -100].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.07)" strokeWidth={v === 0 ? 1.2 : 1} />
            <text x={padL - 6} y={y(v)} className="axis-txt" textAnchor="end" dominantBaseline="central">{v > 0 ? '+' + v : v}</text>
          </g>
        ))}
        <path d={area} fill="url(#flowFill)" />
        <path d={path} fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinejoin="round" className="flow-line" />
        {days.map((d, i) => (i % step === 0 ? (
          <text key={i} x={x(i)} y={H - 8} className="axis-txt" textAnchor="middle">{fmt(d.date)}</text>
        ) : null))}
        {h != null && days[h] && (
          <g>
            <line x1={x(h)} x2={x(h)} y1={padT} y2={H - padB} stroke="rgba(255,232,163,0.6)" strokeWidth="1" />
            <circle cx={x(h)} cy={y(days[h].flow)} r="5" fill="#ffe8a3" stroke="#0d0b2a" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h != null && days[h] && (
        <div className="chart-tip" style={{ left: `${Math.min(85, Math.max(15, (x(h) / W) * 100))}%` }}>
          <strong>{days[h].date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong>
          <span>Fluxo {days[h].flow > 0 ? '+' : ''}{days[h].flow}</span>
          <span>Intensidade {days[h].intensity}</span>
        </div>
      )}
      <div className="chart-note">Acima de 0: dias de fluxo e harmonia · abaixo de 0: dias de tensão e desafio</div>
    </div>
  )
}
