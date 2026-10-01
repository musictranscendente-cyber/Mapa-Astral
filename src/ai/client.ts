import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt, clampSummary, type ReadingKind } from './prompts'
import { AI_ENDPOINT, AI_MODEL, AiError, getUserKey } from './config'

interface Options {
  kind: ReadingKind
  summary: string
  onText: (delta: string) => void
  signal?: AbortSignal
}

/** Streams a reading. Uses the server endpoint when configured, else the user's own key. */
export async function generateReading({ kind, summary, onText, signal }: Options): Promise<string> {
  const data = clampSummary(summary)
  if (AI_ENDPOINT) return viaEndpoint(kind, data, onText, signal)
  const key = getUserKey()
  if (!key) throw new AiError('Configure a leitura por IA em Ajustes.')
  return viaBrowser(key, kind, data, onText, signal)
}

async function viaEndpoint(kind: ReadingKind, summary: string, onText: (d: string) => void, signal?: AbortSignal) {
  const res = await fetch(AI_ENDPOINT!, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind, summary }),
    signal,
  })
  if (!res.ok || !res.body) throw new AiError(`O serviço de IA respondeu com erro (${res.status}).`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onText(chunk)
  }
  return full
}

async function viaBrowser(apiKey: string, kind: ReadingKind, summary: string, onText: (d: string) => void, signal?: AbortSignal) {
  // Personal-key mode: the key never leaves this device except to call the API directly.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  try {
    const stream = client.beta.messages.stream(
      {
        model: AI_MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: buildUserPrompt(kind, summary) }],
      },
      { signal },
    )
    stream.on('text', (delta) => onText(delta))
    const message = await stream.finalMessage()
    if (message.stop_reason === 'refusal') throw new AiError('A IA não pôde gerar esta leitura. Tente novamente.')
    return message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  } catch (e) {
    if (e instanceof AiError) throw e
    if (e instanceof Anthropic.AuthenticationError) throw new AiError('Chave de API inválida. Verifique em Ajustes.')
    if (e instanceof Anthropic.RateLimitError) throw new AiError('Limite de uso atingido. Aguarde alguns instantes.')
    if (e instanceof Anthropic.APIUserAbortError) throw e
    if (e instanceof Anthropic.APIError) throw new AiError(`Erro da API (${e.status ?? 'rede'}): ${e.message}`)
    throw e
  }
}
