/**
 * Catalog and access rules shared by the app and the Supabase Edge Functions.
 * Keep this file free of imports: `npm run sync:functions` copies it to
 * supabase/functions/_shared/rules.ts (a test checks the copy stays identical).
 */

export type PlanKey = 'estrela' | 'cosmos'
export type AnalysisKind = 'natal' | 'sinastria' | 'revolucao' | 'previsao'

export type ProductKey =
  | 'natal'
  | 'sinastria'
  | 'revolucao'
  | 'previsao12'
  | 'pacote'
  | 'retorno_lunar'
  | 'progressoes'
  | 'astrocarto'
  | 'estrela_mensal'
  | 'estrela_anual'
  | 'cosmos_mensal'
  | 'cosmos_anual'

export interface Product {
  key: ProductKey
  name: string
  description: string
  /** Price in BRL. */
  price: number
  plan?: PlanKey
  /** Plan length, or how long the grant lasts (none = forever). */
  days?: number
  /** What the purchase must point at. */
  scope?: 'birth' | 'pair' | 'birthYear'
}

export const PRODUCTS: Record<ProductKey, Product> = {
  natal: { key: 'natal', name: 'Análise completa do Mapa Natal', description: 'Análise profunda e personalizada do seu mapa.', price: 29, scope: 'birth' },
  sinastria: { key: 'sinastria', name: 'Sinastria completa', description: 'Todas as áreas, sobreposição de casas e análise completa do casal.', price: 29, scope: 'pair' },
  revolucao: { key: 'revolucao', name: 'Revolução Solar do ano', description: 'Mapa do ano completo, comparador de cidades e análise completa.', price: 39, scope: 'birthYear' },
  previsao12: { key: 'previsao12', name: 'Previsão de 12 meses', description: 'Trânsitos de 1 ano, meses-chave e análise completa.', price: 59, days: 365, scope: 'birth' },
  retorno_lunar: { key: 'retorno_lunar', name: 'Retorno Lunar · 12 meses', description: 'Todas as posições e aspectos de cada mês, em qualquer cidade, por 1 ano.', price: 24, days: 365, scope: 'birth' },
  progressoes: { key: 'progressoes', name: 'Progressões completas', description: 'Aspectos progredidos e de arco solar, marcos dos próximos 3 anos e todas as posições.', price: 24, scope: 'birth' },
  astrocarto: { key: 'astrocarto', name: 'Astrocartografia completa', description: 'Análise de qualquer cidade do mundo: linhas próximas e o que cada uma traz.', price: 24, scope: 'birth' },
  pacote: { key: 'pacote', name: 'Pacote Aniversário', description: 'Revolução Solar + comparador de cidades + previsão de 12 meses.', price: 89, days: 365, scope: 'birthYear' },
  estrela_mensal: { key: 'estrela_mensal', name: 'Plano Estrela · 1 mês', description: 'Acesso Estrela por 30 dias.', price: 29.9, plan: 'estrela', days: 30 },
  estrela_anual: { key: 'estrela_anual', name: 'Plano Estrela · 1 ano', description: 'Acesso Estrela por 365 dias.', price: 239, plan: 'estrela', days: 365 },
  cosmos_mensal: { key: 'cosmos_mensal', name: 'Plano Cosmos · 1 mês', description: 'Acesso Cosmos por 30 dias.', price: 49.9, plan: 'cosmos', days: 30 },
  cosmos_anual: { key: 'cosmos_anual', name: 'Plano Cosmos · 1 ano', description: 'Acesso Cosmos por 365 dias.', price: 399, plan: 'cosmos', days: 365 },
}

export const isProductKey = (k: unknown): k is ProductKey => typeof k === 'string' && k in PRODUCTS

/** Monthly analysis allowance per plan; free accounts get one welcome analysis. */
/** SHA-256 of the owner's e-mail (lower-case): unlimited analyses and full access, never stored in plain text. */
export const OWNER_EMAIL_HASHES = ['038af17a8e8b545e9547aaac6d35d608d98f92a05bb47142805ecb58e10f2510']

export const PLAN_ANALYSES: Record<PlanKey, number> = { estrela: 3, cosmos: 30 }
export const WELCOME_ANALYSES = 1
/** Generations allowed for each analysis bought separately (first + 2 new versions). */
export const GRANT_ANALYSES = 3
export const PROFILE_LIMIT = { anon: 2, free: 3, estrela: 10, cosmos: Infinity } as const

export interface Scope {
  birth?: string
  other?: string
  year?: number
}

const validId = (s: unknown): s is string => typeof s === 'string' && /^[a-z0-9]{4,40}$/.test(s)

/** Access keys a purchase unlocks, or null when the scope doesn't fit the product. */
export function grantKeys(product: ProductKey, scope: Scope): string[] | null {
  const p = PRODUCTS[product]
  if (p.plan) return []
  if (!validId(scope.birth)) return null
  const year = scope.year
  const yearOk = Number.isInteger(year) && year! > 1900 && year! < 2200
  switch (product) {
    case 'natal':
      return [natalKey(scope.birth)]
    case 'previsao12':
      return [forecastKey(scope.birth)]
    case 'retorno_lunar':
      return [lunarKey(scope.birth)]
    case 'progressoes':
      return [progressionsKey(scope.birth)]
    case 'astrocarto':
      return [astroMapKey(scope.birth)]
    case 'sinastria':
      return validId(scope.other) && scope.other !== scope.birth ? [pairKey(scope.birth, scope.other)] : null
    case 'revolucao':
      return yearOk ? [solarKey(scope.birth, year!)] : null
    case 'pacote':
      return yearOk ? [solarKey(scope.birth, year!), forecastKey(scope.birth)] : null
  }
  return null
}

export const natalKey = (birth: string) => `natal:${birth}`
export const forecastKey = (birth: string) => `previsao:${birth}`
export const solarKey = (birth: string, year: number) => `revolucao:${birth}:${year}`
export const lunarKey = (birth: string) => `retorno-lunar:${birth}`
export const progressionsKey = (birth: string) => `progressoes:${birth}`
export const astroMapKey = (birth: string) => `astrocartografia:${birth}`
export const pairKey = (a: string, b: string) => `sinastria:${[a, b].sort().join('+')}`

export interface Grant {
  key: string
  expiresAt: string | null
}

export interface AccessData {
  plan: PlanKey | null
  planUntil: string | null
  grants: Grant[]
  /** Analyses that used the plan allowance this calendar month (UTC). */
  planUsedThisMonth: number
  welcomeUsed: number
  /** Generations per access key paid by a grant. */
  usedByKey: Record<string, number>
}

export interface EntitlementRow { plan: string | null; plan_until: string | null }
export interface PurchaseRow { grants: string[] | null; expires_at: string | null }
export interface AnalysisLogRow { source: string; access_key: string; created_at: string }

/** Rows from entitlements / approved purchases / analysis_log → access summary. */
export function buildAccess(ent: EntitlementRow | null, purchases: PurchaseRow[], logs: AnalysisLogRow[], now = new Date()): AccessData {
  const since = Date.parse(monthStart(now))
  const usedByKey: Record<string, number> = {}
  let planUsedThisMonth = 0
  let welcomeUsed = 0
  for (const l of logs) {
    if (l.source === 'grant') usedByKey[l.access_key] = (usedByKey[l.access_key] ?? 0) + 1
    else if (l.source === 'plan' && Date.parse(l.created_at) >= since) planUsedThisMonth++
    else if (l.source === 'welcome') welcomeUsed++
  }
  const plan = ent?.plan === 'estrela' || ent?.plan === 'cosmos' ? ent.plan : null
  return {
    plan,
    planUntil: plan ? ent!.plan_until : null,
    grants: purchases.flatMap((p) => (p.grants ?? []).map((key) => ({ key, expiresAt: p.expires_at }))),
    planUsedThisMonth,
    welcomeUsed,
    usedByKey,
  }
}

/** Shape of an access key for each analysis kind (validated by the server). */
export function validAnalysisKey(kind: AnalysisKind, key: string): boolean {
  const id = '[a-z0-9]{4,40}'
  const re: Record<AnalysisKind, RegExp> = {
    natal: new RegExp(`^natal:${id}$`),
    previsao: new RegExp(`^previsao:${id}$`),
    sinastria: new RegExp(`^sinastria:${id}\\+${id}$`),
    revolucao: new RegExp(`^revolucao:${id}:\\d{4}$`),
  }
  return re[kind].test(key)
}

/** The single purchase that unlocks an analysis kind. */
export const OFFER_FOR: Record<AnalysisKind, ProductKey> = { natal: 'natal', sinastria: 'sinastria', revolucao: 'revolucao', previsao: 'previsao12' }

export const EMPTY_ACCESS: AccessData = { plan: null, planUntil: null, grants: [], planUsedThisMonth: 0, welcomeUsed: 0, usedByKey: {} }

export function activePlan(a: AccessData, now = new Date()): PlanKey | null {
  return a.plan && a.planUntil && Date.parse(a.planUntil) > now.getTime() ? a.plan : null
}

export function hasGrant(a: AccessData, key: string, now = new Date()): boolean {
  return a.grants.some((g) => g.key === key && (!g.expiresAt || Date.parse(g.expiresAt) > now.getTime()))
}

/** Full content of a feature: any active plan, or a purchase of that exact item. */
export const unlocked = (a: AccessData, key: string, now = new Date()) => !!activePlan(a, now) || hasGrant(a, key, now)

export type AnalysisSource = 'grant' | 'plan' | 'welcome'

export interface Allowance {
  ok: boolean
  source?: AnalysisSource
  /** Generations left from that source after this one is used. */
  left?: number
}

/** Which allowance pays for generating an analysis of `key`, if any. */
export function analysisAllowance(a: AccessData, key: string, now = new Date()): Allowance {
  if (hasGrant(a, key, now)) {
    const used = a.usedByKey[key] ?? 0
    if (used < GRANT_ANALYSES) return { ok: true, source: 'grant', left: GRANT_ANALYSES - used - 1 }
  }
  const plan = activePlan(a, now)
  if (plan && a.planUsedThisMonth < PLAN_ANALYSES[plan]) {
    return { ok: true, source: 'plan', left: PLAN_ANALYSES[plan] - a.planUsedThisMonth - 1 }
  }
  if (a.welcomeUsed < WELCOME_ANALYSES) return { ok: true, source: 'welcome', left: WELCOME_ANALYSES - a.welcomeUsed - 1 }
  return { ok: false }
}

/** End date after buying `days` more of `plan`: same plan extends, a different one starts now. */
export function extendPlan(current: { plan: PlanKey | null; planUntil: string | null }, plan: PlanKey, days: number, now = new Date()): string {
  const curEnd = current.planUntil ? Date.parse(current.planUntil) : 0
  const base = current.plan === plan && curEnd > now.getTime() ? curEnd : now.getTime()
  return new Date(base + days * 86400000).toISOString()
}

export const monthStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

/** Accept a payment when the amount paid covers the catalog price (cents rounding tolerated). */
export const paidEnough = (product: ProductKey, amount: number) => amount + 0.01 >= PRODUCTS[product].price

export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
