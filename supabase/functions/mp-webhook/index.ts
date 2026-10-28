// POST /functions/v1/mp-webhook — Mercado Pago payment notifications (deploy with --no-verify-jwt).
// The payment is always re-read from the Mercado Pago API with our token, so a forged
// notification can't unlock anything. Secrets: MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET (optional, recommended).
import { PRODUCTS, isProductKey, paidEnough } from '../_shared/rules.ts'
import { adminClient, approvePurchase } from '../_shared/server.ts'

const ok = (msg = 'ok') => new Response(msg, { status: 200 })

async function validSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET')
  if (!secret) return true
  const header = req.headers.get('x-signature') ?? ''
  const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=') as [string, string]))
  if (!parts.ts || !parts.v1) return false
  const manifest = `id:${dataId.toLowerCase()};request-id:${req.headers.get('x-request-id') ?? ''};ts:${parts.ts};`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)))
  const hex = [...sig].map((b) => b.toString(16).padStart(2, '0')).join('')
  return hex === parts.v1
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok()
  const url = new URL(req.url)
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {}
  try { body = await req.json() } catch { /* query-string notification */ }
  const type = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
  const id = String(body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? '')
  if (type !== 'payment' || !id) return ok('ignorado')
  if (!(await validSignature(req, url.searchParams.get('data.id') ?? id))) return new Response('assinatura inválida', { status: 401 })

  const token = Deno.env.get('MP_ACCESS_TOKEN')
  if (!token) return new Response('não configurado', { status: 503 })
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, { headers: { authorization: `Bearer ${token}` } })
  // Non-200 makes Mercado Pago retry later.
  if (!res.ok) return new Response('pagamento não encontrado', { status: res.status === 404 ? 200 : 502 })
  const pay = await res.json()

  const admin = adminClient()
  const purchaseId = pay.external_reference as string | undefined
  if (!purchaseId || !/^[0-9a-f-]{36}$/.test(purchaseId)) return ok('sem pedido')
  const { data: p } = await admin.from('purchases').select('id, user_id, product, status, mp_payment_id').eq('id', purchaseId).maybeSingle()
  if (!p || !isProductKey(p.product)) return ok('pedido desconhecido')
  const product = PRODUCTS[p.product]

  if (pay.status === 'approved') {
    if (p.status === 'approved') return ok('já processado')
    if (pay.currency_id !== 'BRL' || !paidEnough(product.key, Number(pay.transaction_amount))) {
      console.error('valor divergente', purchaseId, pay.transaction_amount)
      return ok('valor divergente')
    }
    if (!(await approvePurchase(admin, { id: p.id, user_id: p.user_id, product: product.key }, String(pay.id)))) return ok('já processado')
    return ok('aprovado')
  }

  if ((pay.status === 'refunded' || pay.status === 'charged_back') && p.mp_payment_id === String(pay.id)) {
    await admin.from('purchases').update({ status: 'refunded' }).eq('id', p.id)
    if (product.plan) console.warn('plano estornado: revise o acesso manualmente', p.user_id)
  }
  return ok()
})
