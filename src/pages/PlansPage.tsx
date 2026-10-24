import { useEffect, useState } from 'react'
import type { Chart } from '../astro/chart'
import { currentReturnYear } from '../astro/solarReturn'
import { useAccess, type Offer } from '../billing/context'
import { birthKey } from '../billing/keys'
import { PLAN_ANALYSES, PRODUCTS, PROFILE_LIMIT, formatBRL, type ProductKey } from '../billing/rules'
import { rememberReturn } from '../lib/auth'
import type { Route } from '../App'

interface Props {
  natal: Chart | null
  go: (r: Route) => void
}

const PLAN_FEATURES = {
  estrela: [
    `Até ${PROFILE_LIMIT.estrela} mapas salvos`,
    'Previsões de até 1 ano e linha do tempo completa',
    'Sinastria completa, sem limite',
    'Revolução Solar completa de qualquer ano + comparador de cidades',
    'Retorno Lunar completo: o mapa de todo mês',
    'Progressões e arcos solares com os marcos dos próximos anos',
    'Astrocartografia com análise de qualquer cidade',
    `${PLAN_ANALYSES.estrela} análises completas por mês`,
  ],
  cosmos: [
    'Mapas ilimitados (família, amigos, clientes)',
    'Tudo do plano Estrela',
    `Até ${PLAN_ANALYSES.cosmos} análises completas por mês`,
    'Ideal para quem estuda ou atende com astrologia',
  ],
}

/** Status of a payment coming back from Mercado Pago (`#/planos?status=approved…`). */
const returnStatus = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('status')

export function PlansPage({ natal, go }: Props) {
  const access = useAccess()
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
      if (access.simulated) { setDone(PRODUCTS[k].name); setBusy('') }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy('')
    }
  }

  if (!access.enabled) {
    return (
      <div className="plans">
        <header className="page-head">
          <p className="eyebrow">Planos</p>
          <h1 className="title-glow">Em breve</h1>
          <p className="muted">Por enquanto, todos os recursos do app estão liberados.</p>
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
    { icon: '✧', offer: { product: 'previsao12', scope: { birth: bk }, label: name } },
    { icon: '✦', offer: { product: 'pacote', scope: { birth: bk, year }, label: `${name} · ${year}` } },
  ] : []
  const until = access.data.planUntil ? new Date(access.data.planUntil).toLocaleDateString('pt-BR', { dateStyle: 'long' }) : ''

  return (
    <div className="plans">
      <header className="page-head">
        <p className="eyebrow">Planos e análises</p>
        <h1 className="title-glow">Vá mais fundo no seu céu</h1>
        <p className="muted">O cálculo do mapa é sempre grátis. Os planos liberam as análises completas, as previsões longas e as comparações.</p>
      </header>

      {access.simulated && <p className="glass pad notice sim">🧪 Simulação ligada: as compras usam o saldo fictício de Ajustes e nada é cobrado.</p>}
      {done && <p className="glass pad notice good">✓ Compra simulada concluída: {done}. O acesso já está liberado.</p>}
      {status === 'approved' && <p className="glass pad notice good">✓ Pagamento aprovado! Seu acesso é liberado em instantes.</p>}
      {(status === 'pending' || status === 'in_process') && <p className="glass pad notice">⏳ Pagamento em processamento. Assim que for confirmado (no Pix, em segundos), o acesso é liberado automaticamente.</p>}
      {status === 'rejected' && <p className="glass pad notice bad">O pagamento não foi aprovado. Você pode tentar de novo com outra forma de pagamento.</p>}

      {access.plan && (
        <section className="glass pad current-plan">
          <p className="eyebrow">Seu plano</p>
          <h2>{access.plan === 'cosmos' ? '🌌 Cosmos' : '✦ Estrela'}</h2>
          <p className="muted">
            Ativo até {until} · {Math.max(0, PLAN_ANALYSES[access.plan] - access.data.planUsedThisMonth)} de {PLAN_ANALYSES[access.plan]} análises disponíveis neste mês.
            Para continuar depois dessa data, renove abaixo: o tempo é somado ao que falta.
          </p>
        </section>
      )}

      <section className="plan-cards">
        <PlanCard
          title="✦ Estrela" tagline="Para acompanhar o seu céu no dia a dia"
          monthly="estrela_mensal" yearly="estrela_anual" features={PLAN_FEATURES.estrela}
          current={access.plan === 'estrela'} busy={busy} onBuy={buy}
        />
        <PlanCard
          title="🌌 Cosmos" tagline="Para apaixonados e profissionais da astrologia"
          monthly="cosmos_mensal" yearly="cosmos_anual" features={PLAN_FEATURES.cosmos}
          current={access.plan === 'cosmos'} busy={busy} onBuy={buy} featured
        />
      </section>
      <p className="muted small center">
        Pagamento por Pix ou cartão pelo Mercado Pago. Sem renovação automática: você escolhe se quer continuar.
        Trocar de plano começa um novo período a partir do dia da compra. Veja os <a href="#/termos">Termos de Uso</a>.
      </p>

      <section className="glass pad">
        <h2>Análises avulsas</h2>
        <p className="muted">Pague uma vez e a análise fica com você para sempre.{natal?.birth ? ` Para o mapa de ${name}:` : ''}</p>
        {singles.length === 0 ? (
          <p>Crie seu mapa para ver as análises disponíveis. <button className="link" onClick={() => go('inicio')}>Criar mapa</button></p>
        ) : (
          <div className="single-list">
            {singles.map(({ offer, icon }) => {
              const p = PRODUCTS[offer.product]
              return (
                <article key={p.key} className={`single ${p.key === 'pacote' ? 'featured' : ''}`}>
                  <span className="single-icon">{icon}</span>
                  <div>
                    <h3>{p.name}{p.key === 'pacote' && <span className="badge">Mais vantajoso</span>}</h3>
                    <p className="muted small">{p.description}</p>
                  </div>
                  <button className="ghost" disabled={!!busy} onClick={() => buy(offer)}>
                    {busy === p.key ? 'Abrindo…' : formatBRL(p.price)}
                  </button>
                </article>
              )
            })}
            <article className="single">
              <span className="single-icon">♡</span>
              <div>
                <h3>{PRODUCTS.sinastria.name}</h3>
                <p className="muted small">Escolha as duas pessoas na página de Sinastria.</p>
              </div>
              <button className="ghost" onClick={() => go('sinastria')}>{formatBRL(PRODUCTS.sinastria.price)}</button>
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
  onBuy: (k: ProductKey) => void
}

function PlanCard({ title, tagline, monthly, yearly, features, current, featured, busy, onBuy }: CardProps) {
  const m = PRODUCTS[monthly]
  const y = PRODUCTS[yearly]
  const saving = Math.round((1 - y.price / (m.price * 12)) * 100)
  return (
    <article className={`glass pad plan-card ${featured ? 'featured' : ''}`}>
      {featured && <span className="badge">Mais completo</span>}
      <h2>{title}</h2>
      <p className="muted">{tagline}</p>
      <p className="plan-price">{formatBRL(m.price)}<small>/mês</small></p>
      <ul className="plan-features">{features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
      <div className="plan-buttons">
        <button className="cta" disabled={!!busy} onClick={() => onBuy(yearly)}>
          <span>{busy === yearly ? 'Abrindo…' : `${current ? 'Renovar' : 'Assinar'} 1 ano · ${formatBRL(y.price)}`}</span>
        </button>
        <small className="muted">Economize {saving}% no anual</small>
        <button className="ghost" disabled={!!busy} onClick={() => onBuy(monthly)}>
          {busy === monthly ? 'Abrindo…' : `${current ? 'Renovar' : 'Assinar'} 1 mês · ${formatBRL(m.price)}`}
        </button>
      </div>
    </article>
  )
}
