import { useEffect, useState } from 'react'
import { fetchStats, type AppStats, type DayStat } from '../lib/analytics'

const RANGES = [7, 30, 90]

/** Fill days without events so the chart shows real gaps. */
function fillDays(daily: DayStat[], days: number): DayStat[] {
  const byDay = new Map(daily.map((d) => [d.day, d]))
  const out: DayStat[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push(byDay.get(key) ?? { day: key, visitantes: 0, mapas: 0, compartilhamentos: 0 })
  }
  return out
}

const fmtDay = (key: string, o: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) =>
  new Date(`${key}T12:00:00`).toLocaleDateString('pt-BR', o)

/** Owner-only: visitors per day, charts created, shares and where people come from. */
export function StatsCard() {
  const [days, setDays] = useState(30)
  const [result, setResult] = useState<{ days: number; stats?: AppStats; error?: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchStats(days).then(
      (stats) => { if (!cancelled) setResult({ days, stats }) },
      (e) => { if (!cancelled) setResult({ days, error: e instanceof Error ? e.message : String(e) }) },
    )
    return () => { cancelled = true }
  }, [days])

  const loading = !result || result.days !== days
  const stats = !loading ? result.stats : undefined
  const error = !loading ? result.error : undefined

  return (
    <section className="glass pad settings-card stats-card">
      <div className="section-title">
        <h2>📈 Acessos do app</h2>
        <span className="sim-badge">Só você vê</span>
      </div>
      <div className="segmented small left">
        {RANGES.map((d) => <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>{d} dias</button>)}
      </div>

      {loading && <div className="loader small"><span /></div>}
      {error && (
        <p className="warn small">
          Ainda não há contagem no servidor. No Supabase, abra o <b>SQL Editor</b>, cole o arquivo
          {' '}<code>supabase/migrations/0003_acessos.sql</code> e clique em <b>Run</b>.
        </p>
      )}
      {stats && <StatsBody stats={stats} days={days} />}
    </section>
  )
}

function StatsBody({ stats, days }: { stats: AppStats; days: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const series = fillDays(stats.daily, days)
  const max = Math.max(1, ...series.map((d) => d.visitantes))
  const t = stats.totals
  const tiles: [string, number, string][] = [
    ['Visitantes', t.visitantes, `aparelhos diferentes em ${days} dias`],
    ['Visitas', t.visitas, 'dias com acesso, somados'],
    ['Mapas criados', t.mapas, `nos últimos ${days} dias`],
    ['Compartilhados', t.compartilhamentos, 'imagens e links'],
    ['Contas', t.contas, 'cadastros no total'],
  ]
  const shown = hover !== null ? series[hover] : series[series.length - 1]
  const W = 600
  const H = 160
  const pad = { l: 28, r: 6, t: 12, b: 22 }
  const bw = (W - pad.l - pad.r) / series.length
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max)
  const ticks = [0, Math.round(max / 2), max].filter((v, i, a) => a.indexOf(v) === i)
  const labelEvery = Math.ceil(series.length / 6)

  return (
    <>
      <div className="stat-tiles">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="stat-tile">
            <span className="stat-value">{value.toLocaleString('pt-BR')}</span>
            <span className="stat-label">{label}</span>
            <small className="muted">{hint}</small>
          </div>
        ))}
      </div>

      <p className="eyebrow">Visitantes por dia</p>
      <p className="muted small stat-readout">
        {fmtDay(shown.day, { weekday: 'short', day: '2-digit', month: 'short' })}: <b>{shown.visitantes}</b> visitantes · {shown.mapas} mapas · {shown.compartilhamentos} compartilhamentos
      </p>
      <div className="stat-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Visitantes por dia nos últimos ${days} dias, máximo de ${max}`} onMouseLeave={() => setHover(null)}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stat-grid" />
              <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" className="stat-axis">{v}</text>
            </g>
          ))}
          {series.map((d, i) => {
            const x = pad.l + i * bw
            const h = (H - pad.t - pad.b) * (d.visitantes / max)
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
                <rect x={x} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
                {d.visitantes > 0 && (
                  <path
                    className={`stat-bar ${hover === i ? 'on' : ''}`}
                    d={roundedTop(x + 1, H - pad.b - h, Math.max(1, bw - 2), h, Math.min(4, (bw - 2) / 2, h))}
                  />
                )}
                {i % labelEvery === 0 && <text x={x + bw / 2} y={H - 6} textAnchor="middle" className="stat-axis">{fmtDay(d.day)}</text>}
              </g>
            )
          })}
        </svg>
      </div>

      {stats.sources.length > 0 && (
        <>
          <p className="eyebrow">De onde vêm as visitas</p>
          <ul className="purchase-list">
            {stats.sources.map((s) => (
              <li key={s.origem}><span>{SOURCE_LABEL[s.origem] ?? s.origem}</span><small className="muted">{s.visitas}</small></li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

const SOURCE_LABEL: Record<string, string> = {
  direto: 'Acesso direto / app instalado',
  compartilhar: 'Imagem ou link compartilhado ✦',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  google: 'Google',
}

/** Bar with 4px rounded top corners, flat on the baseline. */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}
