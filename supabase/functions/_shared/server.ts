// Helpers shared by the Edge Functions (Deno).
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2'
import { PRODUCTS, buildAccess, extendPlan, type AccessData, type AnalysisLogRow, type EntitlementRow, type PlanKey, type ProductKey, type PurchaseRow } from './rules.ts'

export const corsHeaders: Record<string, string> = {
  'access-control-allow-origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json' } })

/** Client with the service key: bypasses RLS, so only use it after checking who is asking. */
export function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** The signed-in person making the request (from the `Authorization: Bearer` access token). */
export async function requestUser(req: Request, admin: SupabaseClient): Promise<User | null> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data, error } = await admin.auth.getUser(token)
  return error ? null : data.user
}

export async function loadAccess(admin: SupabaseClient, userId: string): Promise<AccessData> {
  const [ent, pur, log] = await Promise.all([
    admin.from('entitlements').select('plan, plan_until').eq('user_id', userId).maybeSingle(),
    admin.from('purchases').select('grants, expires_at').eq('user_id', userId).eq('status', 'approved'),
    admin.from('analysis_log').select('source, access_key, created_at').eq('user_id', userId),
  ])
  const error = ent.error ?? pur.error ?? log.error
  if (error) throw error
  return buildAccess(ent.data as EntitlementRow | null, (pur.data ?? []) as PurchaseRow[], (log.data ?? []) as AnalysisLogRow[])
}

export const APP_URL = Deno.env.get('APP_URL') ?? 'https://musictranscendente-cyber.github.io/Mapa-Astral/'

/**
 * Marks a paid order as approved and grants what it bought (plan time or single services).
 * Safe to call more than once: only the first call applies it. `paymentRef` is the provider's
 * payment id (Mercado Pago id, or `stripe:<payment_intent>`).
 */
export async function approvePurchase(admin: SupabaseClient, p: { id: string; user_id: string; product: ProductKey }, paymentRef: string): Promise<boolean> {
  const product = PRODUCTS[p.product]
  const now = new Date()
  const expires = product.days && !product.plan ? new Date(now.getTime() + product.days * 86400000).toISOString() : null
  // Conditional update: only one notification gets to apply the purchase.
  const { data: updated } = await admin
    .from('purchases')
    .update({ status: 'approved', paid_at: now.toISOString(), mp_payment_id: paymentRef, expires_at: expires })
    .eq('id', p.id)
    .neq('status', 'approved')
    .select('id')
    .maybeSingle()
  if (!updated) return false

  if (product.plan) {
    const { data: ent } = await admin.from('entitlements').select('plan, plan_until').eq('user_id', p.user_id).maybeSingle()
    const until = extendPlan({ plan: (ent?.plan ?? null) as PlanKey | null, planUntil: ent?.plan_until ?? null }, product.plan, product.days ?? 30, now)
    await admin.from('entitlements').upsert({ user_id: p.user_id, plan: product.plan, plan_until: until, updated_at: now.toISOString() })
    await admin.from('purchases').update({ expires_at: until }).eq('id', p.id)
  }
  return true
}
