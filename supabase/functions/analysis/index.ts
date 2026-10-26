// POST /functions/v1/analysis — streams an "análise completa" for the signed-in person,
// charged to a purchase, the plan's monthly allowance or the welcome gift (see _shared/rules.ts).
// Secret: ANTHROPIC_API_KEY.
import Anthropic from 'npm:@anthropic-ai/sdk@0.131.0'
import { SYSTEM_PROMPT, buildUserPrompt, clampSummary, type ReadingKind } from '../_shared/promptCore.ts'
import { OWNER_EMAIL_HASHES, analysisAllowance, validAnalysisKey } from '../_shared/rules.ts'
import { adminClient, corsHeaders, json, loadAccess, requestUser } from '../_shared/server.ts'

const KINDS: ReadingKind[] = ['natal', 'sinastria', 'revolucao', 'previsao']

async function isOwner(email: string | undefined): Promise<boolean> {
  if (!email) return false
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.trim().toLowerCase()))
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return OWNER_EMAIL_HASHES.includes(hex)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'método não permitido' }, 405)

  const admin = adminClient()
  const user = await requestUser(req, admin)
  if (!user) return json({ error: 'entre na sua conta' }, 401)

  let body: { kind?: string; summary?: string; key?: string }
  try { body = await req.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  const kind = body.kind as ReadingKind
  const key = body.key ?? ''
  if (!KINDS.includes(kind) || typeof body.summary !== 'string' || body.summary.length < 50 || !validAnalysisKey(kind, key)) {
    return json({ error: 'parâmetros inválidos' }, 400)
  }

  // The owner tests freely: no balance needed and nothing recorded.
  let refund = async () => {}
  if (!(await isOwner(user.email))) {
    const allowance = analysisAllowance(await loadAccess(admin, user.id), key)
    if (!allowance.ok) return json({ error: 'sem saldo de análises' }, 402)

    // Record first, so two simultaneous requests can't both spend the last analysis.
    const { data: logRow, error: logError } = await admin
      .from('analysis_log')
      .insert({ user_id: user.id, kind, access_key: key, source: allowance.source })
      .select('id')
      .single()
    if (logError) return json({ error: 'falha ao registrar' }, 500)
    refund = async () => { await admin.from('analysis_log').delete().eq('id', logRow.id) }
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
  let wrote = false
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      stream.on('text', (delta) => { wrote = true; controller.enqueue(encoder.encode(delta)) })
      try {
        const message = await stream.finalMessage()
        if (message.stop_reason === 'refusal') {
          if (!wrote) await refund()
          controller.enqueue(encoder.encode('\n\n_Não foi possível concluir esta análise. Ela não foi descontada do seu saldo._'))
        }
      } catch (e) {
        // Nothing delivered: give the analysis back.
        if (!wrote) await refund()
        const msg = e instanceof Anthropic.APIError ? `erro ${e.status ?? 'de rede'}` : 'erro inesperado'
        controller.enqueue(encoder.encode(`\n\n_Falha ao gerar a análise (${msg}).${wrote ? '' : ' Ela não foi descontada do seu saldo.'}_`))
      } finally {
        controller.close()
      }
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(readable, {
    headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  })
})
