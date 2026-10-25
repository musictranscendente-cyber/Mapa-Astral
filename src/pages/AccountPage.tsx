import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { authErrorMessage, deleteAccount, useLoginError, sendEmailCode, signInWithGoogle, signOut, verifyEmailCode } from '../lib/auth'
import type { SyncStatus } from '../lib/profiles'
import { authConfigured } from '../lib/supabase'
import { useAccess } from '../billing/context'
import { fetchPurchases, type PurchaseSummary } from '../billing/api'
import { PLAN_ANALYSES, PRODUCTS } from '../billing/rules'

interface Props {
  user: User | null
  loading: boolean
  sync: SyncStatus
  profileCount: number
  onClearLocal: () => void
}

const SYNC_LABEL: Record<SyncStatus, string> = {
  off: 'Sincronização desligada',
  syncing: 'Sincronizando seus mapas…',
  synced: 'Mapas sincronizados com a nuvem ✓',
  error: 'Não foi possível sincronizar agora — tentaremos de novo na próxima alteração.',
}

export function AccountPage({ user, loading, sync, profileCount, onClearLocal }: Props) {
  if (!authConfigured) {
    return (
      <div className="account">
        <header className="page-head">
          <p className="eyebrow">Sua conta</p>
          <h1 className="title-glow">Conta</h1>
        </header>
        <section className="glass pad account-card">
          <h2>Login em breve</h2>
          <p className="muted">
            O login com Google e e-mail ainda não foi ativado nesta versão do app. Seus mapas continuam salvos neste aparelho.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="account">
      <header className="page-head">
        <p className="eyebrow">Sua conta</p>
        <h1 className="title-glow">{user ? 'Minha conta' : 'Entrar'}</h1>
        {!user && <p className="muted">Entre para guardar seus mapas na nuvem e acessá-los em qualquer celular ou computador.</p>}
      </header>
      {loading ? (
        <div className="loader"><span /> Verificando sua sessão…</div>
      ) : user ? (
        <SignedIn user={user} sync={sync} profileCount={profileCount} onClearLocal={onClearLocal} />
      ) : (
        <SignIn />
      )}
    </div>
  )
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loginError, clearLoginError] = useLoginError()

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError('')
    clearLoginError()
    try { await fn() } catch (e) { setError(authErrorMessage(e)) } finally { setBusy(false) }
  }

  return (
    <section className="glass pad account-card sign-in">
      {loginError && <p className="error">{loginError}</p>}
      <button className="google-btn" disabled={busy} onClick={() => run(signInWithGoogle)}>
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.2 5.6c4.2-3.9 7.1-9.7 7.1-17.1z" />
          <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2.2 1.5-5 2.4-8.7 2.4-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
        </svg>
        Entrar com Google
      </button>

      <div className="divider"><span>ou com seu e-mail</span></div>

      {step === 'email' ? (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => { await sendEmailCode(email.trim()); setStep('code') }) }}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" required />
          </label>
          <button className="cta" type="submit" disabled={busy || !email.includes('@')}><span>✉ Receber código</span></button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); run(() => verifyEmailCode(email.trim(), code.trim())) }}>
          <p className="muted">Enviamos um código para <b>{email}</b>. Digite-o abaixo — ou toque no link do e-mail neste aparelho.</p>
          <label className="field">
            <span>Código</span>
            <input className="code-input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="000000" required />
          </label>
          <button className="cta" type="submit" disabled={busy || code.length < 6}><span>Entrar</span></button>
          <div className="head-tools left">
            <button type="button" className="link" disabled={busy} onClick={() => run(() => sendEmailCode(email.trim()))}>Reenviar código</button>
            <button type="button" className="link" onClick={() => { setStep('email'); setCode(''); setError('') }}>Usar outro e-mail</button>
          </div>
        </form>
      )}
      {busy && <div className="loader small"><span /></div>}
      {error && <p className="error">{error}</p>}
      <p className="muted small">Sem senha: você entra pelo Google ou por um código enviado ao seu e-mail. Os mapas deste aparelho são enviados para a sua conta ao entrar.</p>
      <p className="muted small">Ao entrar, você concorda com os <a href="#/termos">Termos de Uso</a> e a <a href="#/privacidade">Política de Privacidade</a>.</p>
    </section>
  )
}

function SignedIn({ user, sync, profileCount, onClearLocal }: { user: User; sync: SyncStatus; profileCount: number; onClearLocal: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Você'
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const provider = user.app_metadata?.provider === 'google' ? 'Google' : 'e-mail'

  return (
    <>
      <section className="glass pad account-card">
        <div className="account-head">
          {avatar ? <img className="avatar" src={avatar} alt="" referrerPolicy="no-referrer" /> : <span className="avatar letter">{name.charAt(0).toUpperCase()}</span>}
          <div>
            <h3>{name}</h3>
            <p className="muted small">{name !== user.email && `${user.email} · `}entrou com {provider}</p>
          </div>
        </div>
        <p className={`sync-line ${sync}`}>{SYNC_LABEL[sync]}</p>
        <p className="muted small">{profileCount} {profileCount === 1 ? 'mapa salvo' : 'mapas salvos'} na sua conta.</p>
        <div className="head-tools left">
          <button className="ghost" onClick={() => signOut()}>Sair</button>
          <button className="ghost" onClick={async () => { await signOut(); onClearLocal() }}>Sair e apagar mapas deste aparelho</button>
        </div>
      </section>

      <MyAccess />

      <section className="glass pad account-card danger-zone">
        <h2>Excluir conta</h2>
        <p className="muted">Apaga seu login e todos os mapas guardados na nuvem. Essa ação não pode ser desfeita.</p>
        {!confirming ? (
          <button className="ghost danger" onClick={() => setConfirming(true)}>Excluir minha conta</button>
        ) : (
          <div className="head-tools left">
            <button
              className="ghost danger"
              onClick={async () => {
                try { await deleteAccount(); onClearLocal() } catch { setError('Não foi possível excluir agora. Tente novamente.') }
              }}
            >
              Sim, excluir definitivamente
            </button>
            <button className="ghost" onClick={() => setConfirming(false)}>Cancelar</button>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </>
  )
}

function MyAccess() {
  const access = useAccess()
  const [purchases, setPurchases] = useState<PurchaseSummary[]>([])
  useEffect(() => {
    if (!access.enabled) return
    fetchPurchases().then(setPurchases, () => {})
  }, [access.enabled, access.data])
  if (!access.enabled) return null

  const plan = access.plan
  const until = access.data.planUntil ? new Date(access.data.planUntil).toLocaleDateString('pt-BR', { dateStyle: 'long' }) : ''
  return (
    <section className="glass pad account-card">
      <h2>Meu acesso</h2>
      {plan ? (
        <p>
          Plano <b>{plan === 'cosmos' ? 'Cosmos' : 'Estrela'}</b> ativo até {until} ·{' '}
          {Math.max(0, PLAN_ANALYSES[plan] - access.data.planUsedThisMonth)} de {PLAN_ANALYSES[plan]} análises disponíveis neste mês.
        </p>
      ) : (
        <p className="muted">
          Conta gratuita{access.data.welcomeUsed === 0 ? ' · sua primeira análise completa é um presente' : ''}.
        </p>
      )}
      {purchases.length > 0 && (
        <ul className="purchase-list">
          {purchases.map((p) => (
            <li key={p.id}>
              <span>{PRODUCTS[p.product]?.name ?? p.product}{p.label ? ` · ${p.label}` : ''}</span>
              <small className="muted">
                {new Date(p.created_at).toLocaleDateString('pt-BR')}
                {p.expires_at && !PRODUCTS[p.product]?.plan ? ` · válida até ${new Date(p.expires_at).toLocaleDateString('pt-BR')}` : ''}
              </small>
            </li>
          ))}
        </ul>
      )}
      <a className="ghost inline" href="#/planos">{plan ? 'Renovar ou mudar de plano' : 'Ver planos e análises'}</a>
    </section>
  )
}
