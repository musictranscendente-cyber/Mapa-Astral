// POST /functions/v1/checkout — creates the order and the payment link:
// reais → Mercado Pago Checkout Pro (Pix, card, boleto); dollars → Stripe Checkout (card).
// Secrets: MP_ACCESS_TOKEN, STRIPE_SECRET_KEY.
import { PRODUCTS, grantKeys, isProductKey, priceOf, type Currency, type Scope } from '../_shared/rules.ts'
import { APP_URL, adminClient, corsHeaders, json, requestUser } from '../_shared/server.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'método não permitido' }, 405)

  const admin = adminClient()
  const user = await requestUser(req, admin)
  if (!user) return json({ error: 'Entre na sua conta para comprar.' }, 401)

  let body: { product?: string; scope?: Scope; label?: string; currency?: string; lang?: string }
  try { body = await req.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  if (!isProductKey(body.product)) return json({ error: 'Produto inválido.' }, 400)
  const product = PRODUCTS[body.product]
  const grants = grantKeys(product.key, body.scope ?? {})
  if (!grants) return json({ error: 'Dados da compra incompletos.' }, 400)
  const label = typeof body.label === 'string' ? body.label.slice(0, 80) : null
  const currency: Currency = body.currency === 'USD' ? 'USD' : 'BRL'
  const lang = body.lang === 'en' || body.lang === 'es' ? body.lang : 'pt'
  const token = Deno.env.get(currency === 'USD' ? 'STRIPE_SECRET_KEY' : 'MP_ACCESS_TOKEN')
  if (!token) return json({ error: 'Pagamentos ainda não configurados.' }, 503)
  const amount = priceOf(product.key, currency)

  const { data: purchase, error } = await admin
    .from('purchases')
    .insert({ user_id: user.id, product: product.key, label, grants, amount })
    .select('id')
    .single()
  if (error) return json({ error: 'Não foi possível criar o pedido.' }, 500)

  const title = label ? `${product.name} · ${label}` : product.name

  if (currency === 'USD') {
    const back = `${APP_URL}?lang=${lang}#/planos`
    const form = new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
      'line_items[0][price_data][product_data][name]': title,
      client_reference_id: purchase.id,
      'metadata[purchase_id]': purchase.id,
      'payment_intent_data[metadata][purchase_id]': purchase.id,
      success_url: `${back}?status=approved`,
      cancel_url: `${back}?status=cancelled`,
      locale: lang === 'pt' ? 'pt-BR' : lang,
    })
    if (user.email) form.set('customer_email', user.email)
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/x-www-form-urlencoded', 'idempotency-key': purchase.id },
      body: form,
    })
    const session = await res.json().catch(() => ({}))
    if (!res.ok || !session.url) {
      console.error('stripe', res.status, session?.error?.message)
      await admin.from('purchases').update({ status: 'rejected' }).eq('id', purchase.id)
      return json({ error: 'O pagamento não respondeu. Tente novamente em instantes.' }, 502)
    }
    return json({ url: session.url })
  }

  const back = `${APP_URL}#/planos`
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'x-idempotency-key': purchase.id },
    body: JSON.stringify({
      items: [{
        id: product.key,
        title,
        description: product.description,
        quantity: 1,
        unit_price: amount,
        currency_id: 'BRL',
      }],
      payer: user.email ? { email: user.email } : undefined,
      external_reference: purchase.id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: 'approved',
      statement_descriptor: 'COSMIC SKY',
    }),
  })
  const pref = await res.json().catch(() => ({}))
  if (!res.ok || !pref.init_point) {
    await admin.from('purchases').update({ status: 'rejected' }).eq('id', purchase.id)
    return json({ error: 'O Mercado Pago não respondeu. Tente novamente em instantes.' }, 502)
  }
  return json({ url: pref.init_point })
})
