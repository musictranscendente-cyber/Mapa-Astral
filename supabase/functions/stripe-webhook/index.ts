// POST /functions/v1/stripe-webhook — Stripe payment notifications (deploy with --no-verify-jwt).
// Every event is checked against the Stripe-Signature header, so a forged call can't unlock anything.
// Events: checkout.session.completed, checkout.session.async_payment_succeeded, charge.refunded.
// Secrets: STRIPE_WEBHOOK_SECRET (whsec_…).
import { PRODUCTS, isProductKey, paidEnough } from '../_shared/rules.ts'
import { adminClient, approvePurchase } from '../_shared/server.ts'

const ok = (msg = 'ok') => new Response(msg, { status: 200 })
const TOLERANCE_S = 300

async function validSignature(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').map((p) => p.trim().split('=') as [string, string])
  const ts = parts.find(([k]) => k === 't')?.[1]
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!ts || !sigs.length || Math.abs(Date.now() / 1000 - Number(ts)) > TOLERANCE_S) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${raw}`)))
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('')
  return sigs.includes(hex)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok()
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!secret) return new Response('não configurado', { status: 503 })
  const raw = await req.text()
  if (!(await validSignature(raw, req.headers.get('stripe-signature') ?? '', secret))) return new Response('assinatura inválida', { status: 400 })

  let event: { type?: string; data?: { object?: Record<string, unknown> } }
  try { event = JSON.parse(raw) } catch { return new Response('JSON inválido', { status: 400 }) }
  const obj = event.data?.object ?? {}
  const admin = adminClient()

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    // Card payments arrive paid; delayed methods only count once async_payment_succeeded says so.
    if (obj.payment_status !== 'paid') return ok('aguardando pagamento')
    const purchaseId = (obj.client_reference_id ?? (obj.metadata as Record<string, string> | undefined)?.purchase_id) as string | undefined
    if (!purchaseId || !/^[0-9a-f-]{36}$/.test(purchaseId)) return ok('sem pedido')
    const { data: p } = await admin.from('purchases').select('id, user_id, product, status').eq('id', purchaseId).maybeSingle()
    if (!p || !isProductKey(p.product)) return ok('pedido desconhecido')
    if (p.status === 'approved') return ok('já processado')
    const product = PRODUCTS[p.product]
    const paid = Number(obj.amount_total) / 100
    if (String(obj.currency).toLowerCase() !== 'usd' || !paidEnough(product.key, paid, 'USD')) {
      console.error('valor divergente', purchaseId, obj.amount_total, obj.currency)
      return ok('valor divergente')
    }
    const ref = `stripe:${obj.payment_intent ?? obj.id}`
    return ok((await approvePurchase(admin, { id: p.id, user_id: p.user_id, product: product.key }, ref)) ? 'aprovado' : 'já processado')
  }

  if (event.type === 'charge.refunded' && obj.payment_intent) {
    const { data: p } = await admin.from('purchases').select('id, user_id, product').eq('mp_payment_id', `stripe:${obj.payment_intent}`).maybeSingle()
    if (p) {
      await admin.from('purchases').update({ status: 'refunded' }).eq('id', p.id)
      if (isProductKey(p.product) && PRODUCTS[p.product].plan) console.warn('plano estornado: revise o acesso manualmente', p.user_id)
    }
  }
  return ok()
})
