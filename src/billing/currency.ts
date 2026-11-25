import { getLang } from '../i18n'
import type { Currency } from './rules'

/**
 * Each visitor sees a single currency, never both side by side:
 * the app in Portuguese on a device in Brazil pays in reais through Mercado Pago (Pix, card,
 * boleto); every other combination pays in dollars through Stripe.
 */
const BRAZIL_ZONES = /^America\/(Sao_Paulo|Rio_Branco|Manaus|Cuiaba|Campo_Grande|Belem|Fortaleza|Recife|Maceio|Bahia|Araguaina|Santarem|Porto_Velho|Boa_Vista|Eirunepe|Noronha)$/

function inBrazil(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
    if (zone) return BRAZIL_ZONES.test(zone)
  } catch { /* old browser */ }
  return navigator.language?.toLowerCase() === 'pt-br'
}

export const getCurrency = (): Currency => (getLang() === 'pt' && inBrazil() ? 'BRL' : 'USD')

/** The language picker remounts the app, so a plain read stays in sync. */
export const useCurrency = getCurrency
