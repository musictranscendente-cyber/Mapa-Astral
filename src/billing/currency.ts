import { useSyncExternalStore } from 'react'
import type { Currency } from './rules'

/**
 * Brazil pays in reais through Mercado Pago (Pix, card, boleto); everyone else pays in
 * dollars through Stripe. Guessed from the device's time zone, and changeable on the Plans page.
 */
const KEY = 'cosmic-sky:currency'
const BRAZIL_ZONES = /^America\/(Sao_Paulo|Rio_Branco|Manaus|Cuiaba|Campo_Grande|Belem|Fortaleza|Recife|Maceio|Bahia|Araguaina|Santarem|Porto_Velho|Boa_Vista|Eirunepe|Noronha)$/

function detect(): Currency {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
    if (BRAZIL_ZONES.test(zone)) return 'BRL'
    if (zone) return 'USD'
  } catch { /* old browser */ }
  return navigator.language?.toLowerCase() === 'pt-br' ? 'BRL' : 'USD'
}

const listeners = new Set<() => void>()

export function getCurrency(): Currency {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'BRL' || saved === 'USD') return saved
  } catch { /* storage blocked */ }
  return detect()
}

export function setCurrency(c: Currency) {
  try { localStorage.setItem(KEY, c) } catch { /* storage blocked */ }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

export const useCurrency = () => useSyncExternalStore(subscribe, getCurrency, () => 'BRL' as Currency)
