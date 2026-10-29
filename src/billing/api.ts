import { authConfigured, supabase } from '../lib/supabase'
import { getLang, t } from '../i18n'
import { getCurrency } from './currency'
import { EMPTY_ACCESS, buildAccess, type AccessData, type AnalysisLogRow, type EntitlementRow, type ProductKey, type PurchaseRow, type Scope } from './rules'

/** Paid features are on unless the build sets VITE_BILLING=off (see docs/configurar-pagamentos.md). */
export const BILLING = import.meta.env.VITE_BILLING !== 'off' && authConfigured

export async function fetchAccess(userId: string): Promise<AccessData> {
  if (!supabase) return EMPTY_ACCESS
  const [ent, pur, log] = await Promise.all([
    supabase.from('entitlements').select('plan, plan_until').eq('user_id', userId).maybeSingle(),
    supabase.from('purchases').select('grants, expires_at').eq('user_id', userId).eq('status', 'approved'),
    supabase.from('analysis_log').select('source, access_key, created_at').eq('user_id', userId),
  ])
  const error = ent.error ?? pur.error ?? log.error
  if (error) throw error
  return buildAccess(ent.data as EntitlementRow | null, (pur.data ?? []) as PurchaseRow[], (log.data ?? []) as AnalysisLogRow[])
}

export interface PurchaseSummary {
  id: string
  product: ProductKey
  label: string | null
  amount: number
  status: string
  created_at: string
  expires_at: string | null
}

export async function fetchPurchases(): Promise<PurchaseSummary[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('purchases')
    .select('id, product, label, amount, status, created_at, expires_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as PurchaseSummary[]
}

/** Creates the order and sends the person to the checkout: Mercado Pago in reais, Stripe in dollars. */
export async function startCheckout(product: ProductKey, scope: Scope = {}, label = ''): Promise<void> {
  if (!supabase) throw new Error(t('Pagamentos indisponíveis.'))
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>('checkout', {
    body: { product, scope, label: label.slice(0, 80), currency: getCurrency(), lang: getLang() },
  })
  if (error || !data?.url) throw new Error(t('Não foi possível abrir o pagamento agora. Tente novamente.'))
  window.location.href = data.url
}

export type RedeemResult = { ok: true; product: ProductKey } | { ok: false; error: 'login' | 'invalid' | 'used' | 'server' }

/** Applies a promo code to the signed-in account (one use per code and account). */
export async function redeemCode(code: string): Promise<RedeemResult> {
  if (!supabase) return { ok: false, error: 'server' }
  const { data, error } = await supabase.functions.invoke<RedeemResult>('redeem', { body: { code } })
  return error || !data ? { ok: false, error: 'server' } : data
}
