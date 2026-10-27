import { useState } from 'react'
import { PRODUCTS, formatBRL } from '../billing/rules'
import { useAccess, type Offer } from '../billing/context'
import { rememberReturn } from '../lib/auth'
import type { Route } from '../App'
import { t } from '../i18n'

interface Props {
  /** What the person gets by unlocking (one line). */
  title: string
  text?: string
  /** Single purchase that unlocks this content, besides the plans. */
  offer?: Offer
  go: (r: Route) => void
}

/** Placeholder for content that needs a login or a purchase. Renders nothing while payments are off. */
export function Locked({ title, text, offer, go }: Props) {
  const access = useAccess()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!access.enabled) return null
  if (access.loading) return <div className="loader"><span /> {t('Verificando seu acesso…')}</div>

  const buy = async () => {
    if (!offer) return
    setBusy(true)
    setError('')
    try {
      await access.buy(offer)
      if (access.simulated) setBusy(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <section className="glass pad locked">
      <span className="locked-icon" aria-hidden>✧</span>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {!access.loggedIn ? (
        <div className="locked-actions">
          <button className="cta" onClick={() => { rememberReturn(); go(access.simulated ? 'ajustes' : 'conta') }}><span>{t('Entrar grátis para ver')}</span></button>
          <p className="muted small">{t('Com Google ou e-mail, sem senha.')}</p>
        </div>
      ) : (
        <div className="locked-actions">
          {offer && (
            <button className="cta" disabled={busy} onClick={buy}>
              <span>{busy ? t('Abrindo pagamento…') : t('Liberar por {price}', { price: formatBRL(PRODUCTS[offer.product].price) })}</span>
            </button>
          )}
          <button className="ghost" onClick={() => go('planos')}>{t(offer ? 'Ou tudo liberado num plano · a partir de {price}/mês' : 'Ver planos · a partir de {price}/mês', { price: formatBRL(PRODUCTS.estrela_mensal.price) })}</button>
          {offer && <p className="muted small">{access.simulated ? `🧪 ${t('Simulação')} · ` : ''}{t('Pagamento único por Pix ou cartão')} · {t(PRODUCTS[offer.product].name)}{offer.label ? ` · ${offer.label}` : ''}</p>}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
