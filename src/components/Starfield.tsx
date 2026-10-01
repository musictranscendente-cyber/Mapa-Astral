import { useEffect, useRef } from 'react'

interface Star { x: number; y: number; z: number; r: number; tw: number; hue: number }
interface Meteor { x: number; y: number; vx: number; vy: number; life: number }

/** Full-screen animated cosmos: parallax stars, twinkling, shooting stars. */
export function Starfield({ motion = true }: { motion?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduced = !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1
    let stars: Star[] = []
    const meteors: Meteor[] = []
    let mx = 0, my = 0, tx = 0, ty = 0
    let raf = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((w * h) / 2600)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() ** 2,
        r: Math.random() * 1.3 + 0.2,
        tw: Math.random() * Math.PI * 2,
        hue: [220, 260, 45, 190, 300][Math.floor(Math.random() * 5)],
      }))
    }

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / w - 0.5) * 2
      ty = (e.clientY / h - 0.5) * 2
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h)
      mx += (tx - mx) * 0.04
      my += (ty - my) * 0.04
      const scroll = window.scrollY * 0.05
      for (const s of stars) {
        const depth = 0.2 + s.z * 1.8
        let x = s.x - mx * depth * 12
        let y = s.y - my * depth * 12 - scroll * depth
        y = ((y % h) + h) % h
        x = ((x % w) + w) % w
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(time * 0.0015 * (0.4 + s.z) + s.tw)
        const r = s.r * (0.6 + s.z)
        ctx.beginPath()
        ctx.fillStyle = `hsla(${s.hue}, 80%, ${80 + s.z * 15}%, ${tw * (0.35 + s.z * 0.65)})`
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        if (s.z > 0.82) {
          ctx.fillStyle = `hsla(${s.hue}, 90%, 85%, ${tw * 0.12})`
          ctx.beginPath()
          ctx.arc(x, y, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (!reduced && Math.random() < 0.004 && meteors.length < 2) {
        meteors.push({ x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, vx: -6 - Math.random() * 4, vy: 2.5 + Math.random() * 2, life: 1 })
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14)
        grad.addColorStop(0, `rgba(255,255,255,${m.life})`)
        grad.addColorStop(1, 'rgba(160,140,255,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14)
        ctx.stroke()
        m.x += m.vx
        m.y += m.vy
        m.life -= 0.012
        if (m.life <= 0) meteors.splice(i, 1)
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [motion])

  return (
    <div className="cosmos" aria-hidden>
      <div className="nebula n1" />
      <div className="nebula n2" />
      <div className="nebula n3" />
      <canvas ref={ref} />
    </div>
  )
}
