/**
 * Serverless endpoint for AI readings (Vercel-style Web handler: `POST /api/ai-reading`).
 * Keeps ANTHROPIC_API_KEY on the server. The browser sends only the computed chart
 * summary; the prompt is built here so the endpoint can't be used as a generic proxy.
 *
 * Env: ANTHROPIC_API_KEY (required), ALLOWED_ORIGIN (optional, e.g. https://seu-dominio.com).
 * Deploy elsewhere (Cloudflare Workers, Supabase Edge, Netlify) by wiring `handle` to the
 * platform's fetch handler. Add login + rate limiting before opening it to the public.
 */
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt, clampSummary, type ReadingKind } from '../src/ai/prompts'

declare const process: { env: Record<string, string | undefined> }

const KINDS: ReadingKind[] = ['natal', 'sinastria', 'revolucao', 'previsao']

const cors = (): Record<string, string> => ({
  'access-control-allow-origin': process.env.ALLOWED_ORIGIN ?? '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
})

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: cors() })
}

export async function POST(request: Request): Promise<Response> {
  return handle(request)
}

export async function handle(request: Request): Promise<Response> {
  let body: { kind?: string; summary?: string }
  try {
    body = await request.json()
  } catch {
    return new Response('JSON inválido', { status: 400, headers: cors() })
  }
  const kind = body.kind as ReadingKind
  if (!KINDS.includes(kind) || typeof body.summary !== 'string' || body.summary.length < 50) {
    return new Response('Parâmetros inválidos', { status: 400, headers: cors() })
  }

  const client = new Anthropic() // reads ANTHROPIC_API_KEY
  const stream = client.beta.messages.stream({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildUserPrompt(kind, clampSummary(body.summary)) }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)))
      try {
        const message = await stream.finalMessage()
        if (message.stop_reason === 'refusal') {
          controller.enqueue(encoder.encode('\n\n_Não foi possível concluir esta leitura._'))
        }
      } catch (e) {
        const msg = e instanceof Anthropic.APIError ? `erro ${e.status ?? 'de rede'}` : 'erro inesperado'
        controller.enqueue(encoder.encode(`\n\n_Falha ao gerar a leitura (${msg})._`))
      } finally {
        controller.close()
      }
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(readable, {
    headers: { ...cors(), 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  })
}
