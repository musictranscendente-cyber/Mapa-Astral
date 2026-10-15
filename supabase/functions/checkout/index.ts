// POST /functions/v1/checkout — creates the order and a Mercado Pago Checkout Pro link (Pix or card).
// Secret: MP_ACCESS_TOKEN (Mercado Pago → Suas integrações → Credenciais de produção → Access Token).
import { PRODUCTS, grantKeys, isProductKey, type Scope } from '../_shared/rules.ts'
import { APP_URL, adminClient, corsHeaders, json, requestUser } from '../_shared/server.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'método não permitido' }, 405)

  const token = Deno.env.get('MP_ACCESS_TOKEN')
  if (!token) return json({ error: 'Pagamentos ainda não configurados.' }, 503)

  const admin = adminClient()
  const user = await requestUser(req, admin)
  if (!user) return json({ error: 'Entre na sua conta para comprar.' }, 401)

  let body: { product?: string; scope?: Scope; label?: string }
  try { body = await req.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  if (!isProductKey(body.product)) return json({ error: 'Produto inválido.' }, 400)
  const product = PRODUCTS[body.product]
  const grants = grantKeys(product.key, body.scope ?? {})
  if (!grants) return json({ error: 'Dados da compra incompletos.' }, 400)
  const label = typeof body.label === 'string' ? body.label.slice(0, 80) : null

  const { data: purchase, error } = await admin
    .from('purchases')
    .insert({ user_id: user.id, product: product.key, label, grants, amount: product.price })
    .select('id')
    .single()
  if (error) return json({ error: 'Não foi possível criar o pedido.' }, 500)

  const back = `${APP_URL}#/planos`
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'x-idempotency-key': purchase.id },
    body: JSON.stringify({
      items: [{
        id: product.key,
        title: label ? `${product.name} · ${label}` : product.name,
        description: product.description,
        quantity: 1,
        unit_price: product.price,
        currency_id: 'BRL',
      }],
      payer: user.email ? { email: user.email } : undefined,
      external_reference: purchase.id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: 'approved',
      statement_descriptor: 'MAPA ASTRAL',
    }),
  })
  const pref = await res.json().catch(() => ({}))
  if (!res.ok || !pref.init_point) {
    await admin.from('purchases').update({ status: 'rejected' }).eq('id', purchase.id)
    return json({ error: 'O Mercado Pago não respondeu. Tente novamente em instantes.' }, 502)
  }
  return json({ url: pref.init_point })
})
