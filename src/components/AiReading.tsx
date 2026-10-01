import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AiError, aiAvailable } from '../ai/config'
import { READING_TITLES, type ReadingKind } from '../ai/prompts'

interface Props {
  kind: ReadingKind
  /** Lazily built so heavy summaries are only computed on demand. */
  getSummary: () => string
  /** Stable id of what is being read (profile + options) — used to cache the result. */
  cacheKey: string
  onOpenSettings?: () => void
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

function AiReadingInner({ kind, getSummary, onOpenSettings, storageKey: key }: Props & { storageKey: string }) {
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
        signal: ctl.signal,
        onText: (d) => { acc += d; setText(acc) },
      })
      writeCache(key, full || acc)
      setStatus('done')
    } catch (e) {
      if (ctl.signal.aborted) return
      setError(e instanceof AiError ? e.message : 'Não foi possível gerar a leitura agora.')
      setStatus('error')
    }
  }

  const available = aiAvailable()

  return (
    <section className="glass ai-reading">
      <div className="section-title">
        <h2><span className="ai-spark">✦</span> {READING_TITLES[kind]} com IA</h2>
        {status === 'done' && <button className="ghost" onClick={run}>↻ Gerar nova versão</button>}
      </div>
      {status === 'idle' && (
        <div className="ai-intro">
          <p>Uma leitura escrita sob medida, que integra todos os fatores calculados num texto único e profundo.</p>
          {available ? (
            <button className="cta" onClick={run}><span>✧ Gerar leitura personalizada ✧</span></button>
          ) : (
            <button className="ghost" onClick={onOpenSettings}>⚙ Ativar a leitura por IA em Ajustes</button>
          )}
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
      <p className="muted small ai-note">Texto gerado por inteligência artificial a partir do seu mapa calculado — use como reflexão, não como verdade absoluta.</p>
    </section>
  )
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
