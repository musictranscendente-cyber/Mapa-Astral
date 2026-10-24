import { useEffect, useState } from 'react'
import type { BirthData } from '../astro/chart'
import { ELEMENT_INFO, SIGNS } from '../astro/constants'
import { quickSintonia, type QuickPerson } from '../astro/sintonia'
import { SYN_AREAS } from '../astro/synastry'
import { synSummary } from '../interpret/synastry'
import { track } from '../lib/analytics'
import { renderSintoniaImage, sintoniaUrl } from '../lib/sintoniaImage'
import type { Route } from '../App'

type Result = ReturnType<typeof quickSintonia> & { a: QuickPerson; b: QuickPerson }

export function SintoniaPage({ go, onSave }: { go: (r: Route) => void; onSave: (d: BirthData) => string }) {
  const [a, setA] = useState<QuickPerson>({ name: '', date: '' })
  const [b, setB] = useState<QuickPerson>({ name: '', date: '' })
  const [result, setResult] = useState<Result | null>(null)
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!result) return
    let url = ''
    let cancelled = false
    renderSintoniaImage({ name: result.a.name, chart: result.ca }, { name: result.b.name, chart: result.cb }, result.score).then((blob) => {
      if (cancelled) return
      url = URL.createObjectURL(blob)
      setImage({ blob, url })
    }, () => {})
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url) }
  }, [result])

  const ok = a.name.trim() && b.name.trim() && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && /^\d{4}-\d{2}-\d{2}$/.test(b.date)
  const run = () => {
    if (!ok) return
    const pa = { name: a.name.trim().split(' ')[0], date: a.date }
    const pb = { name: b.name.trim().split(' ')[0], date: b.date }
    setImage(null)
    setMsg('')
    setResult({ ...quickSintonia(pa, pb), a: pa, b: pb })
    track('mapa', 'sintonia')
  }
  const text = `Fizemos o teste de sintonia do Cosmic Sky ✦ Faça o seu: ${sintoniaUrl()}`
  const file = image ? new File([image.blob], 'nossa-sintonia.png', { type: 'image/png' }) : null
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
  const share = async () => {
    if (!file) return
    try { await navigator.share({ files: [file], text }); track('compartilhar', 'sintonia') } catch { /* cancelled */ }
  }
  const download = () => {
    if (!image) return
    const el = document.createElement('a')
    el.href = image.url
    el.download = 'nossa-sintonia.png'
    el.click()
    track('compartilhar', 'sintonia-download')
    setMsg('Imagem salva! Poste nos Stories ou no status do WhatsApp.')
  }
  const saveBoth = () => {
    if (!result) return
    const toBirth = (p: QuickPerson): BirthData => {
      const [year, month, day] = p.date.split('-').map(Number)
      return { name: p.name, local: { year, month, day, hour: 12, minute: 0 }, timeZone: 'America/Sao_Paulo', latitude: -15.79, longitude: -47.88, place: 'Brasil (hora desconhecida)', timeUnknown: true }
    }
    if (onSave(toBirth(result.a)) && onSave(toBirth(result.b))) go('sinastria')
  }

  const sum = result ? synSummary(result.score.total) : null
  return (
    <div className="sintonia">
      <header className="page-head">
        <p className="eyebrow">Teste rápido</p>
        <h1 className="title-glow">Qual é a nossa sintonia?</h1>
        <p className="muted">Só com a data de nascimento de duas pessoas. Grátis, na hora — e com imagem para compartilhar.</p>
      </header>

      <form className="glass pad sint-form" onSubmit={(e) => { e.preventDefault(); run() }}>
        {[[a, setA, 'Você'], [b, setB, 'A outra pessoa']].map(([p, set, label], i) => (
          <fieldset key={i}>
            <legend className="eyebrow">{label as string}</legend>
            <label className="field"><span>Nome</span>
              <input id={`sint-name-${i}`} value={(p as QuickPerson).name} onChange={(e) => (set as (x: QuickPerson) => void)({ ...(p as QuickPerson), name: e.target.value })} placeholder="Primeiro nome" maxLength={24} required />
            </label>
            <label className="field"><span>Data de nascimento</span>
              <input id={`sint-date-${i}`} type="date" value={(p as QuickPerson).date} min="1900-01-01" max="2100-12-31" onChange={(e) => (set as (x: QuickPerson) => void)({ ...(p as QuickPerson), date: e.target.value })} required />
            </label>
          </fieldset>
        ))}
        <button className="cta" type="submit" disabled={!ok}><span>♡ Descobrir nossa sintonia</span></button>
      </form>

      {result && sum && (
        <section className="glass pad sint-result">
          <div className="sint-people">
            {[result.ca, result.cb].map((c, i) => {
              const s = SIGNS[c.points.sun.sign]
              return (
                <div key={i}>
                  <span className="sign-glyph" style={{ color: ELEMENT_INFO[s.element].color }}>{s.glyph}</span>
                  <strong>{i === 0 ? result.a.name : result.b.name}</strong>
                  <small className="muted">{s.name}</small>
                </div>
              )
            })}
            <div className="energy-orb big" style={{ ['--flow' as string]: result.score.total / 100 }}><span>{result.score.total}%</span></div>
          </div>
          <h2>{sum.title}</h2>
          <p>{sum.text}</p>
          <div className="meter-list areas">
            {SYN_AREAS.map((ar) => (
              <div className="meter" key={ar.key}>
                <span className="meter-label"><span className="area-icon" style={{ color: ar.color }}>{ar.icon}</span>{ar.name}</span>
                <span className="meter-track"><span className="meter-mid" /><span className="meter-fill" style={{ width: `${result.score.areas[ar.key]}%`, background: `linear-gradient(90deg, rgba(255,255,255,0.15), ${ar.color})` }} /></span>
                <span className="meter-val">{result.score.areas[ar.key]}</span>
              </div>
            ))}
          </div>
          <div className="share-actions">
            {canShare && <button className="cta" onClick={share}><span>Compartilhar nos Stories</span></button>}
            <button className={canShare ? 'ghost' : 'cta'} disabled={!image} onClick={download}>{canShare ? '⤓ Salvar imagem' : <span>⤓ Salvar imagem</span>}</button>
            <a className="ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" onClick={() => track('compartilhar', 'sintonia-whatsapp')}>Enviar no WhatsApp</a>
          </div>
          {msg && <p className="muted small center">{msg}</p>}
          {image && <img className="sint-preview" src={image.url} width={1080} height={1920} alt="Imagem da sintonia para compartilhar" />}
          <div className="center">
            <p className="muted small">Este é um teste rápido só com as datas. Com hora e local de nascimento, a sinastria completa mostra muito mais.</p>
            <button className="ghost" onClick={saveBoth}>♡ Salvar os dois e ver a sinastria completa</button>
          </div>
        </section>
      )}
    </div>
  )
}
