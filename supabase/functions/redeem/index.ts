// POST /functions/v1/redeem — applies a promo code (e.g. a free month of Estrela for testers).
// Secret PROMO_CODES: comma-separated CODE:product pairs, e.g. "COSMICTESTE:estrela_mensal".
// Each account can use each code once (the payment reference is unique per code and account).
import { PRODUCTS, isProductKey } from '../_shared/rules.ts'
import { adminClient, approvePurchase, corsHeaders, json, requestUser } from '../_shared/server.ts'

function promoCodes(): Map<string, string> {
  const out = new Map<string, string>()
  for (const pair of (Deno.env.get('PROMO_CODES') ?? '').split(',')) {
    const [code, product] = pair.split(':').map((s) => s.trim())
    if (code && isProductKey(product) && PRODUCTS[product].plan) out.set(code.toUpperCase(), product)
  }
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405)

  const admin = adminClient()
  const user = await requestUser(req, admin)
  if (!user) return json({ ok: false, error: 'login' })

  let body: { code?: string }
  try { body = await req.json() } catch { return json({ ok: false, error: 'invalid' }) }
  const code = String(body.code ?? '').trim().toUpperCase().slice(0, 40)
  const product = promoCodes().get(code)
  if (!code || !product || !isProductKey(product)) return json({ ok: false, error: 'invalid' })

  const ref = `promo:${code}:${user.id}`
  const { data: used } = await admin.from('purchases').select('id').eq('mp_payment_id', ref).maybeSingle()
  if (used) return json({ ok: false, error: 'used' })

  const { data: purchase, error } = await admin
    .from('purchases')
    .insert({ user_id: user.id, product, label: `Cupom ${code}`, grants: [], amount: 0 })
    .select('id')
    .single()
  if (error) return json({ ok: false, error: 'server' })
  const applied = await approvePurchase(admin, { id: purchase.id, user_id: user.id, product }, ref)
  if (!applied) return json({ ok: false, error: 'used' })
  return json({ ok: true, product })
})
