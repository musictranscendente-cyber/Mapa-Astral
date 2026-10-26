import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  OWNER_EMAIL_HASHES, PRODUCTS, buildAccess, extendPlan, grantKeys,
  type AccessData, type AnalysisLogRow, type AnalysisSource, type PlanKey, type ProductKey, type Scope,
} from './rules'

/**
 * Owner-only simulator: pick a plan and spend a fictitious balance on purchases, without
 * Mercado Pago. Lives only in this device's storage and only applies to the owner's account.
 */


export const SIM_START_BALANCE = 500

export interface SimPurchase {
  id: string
  product: ProductKey
  label: string
  grants: string[]
  price: number
  at: string
  expiresAt: string | null
}

export interface SimState {
  on: boolean
  loggedIn: boolean
  plan: PlanKey | null
  planUntil: string | null
  balance: number
  purchases: SimPurchase[]
  logs: AnalysisLogRow[]
}

const KEY = 'mapa-astral:simulacao'
export const DEFAULT_SIM: SimState = { on: false, loggedIn: true, plan: null, planUntil: null, balance: SIM_START_BALANCE, purchases: [], logs: [] }

let cache: SimState | null = null
const listeners = new Set<() => void>()

export function getSim(): SimState {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? { ...DEFAULT_SIM, ...(JSON.parse(raw) as Partial<SimState>) } : DEFAULT_SIM
  } catch {
    cache = DEFAULT_SIM
  }
  return cache
}

export function setSim(update: Partial<SimState> | ((s: SimState) => Partial<SimState>)) {
  const cur = getSim()
  cache = { ...cur, ...(typeof update === 'function' ? update(cur) : update) }
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* storage unavailable */ }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export const useSim = () => useSyncExternalStore(subscribe, getSim, getSim)

export function simAccess(s: SimState): AccessData {
  return buildAccess(
    s.plan ? { plan: s.plan, plan_until: s.planUntil } : null,
    s.purchases.map((p) => ({ grants: p.grants, expires_at: p.expiresAt })),
    s.logs,
  )
}

/** Spends the fictitious balance; plans start or extend exactly like a real payment. */
export function simBuy(product: ProductKey, scope: Scope, label: string) {
  const p = PRODUCTS[product]
  const s = getSim()
  if (s.balance + 0.001 < p.price) throw new Error(`Saldo fictício insuficiente (faltam ${(p.price - s.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}). Adicione saldo em Ajustes.`)
  const grants = grantKeys(product, scope)
  if (!grants) throw new Error('Dados da compra incompletos.')
  const now = new Date()
  const planUntil = p.plan ? extendPlan({ plan: s.plan, planUntil: s.planUntil }, p.plan, p.days ?? 30, now) : null
  const purchase: SimPurchase = {
    id: crypto.randomUUID(),
    product,
    label,
    grants,
    price: p.price,
    at: now.toISOString(),
    expiresAt: p.plan ? planUntil : p.days ? new Date(now.getTime() + p.days * 86400000).toISOString() : null,
  }
  setSim({
    balance: Math.round((s.balance - p.price) * 100) / 100,
    purchases: [purchase, ...s.purchases],
    ...(p.plan ? { plan: p.plan, planUntil, loggedIn: true } : {}),
  })
}

export function simRecordUse(kind: string, key: string, source: AnalysisSource) {
  setSim((s) => ({ logs: [...s.logs, { source, access_key: key, created_at: new Date().toISOString(), kind } as AnalysisLogRow] }))
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** True when the signed-in e-mail belongs to the app owner. */
export function useIsOwner(email: string | null | undefined): boolean {
  const [hit, setHit] = useState<{ email: string; ok: boolean } | null>(null)
  useEffect(() => {
    if (!email || !crypto.subtle) return
    let cancelled = false
    sha256(email.trim().toLowerCase()).then((h) => { if (!cancelled) setHit({ email, ok: OWNER_EMAIL_HASHES.includes(h) }) })
    return () => { cancelled = true }
  }, [email])
  return !!email && hit?.email === email && hit.ok
}
