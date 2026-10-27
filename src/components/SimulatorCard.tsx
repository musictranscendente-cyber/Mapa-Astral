import { useState } from 'react'
import { PLAN_ANALYSES, PRODUCTS, formatBRL, type PlanKey } from '../billing/rules'
import { DEFAULT_SIM, SIM_START_BALANCE, setSim, simAccess, useSim } from '../billing/sim'
import { useAccess } from '../billing/context'
import type { Route } from '../App'
import { locale } from '../i18n'

type Tier = 'anon' | 'free' | PlanKey

const TIERS: { key: Tier; label: string }[] = [
  { key: 'anon', label: 'Sem login' },
  { key: 'free', label: 'Conta grátis' },
  { key: 'estrela', label: '✦ Estrela' },
  { key: 'cosmos', label: '🌌 Cosmos' },
]

const in30days = () => new Date(Date.now() + 30 * 86400000).toISOString()

/** Owner-only panel in Ajustes: choose the plan and spend a fictitious balance. */
export function SimulatorCard({ go }: { go: (r: Route) => void }) {
  const sim = useSim()
  const [confirmReset, setConfirmReset] = useState(false)
  const data = simAccess(sim)
  const access = useAccess()
  const planActive = !!access.plan
  const tier: Tier = !sim.loggedIn ? 'anon' : access.plan ?? 'free'
  const grantUses = Object.values(data.usedByKey).reduce((a, b) => a + b, 0)

  const chooseTier = (t: Tier) => {
    if (t === 'anon') setSim({ loggedIn: false })
    else if (t === 'free') setSim({ loggedIn: true, plan: null, planUntil: null })
    else setSim({ loggedIn: true, plan: t, planUntil: in30days() })
  }

  const undo = (id: string) => setSim((s) => {
    const p = s.purchases.find((x) => x.id === id)
    if (!p) return {}
    const isPlan = !!PRODUCTS[p.product].plan
    return {
      purchases: s.purchases.filter((x) => x.id !== id),
      balance: Math.round((s.balance + p.price) * 100) / 100,
      ...(isPlan ? { plan: null, planUntil: null } : {}),
    }
  })

  return (
    <section className="glass pad settings-card sim-card">
      <div className="section-title">
        <h2>🧪 Simulador de planos</h2>
        <span className="sim-badge">Só você vê</span>
      </div>
      <p className="muted">
        Teste o app como um cliente: escolha o nível de acesso e compre avulsos com um saldo fictício.
        Nada é cobrado, e a simulação vale só neste aparelho.
      </p>

      <label className="check sim-toggle">
        <input type="checkbox" checked={sim.on} onChange={(e) => setSim({ on: e.target.checked })} />
        <span>{sim.on ? 'Simulação ligada' : 'Ligar simulação'}</span>
      </label>

      {sim.on && (
        <>
          <p className="eyebrow">Ver o app como</p>
          <div className="segmented small left">
            {TIERS.map((t) => (
              <button key={t.key} className={tier === t.key ? 'active' : ''} onClick={() => chooseTier(t.key)}>{t.label}</button>
            ))}
          </div>
          {planActive && (
            <p className="muted small">
              Plano ativo até {new Date(sim.planUntil!).toLocaleDateString(locale())} · {Math.max(0, PLAN_ANALYSES[sim.plan!] - data.planUsedThisMonth)} de {PLAN_ANALYSES[sim.plan!]} análises disponíveis neste mês.
            </p>
          )}

          <div className="sim-balance">
            <div>
              <p className="eyebrow">Saldo fictício</p>
              <p className="sim-amount">{formatBRL(sim.balance)}</p>
            </div>
            <div className="head-tools left">
              <button className="ghost" onClick={() => setSim((s) => ({ balance: s.balance + 100 }))}>+ R$ 100</button>
              <button className="ghost" onClick={() => setSim((s) => ({ balance: s.balance + 500 }))}>+ R$ 500</button>
              <button className="ghost" onClick={() => go('planos')}>💎 Ir para Planos</button>
            </div>
          </div>

          <p className="eyebrow">Compras simuladas</p>
          {sim.purchases.length === 0 ? (
            <p className="muted small">Nenhuma ainda. Toque em "Liberar por…" em qualquer tela bloqueada ou compre em Planos.</p>
          ) : (
            <ul className="purchase-list">
              {sim.purchases.map((p) => (
                <li key={p.id}>
                  <span>{PRODUCTS[p.product].name}{p.label ? ` · ${p.label}` : ''}</span>
                  <span className="sim-row-end">
                    <small className="muted">{formatBRL(p.price)}</small>
                    <button className="link" onClick={() => undo(p.id)}>desfazer</button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="eyebrow">Análises completas usadas</p>
          <p className="muted small">
            Boas-vindas: {data.welcomeUsed} de 1 · do plano neste mês: {data.planUsedThisMonth} · de compras avulsas: {grantUses}
          </p>

          <div className="head-tools left">
            <button className="ghost" onClick={() => setSim({ logs: [] })}>Zerar análises usadas</button>
            {!confirmReset ? (
              <button className="ghost danger" onClick={() => setConfirmReset(true)}>Recomeçar simulação</button>
            ) : (
              <>
                <button className="ghost danger" onClick={() => { setSim({ ...DEFAULT_SIM, on: true }); setConfirmReset(false) }}>
                  Sim, apagar compras e voltar a {formatBRL(SIM_START_BALANCE)}
                </button>
                <button className="ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  )
}
