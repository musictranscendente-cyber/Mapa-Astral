import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt, clampSummary, type ReadingKind } from './prompts'
import { AI_ENDPOINT, AI_MODEL, AiError, getUserKey } from './config'
import { BILLING } from '../billing/api'
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase'

interface Options {
  kind: ReadingKind
  summary: string
  /** What is being analysed (see billing/rules); the server charges the right allowance. */
  accessKey: string
  /** Owner simulator: don't charge the account; use the personal key or a sample text. */
  simulated?: boolean
  onText: (delta: string) => void
  signal?: AbortSignal
}

/** Streams a reading. Uses the server endpoint when configured, else the user's own key. */
export async function generateReading({ kind, summary, accessKey, simulated, onText, signal }: Options): Promise<string> {
  const data = clampSummary(summary)
  if (simulated) {
    const key = getUserKey()
    if (key) return viaBrowser(key, kind, data, onText, signal)
    if (AI_ENDPOINT) return viaEndpoint(kind, data, onText, signal)
    return sampleText(onText, signal)
  }
  if (BILLING) return viaAccount(kind, data, accessKey, onText, signal)
  if (AI_ENDPOINT) return viaEndpoint(kind, data, onText, signal)
  const key = getUserKey()
  if (!key) throw new AiError('Ative a análise completa em Ajustes.')
  return viaBrowser(key, kind, data, onText, signal)
}

/** Signed-in mode: the account's plan or purchases pay for the analysis (Supabase Edge Function). */
async function viaAccount(kind: ReadingKind, summary: string, accessKey: string, onText: (d: string) => void, signal?: AbortSignal) {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
  const token = data.session?.access_token
  if (!token) throw new AiError('Entre na sua conta para gerar a análise completa.')
  const res = await fetch(`${supabaseUrl}/functions/v1/analysis`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, apikey: supabaseAnonKey! },
    body: JSON.stringify({ kind, summary, key: accessKey }),
    signal,
  })
  if (res.status === 402) throw new AiError('Seu saldo de análises acabou. Libere esta análise ou escolha um plano.')
  return readStream(res, onText)
}

async function viaEndpoint(kind: ReadingKind, summary: string, onText: (d: string) => void, signal?: AbortSignal) {
  const res = await fetch(AI_ENDPOINT!, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind, summary }),
    signal,
  })
  return readStream(res, onText)
}

async function readStream(res: Response, onText: (d: string) => void) {
  if (!res.ok || !res.body) throw new AiError(`O serviço de análise respondeu com erro (${res.status}).`)
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
    if (message.stop_reason === 'refusal') throw new AiError('Não foi possível gerar esta análise. Tente novamente.')
    return message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  } catch (e) {
    if (e instanceof AiError) throw e
    if (e instanceof Anthropic.AuthenticationError) throw new AiError('Chave de ativação inválida. Verifique em Ajustes.')
    if (e instanceof Anthropic.RateLimitError) throw new AiError('Limite de uso atingido. Aguarde alguns instantes.')
    if (e instanceof Anthropic.APIUserAbortError) throw e
    if (e instanceof Anthropic.APIError) throw new AiError(`Erro no serviço de análise (${e.status ?? 'rede'}).`)
    throw e
  }
}

const SAMPLE = `## Simulação da análise completa

Este é um **texto de exemplo** do simulador: a compra e o saldo de análises funcionaram como funcionariam para um cliente.

Para ver a análise real durante a simulação, informe a chave de ativação em *Ajustes → Análise completa*.

- O saldo de análises foi descontado da simulação.
- Nenhum valor foi cobrado.`

async function sampleText(onText: (d: string) => void, signal?: AbortSignal) {
  for (const word of SAMPLE.split(/(?<= )/)) {
    if (signal?.aborted) break
    onText(word)
    await new Promise((r) => setTimeout(r, 18))
  }
  return SAMPLE
}
