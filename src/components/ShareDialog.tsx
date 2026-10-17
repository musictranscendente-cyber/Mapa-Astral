import { useEffect, useRef, useState } from 'react'
import type { Chart } from '../astro/chart'
import { SHARE_SIZES, renderShareImage, shareUrl, type ShareFormat } from '../lib/shareImage'
import { track } from '../lib/analytics'

interface Props {
  chart: Chart
  onClose: () => void
}

/** Preview + share/download of the chart image for Instagram and WhatsApp. */
export function ShareDialog({ chart, onClose }: Props) {
  const [format, setFormat] = useState<ShareFormat>('story')
  const [showName, setShowName] = useState(true)
  const [image, setImage] = useState<{ blob: Blob; url: string; key: string } | null>(null)
  const [msg, setMsg] = useState('')
  const key = `${format}|${showName}`
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let cancelled = false
    let url = ''
    renderShareImage(chart, { format, showName }).then((blob) => {
      if (cancelled) return
      url = URL.createObjectURL(blob)
      setImage({ blob, url, key: `${format}|${showName}` })
    }, () => { if (!cancelled) setMsg('Não foi possível gerar a imagem neste aparelho.') })
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url) }
  }, [chart, format, showName])

  useEffect(() => {
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ready = image?.key === key ? image : null
  const link = shareUrl()
  const text = `Olha o meu mapa astral ✦ Faça o seu grátis: ${link}`
  const fileName = `mapa-astral-${(chart.birth?.name ?? 'meu').split(' ')[0].toLowerCase()}.png`
  const file = ready ? new File([ready.blob], fileName, { type: 'image/png' }) : null
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], text, title: 'Meu mapa astral' })
      track('compartilhar', format)
    } catch { /* cancelled */ }
  }

  const download = () => {
    if (!ready) return
    const a = document.createElement('a')
    a.href = ready.url
    a.download = fileName
    a.click()
    track('compartilhar', `${format}-download`)
    setMsg('Imagem salva! Agora é só postar no Instagram ou no status do WhatsApp.')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setMsg('Link copiado ✓')
    } catch {
      setMsg(link)
    }
  }

  return (
    <div className="share-backdrop" role="dialog" aria-modal="true" aria-label="Compartilhar meu mapa" onClick={onClose}>
      <div className="share-dialog glass" onClick={(e) => e.stopPropagation()}>
        <div className="share-head">
          <h2>✦ Compartilhar meu mapa</h2>
          <button ref={closeBtn} className="icon-btn" aria-label="Fechar" onClick={onClose}>✕</button>
        </div>

        <div className="share-options">
          <div className="segmented small left">
            {(Object.keys(SHARE_SIZES) as ShareFormat[]).map((f) => (
              <button key={f} className={format === f ? 'active' : ''} onClick={() => setFormat(f)}>{SHARE_SIZES[f].label}</button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
            <span>Mostrar meu nome</span>
          </label>
        </div>

        <div className={`share-preview ${format}`}>
          {ready ? <img src={ready.url} alt="Prévia da imagem do seu mapa astral" /> : <div className="loader"><span /> Desenhando seu céu…</div>}
        </div>

        <div className="share-actions">
          {canShareFile && <button className="cta" onClick={share}><span>Compartilhar imagem</span></button>}
          <button className={canShareFile ? 'ghost' : 'cta'} disabled={!ready} onClick={download}>
            {canShareFile ? '⤓ Salvar imagem' : <span>⤓ Salvar imagem</span>}
          </button>
          <a className="ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" onClick={() => track('compartilhar', 'whatsapp-link')}>
            Enviar link no WhatsApp
          </a>
          <button className="ghost" onClick={copy}>Copiar link</button>
        </div>
        {msg && <p className="muted small center">{msg}</p>}
        <p className="muted small center">A imagem mostra só o nome, o mapa e os signos — nunca a data, a hora ou o local de nascimento.</p>
      </div>
    </div>
  )
}
