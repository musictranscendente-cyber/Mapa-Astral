import { useEffect, useState } from 'react'
import type { Chart } from '../astro/chart'
import { currentReturnYear } from '../astro/solarReturn'
import { useAccess, type Offer } from '../billing/context'
import { setCurrency, useCurrency } from '../billing/currency'
import { birthKey } from '../billing/keys'
import { PLAN_ANALYSES, PRODUCTS, PROFILE_LIMIT, formatPrice, priceOf, type Currency, type ProductKey } from '../billing/rules'
import { rememberReturn } from '../lib/auth'
import type { Route } from '../App'
import { locale, t } from '../i18n'

interface Props {
  natal: Chart | null
  go: (r: Route) => void
}

const planFeatures = () => ({
  estrela: [
    t('Até {n} mapas salvos', { n: PROFILE_LIMIT.estrela }),
    t('Previsões de até 1 ano e linha do tempo completa'),
    t('Sinastria completa, sem limite'),
    t('Revolução Solar completa de qualquer ano + comparador de cidades'),
    t('Retorno Lunar completo: o mapa de todo mês'),
    t('Progressões e arcos solares com os marcos dos próximos anos'),
    t('Astrocartografia com análise de qualquer cidade'),
    t('{n} análises completas por mês, em qualquer serviço', { n: PLAN_ANALYSES.estrela }),
    t('Gere novas versões das análises usando a cota do mês'),
  ],
  cosmos: [
    t('Mapas ilimitados (família, amigos, clientes)'),
    t('Tudo do plano Estrela'),
    t('Até {n} análises completas por mês, em qualquer serviço', { n: PLAN_ANALYSES.cosmos }),
    t('Ideal para quem estuda ou atende com astrologia'),
  ],
})

/** Status of a payment coming back from the checkout (`#/planos?status=approved…`). */
const returnStatus = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('status')

export function PlansPage({ natal, go }: Props) {
  const access = useAccess()
  const currency = useCurrency()
  // The simulator always uses the fictitious balance in reais.
  const cur: Currency = access.simulated ? 'BRL' : currency
  const price = (k: ProductKey) => formatPrice(priceOf(k, cur), cur)
  const [busy, setBusy] = useState<string>('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [status] = useState(returnStatus)
  const refresh = access.refresh

  // After paying, the webhook may take a few seconds: refresh until the purchase shows up.
  useEffect(() => {
    if (status !== 'approved' && status !== 'pending' && status !== 'in_process') return
    let n = 0
    const id = setInterval(() => {
      refresh()
      if (++n >= 10) clearInterval(id)
    }, 3000)
    return () => clearInterval(id)
  }, [status, refresh])

  const buy = async (offer: Offer | ProductKey) => {
    if (!access.loggedIn) { rememberReturn(); go(access.simulated ? 'ajustes' : 'conta'); return }
    const k = typeof offer === 'string' ? offer : offer.product
    setBusy(k)
    setError('')
    setDone('')
    try {
      await access.buy(offer)
      // Real purchases leave for Mercado Pago; simulated ones finish here.
      if (access.simulated) { setDone(t(PRODUCTS[k].name)); setBusy('') }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy('')
    }
  }

  if (!access.enabled) {
    return (
      <div className="plans">
        <header className="page-head">
          <p className="eyebrow">{t('Planos')}</p>
          <h1 className="title-glow">{t('Em breve')}</h1>
          <p className="muted">{t('Por enquanto, todos os recursos do app estão liberados.')}</p>
        </header>
      </div>
    )
  }

  const bk = natal?.birth ? birthKey(natal.birth) : ''
  const name = natal?.birth?.name ?? ''
  const year = natal ? currentReturnYear(natal) : 0
  const singles: { offer: Offer; icon: string }[] = natal?.birth ? [
    { icon: '☉', offer: { product: 'natal', scope: { birth: bk }, label: name } },
    { icon: '☼', offer: { product: 'revolucao', scope: { birth: bk, year }, label: `${name} · ${year}` } },
    { icon: '✧', offer: { product: 'previsao30', scope: { birth: bk }, label: name } },
    { icon: '✧', offer: { product: 'previsao90', scope: { birth: bk }, label: name } },
    { icon: '✧', offer: { product: 'previsao12', scope: { birth: bk }, label: name } },
    { icon: '✦', offer: { product: 'pacote', scope: { birth: bk, year }, label: `${name} · ${year}` } },
    { icon: '☾', offer: { product: 'retorno_lunar', scope: { birth: bk }, label: name } },
    { icon: '➶', offer: { product: 'progressoes', scope: { birth: bk }, label: name } },
    { icon: '⌖', offer: { product: 'astrocarto', scope: { birth: bk }, label: name } },
  ] : []
  const until = access.data.planUntil ? new Date(access.data.planUntil).toLocaleDateString(locale(), { dateStyle: 'long' }) : ''

  return (
    <div className="plans">
      <header className="page-head">
        <p className="eyebrow">{t('Planos e análises')}</p>
        <h1 className="title-glow">{t('Vá mais fundo no seu céu')}</h1>
        <p className="muted">{t('O cálculo do mapa é sempre grátis. Os planos liberam as análises completas, as previsões longas e as comparações.')}</p>
        {!access.simulated && (
          <div className="segmented small currency-switch" role="group" aria-label={t('Moeda')}>
            <button className={cur === 'BRL' ? 'active' : ''} onClick={() => setCurrency('BRL')}>🇧🇷 R$ · {t('Brasil')}</button>
            <button className={cur === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>🌎 US$ · {t('Internacional')}</button>
          </div>
        )}
      </header>

      {access.simulated && <p className="glass pad notice sim">🧪 {t('Simulação ligada: as compras usam o saldo fictício de Ajustes e nada é cobrado.')}</p>}
      {done && <p className="glass pad notice good">✓ {t('Compra simulada concluída: {item}. O acesso já está liberado.', { item: done })}</p>}
      {status === 'approved' && <p className="glass pad notice good">✓ {t('Pagamento aprovado! Seu acesso é liberado em instantes.')}</p>}
      {(status === 'pending' || status === 'in_process') && <p className="glass pad notice">⏳ {t('Pagamento em processamento. Assim que for confirmado (no Pix, em segundos), o acesso é liberado automaticamente.')}</p>}
      {status === 'rejected' && <p className="glass pad notice bad">{t('O pagamento não foi aprovado. Você pode tentar de novo com outra forma de pagamento.')}</p>}

      {access.plan && (
        <section className="glass pad current-plan">
          <p className="eyebrow">{t('Seu plano')}</p>
          <h2>{access.plan === 'cosmos' ? '🌌 Cosmos' : '✦ Estrela'}</h2>
          <p className="muted">
            {t('Ativo até {date} · {left} de {total} análises disponíveis neste mês.', { date: until, left: Math.max(0, PLAN_ANALYSES[access.plan] - access.data.planUsedThisMonth), total: PLAN_ANALYSES[access.plan] })}{' '}
            {t('Para continuar depois dessa data, renove abaixo: o tempo é somado ao que falta.')}
          </p>
        </section>
      )}

      <section className="plan-cards">
        <PlanCard
          title="✦ Estrela" tagline={t('Para acompanhar o seu céu no dia a dia')}
          monthly="estrela_mensal" yearly="estrela_anual" features={planFeatures().estrela} price={price}
          current={access.plan === 'estrela'} busy={busy} onBuy={buy}
        />
        <PlanCard
          title="🌌 Cosmos" tagline={t('Para apaixonados e profissionais da astrologia')}
          monthly="cosmos_mensal" yearly="cosmos_anual" features={planFeatures().cosmos} price={price}
          current={access.plan === 'cosmos'} busy={busy} onBuy={buy} featured
        />
      </section>
      <p className="muted small center">
        {t(cur === 'USD' ? 'Pagamento com cartão pelo Stripe, em dólares.' : 'Pagamento por Pix ou cartão pelo Mercado Pago.')}{' '}
        {t('Sem renovação automática: você escolhe se quer continuar. Trocar de plano começa um novo período a partir do dia da compra.')}{' '}
        <a href="#/termos">{t('Termos de Uso')}</a>
      </p>

      <section className="glass pad">
        <h2>{t('Análises avulsas')}</h2>
        <p className="muted">{t('Pague uma vez: cada serviço fica liberado para o mapa escolhido, com uma análise completa incluída quando houver.')}{natal?.birth ? ` ${t('Para o mapa de {name}:', { name })}` : ''}</p>
        {singles.length === 0 ? (
          <p>{t('Crie seu mapa para ver as análises disponíveis.')} <button className="link" onClick={() => go('inicio')}>{t('Criar mapa')}</button></p>
        ) : (
          <div className="single-list">
            {singles.map(({ offer, icon }) => {
              const p = PRODUCTS[offer.product]
              return (
                <article key={p.key} className={`single ${p.key === 'pacote' ? 'featured' : ''}`}>
                  <span className="single-icon">{icon}</span>
                  <div>
                    <h3>{t(p.name)}{p.key === 'pacote' && <span className="badge">{t('Mais vantajoso')}</span>}</h3>
                    <p className="muted small">{t(p.description)}</p>
                  </div>
                  <button className="ghost" disabled={!!busy} onClick={() => buy(offer)}>
                    {busy === p.key ? t('Abrindo…') : price(p.key)}
                  </button>
                </article>
              )
            })}
            <article className="single">
              <span className="single-icon">♡</span>
              <div>
                <h3>{t(PRODUCTS.sinastria.name)}</h3>
                <p className="muted small">{t('Escolha as duas pessoas na página de Sinastria.')}</p>
              </div>
              <button className="ghost" onClick={() => go('sinastria')}>{price('sinastria')}</button>
            </article>
          </div>
        )}
      </section>

      {error && <p className="error center">{error}</p>}
    </div>
  )
}

interface CardProps {
  title: string
  tagline: string
  monthly: ProductKey
  yearly: ProductKey
  features: string[]
  current: boolean
  featured?: boolean
  busy: string
  price: (k: ProductKey) => string
  onBuy: (k: ProductKey) => void
}

function PlanCard({ title, tagline, monthly, yearly, features, current, featured, busy, price, onBuy }: CardProps) {
  const m = PRODUCTS[monthly]
  const y = PRODUCTS[yearly]
  const saving = Math.round((1 - y.price / (m.price * 12)) * 100)
  return (
    <article className={`glass pad plan-card ${featured ? 'featured' : ''}`}>
      {featured && <span className="badge">{t('Mais completo')}</span>}
      <h2>{title}</h2>
      <p className="muted">{tagline}</p>
      <p className="plan-price">{price(monthly)}<small>{t('/mês')}</small></p>
      <ul className="plan-features">{features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
      <div className="plan-buttons">
        <button className="cta" disabled={!!busy} onClick={() => onBuy(yearly)}>
          <span>{busy === yearly ? t('Abrindo…') : `${t(current ? 'Renovar 1 ano' : 'Assinar 1 ano')} · ${price(yearly)}`}</span>
        </button>
        <small className="muted">{t('Economize {n}% no anual', { n: saving })}</small>
        <button className="ghost" disabled={!!busy} onClick={() => onBuy(monthly)}>
          {busy === monthly ? t('Abrindo…') : `${t(current ? 'Renovar 1 mês' : 'Assinar 1 mês')} · ${price(monthly)}`}
        </button>
      </div>
    </article>
  )
}
