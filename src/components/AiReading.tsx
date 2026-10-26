import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AiError, aiAvailable } from '../ai/config'
import { READING_TITLES, type ReadingKind } from '../ai/prompts'
import { useAccess, type Offer } from '../billing/context'
import type { Allowance } from '../billing/rules'
import { Locked } from './Locked'
import type { Route } from '../App'

interface Props {
  kind: ReadingKind
  /** Who the analysis is about — shown on the PDF. */
  subject: string
  /** Lazily built so heavy summaries are only computed on demand. */
  getSummary: () => string
  /** Stable id of what is being read (profile + options) — used to cache the result. */
  cacheKey: string
  /** What is being analysed, for plan/purchase accounting (billing/rules keys). */
  accessKey: string
  /** Single purchase that unlocks this analysis. */
  offer?: Offer
  go: (r: Route) => void
}

const CACHE_PREFIX = 'mapa-astral:ai:'

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

const readCache = (k: string) => { try { return localStorage.getItem(CACHE_PREFIX + k) } catch { return null } }
const writeCache = (k: string, v: string) => { try { localStorage.setItem(CACHE_PREFIX + k, v) } catch { /* full */ } }

export function AiReading(props: Props) {
  const key = `${props.kind}:${hash(props.cacheKey)}`
  // Remount per reading so cached text and status always match what is shown.
  return <AiReadingInner key={key} storageKey={key} {...props} />
}

function AiReadingInner({ kind, subject, getSummary, accessKey, offer, go, storageKey: key }: Props & { storageKey: string }) {
  const access = useAccess()
  const allowance = access.allowance(accessKey)
  const [text, setText] = useState<string>(() => readCache(key) ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(() => (readCache(key) ? 'done' : 'idle'))
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  useEffect(() => () => abort.current?.abort(), [])

  const run = async () => {
    abort.current?.abort()
    const ctl = new AbortController()
    abort.current = ctl
    setText('')
    setError('')
    setStatus('loading')
    try {
      let acc = ''
      // The SDK is loaded only when a reading is requested.
      const { generateReading } = await import('../ai/client')
      const full = await generateReading({
        kind,
        summary: getSummary(),
        accessKey,
        simulated: access.simulated,
        signal: ctl.signal,
        onText: (d) => { acc += d; setText(acc) },
      })
      writeCache(key, full || acc)
      setStatus('done')
      if (access.simulated && allowance.source) access.recordUse(kind, accessKey, allowance.source)
      access.refresh()
    } catch (e) {
      if (ctl.signal.aborted) return
      access.refresh()
      setError(e instanceof AiError ? e.message : 'Não foi possível gerar a análise agora.')
      setStatus('error')
    }
  }

  const available = access.enabled || aiAvailable()
  const canRun = !access.enabled || (allowance.ok && !access.loading)

  return (
    <section className="glass ai-reading">
      <div className="section-title">
        <h2><span className="ai-spark">✦</span> {READING_TITLES[kind]}</h2>
        {status === 'done' && canRun && <button className="ghost" onClick={run}>↻ Gerar nova versão</button>}
      </div>
      {status === 'idle' && access.enabled && !canRun && (
        <Locked
          title={access.loggedIn ? 'Libere esta análise completa' : 'Entre para receber sua análise completa'}
          text={access.loggedIn
            ? 'Você já usou as análises disponíveis na sua conta. Libere esta análise ou escolha um plano com análises todo mês.'
            : 'Ao criar sua conta grátis, sua primeira análise completa é por nossa conta.'}
          offer={offer}
          go={go}
        />
      )}
      {status === 'idle' && canRun && (
        <div className="ai-intro">
          <p>Uma análise escrita sob medida, que integra todos os fatores calculados num texto único e profundo.</p>
          {available ? (
            <button className="cta" onClick={run}><span>✧ Gerar análise completa ✧</span></button>
          ) : (
            <button className="ghost" onClick={() => go('ajustes')}>⚙ Ativar a análise completa em Ajustes</button>
          )}
          {access.enabled && !access.loading && <p className="muted small">{allowanceNote(allowance)}</p>}
        </div>
      )}
      {status === 'loading' && !text && <div className="loader"><span /> Consultando as estrelas…</div>}
      {text && <div className={`ai-text ${status === 'loading' ? 'typing' : ''}`}>{renderMarkdown(text)}</div>}
      {status === 'loading' && text && <button className="link" onClick={() => { abort.current?.abort(); setStatus('done'); writeCache(key, text) }}>Parar</button>}
      {status === 'error' && (
        <div className="ai-intro">
          <p className="error">{error}</p>
          <button className="ghost" onClick={run}>Tentar novamente</button>
        </div>
      )}
      {status === 'done' && text && <ReadingActions kind={kind} subject={subject} text={text} />}
    </section>
  )
}

/** Save as PDF, copy and share a finished analysis (it is also kept on this device). */
function ReadingActions({ kind, subject, text }: { kind: ReadingKind; subject: string; text: string }) {
  const [printing, setPrinting] = useState(false)
  const [msg, setMsg] = useState('')
  const [today] = useState(() => new Date().toLocaleDateString('pt-BR'))
  const title = READING_TITLES[kind]
  const plain = `${title} — ${subject}\n\n${text.replace(/[*_#]/g, '')}\n\nCosmic Sky · ${window.location.host}${window.location.pathname}`

  useEffect(() => {
    if (!printing) return
    const done = () => { document.body.classList.remove('printing-ai'); setPrinting(false) }
    document.body.classList.add('printing-ai')
    window.addEventListener('afterprint', done, { once: true })
    // let the print layout render before opening the dialog
    const id = window.setTimeout(() => window.print(), 50)
    return () => { window.clearTimeout(id); window.removeEventListener('afterprint', done); document.body.classList.remove('printing-ai') }
  }, [printing])

  const copy = async () => {
    try { await navigator.clipboard.writeText(plain); setMsg('Texto copiado.') } catch { setMsg('Não foi possível copiar neste aparelho.') }
  }
  const share = async () => {
    try { await navigator.share({ title, text: plain }) } catch { /* cancelled */ }
  }
  const canShare = typeof navigator.share === 'function'

  return (
    <>
      <div className="ai-actions">
        <button className="ghost" onClick={() => setPrinting(true)}>⎙ PDF da análise</button>
        <button className="ghost" onClick={copy}>⧉ Copiar texto</button>
        {canShare && <button className="ghost" onClick={share}>↗ Compartilhar</button>}
      </div>
      <p className="muted small ai-saved">✓ Esta análise fica salva neste aparelho: é só voltar a esta página para ler de novo.{msg && ` ${msg}`}</p>
      {printing && createPortal(
        <div id="ai-print">
          <p className="pr-brand">✶ COSMIC SKY ✶</p>
          <h1>{title}</h1>
          <p className="ai-print-sub">{subject}</p>
          <div className="ai-print-text">{renderMarkdown(text)}</div>
          <p className="ai-print-end">Gerada pelo Cosmic Sky · {today}</p>
        </div>,
        document.body,
      )}
    </>
  )
}

function allowanceNote(a: Allowance): string {
  if (a.source === 'grant') return `Incluída na sua compra${a.left ? ` · depois desta, você ainda pode gerar ${a.left} ${a.left === 1 ? 'nova versão' : 'novas versões'}` : ''}.`
  if (a.source === 'plan') return `Do seu plano · depois desta, ${a.left === 1 ? 'resta 1 análise' : `restam ${a.left} análises`} neste mês.`
  if (a.source === 'welcome') return 'Presente de boas-vindas: sua primeira análise completa é grátis.'
  return ''
}

/** Minimal, safe Markdown: headings, bold/italic, lists, paragraphs (no HTML injection). */
function renderMarkdown(md: string): ReactNode[] {
  const out: ReactNode[] = []
  const lines = md.replace(/\r/g, '').split('\n')
  let list: string[] = []
  let para: string[] = []
  const flushList = () => {
    if (list.length) out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>)
    list = []
  }
  const flushPara = () => {
    if (para.length) out.push(<p key={out.length}>{inline(para.join(' '))}</p>)
    para = []
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushList(); flushPara(); continue }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      flushList(); flushPara()
      out.push(h[1].length <= 2 ? <h3 key={out.length}>{inline(h[2])}</h3> : <h4 key={out.length}>{inline(h[2])}</h4>)
      continue
    }
    const li = /^[-*•]\s+(.*)$/.exec(line)
    if (li) { flushPara(); list.push(li[1]); continue }
    flushList()
    para.push(line)
  }
  flushList(); flushPara()
  return out
}

function inline(s: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index))
    const t = m[0]
    parts.push(t.startsWith('**') ? <strong key={m.index}>{t.slice(2, -2)}</strong> : <em key={m.index}>{t.slice(1, -1)}</em>)
    last = m.index + t.length
  }
  if (last < s.length) parts.push(s.slice(last))
  return parts
}
