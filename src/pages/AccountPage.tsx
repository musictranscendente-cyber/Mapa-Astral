import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { authErrorMessage, deleteAccount, useLoginError, sendEmailCode, signInWithGoogle, signOut, verifyEmailCode } from '../lib/auth'
import type { SyncStatus } from '../lib/profiles'
import { authConfigured } from '../lib/supabase'
import { useAccess } from '../billing/context'
import { fetchPurchases, redeemCode, type PurchaseSummary } from '../billing/api'
import { PLAN_ANALYSES, PRODUCTS } from '../billing/rules'
import { locale, t } from '../i18n'

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
          <p className="eyebrow">{t('Sua conta')}</p>
          <h1 className="title-glow">{t('Conta')}</h1>
        </header>
        <section className="glass pad account-card">
          <h2>{t('Login em breve')}</h2>
          <p className="muted">
            {t('O login com Google e e-mail ainda não foi ativado nesta versão do app. Seus mapas continuam salvos neste aparelho.')}
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="account">
      <header className="page-head">
        <p className="eyebrow">{t('Sua conta')}</p>
        <h1 className="title-glow">{user ? t('Minha conta') : t('Entrar')}</h1>
        {!user && <p className="muted">{t('Entre para guardar seus mapas na nuvem e acessá-los em qualquer celular ou computador.')}</p>}
      </header>
      {loading ? (
        <div className="loader"><span /> {t('Verificando sua sessão…')}</div>
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
        {t('Entrar com Google')}
      </button>

      <div className="divider"><span>{t('ou com seu e-mail')}</span></div>

      {step === 'email' ? (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => { await sendEmailCode(email.trim()); setStep('code') }) }}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('voce@exemplo.com')} autoComplete="email" required />
          </label>
          <button className="cta" type="submit" disabled={busy || !email.includes('@')}><span>✉ {t('Receber código')}</span></button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); run(() => verifyEmailCode(email.trim(), code.trim())) }}>
          <p className="muted">{t('Enviamos um código para {email}. Digite-o abaixo — ou toque no link do e-mail neste aparelho.', { email })}</p>
          <label className="field">
            <span>{t('Código')}</span>
            <input className="code-input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="000000" required />
          </label>
          <button className="cta" type="submit" disabled={busy || code.length < 6}><span>{t('Entrar')}</span></button>
          <div className="head-tools left">
            <button type="button" className="link" disabled={busy} onClick={() => run(() => sendEmailCode(email.trim()))}>{t('Reenviar código')}</button>
            <button type="button" className="link" onClick={() => { setStep('email'); setCode(''); setError('') }}>Usar outro e-mail</button>
          </div>
        </form>
      )}
      {busy && <div className="loader small"><span /></div>}
      {error && <p className="error">{error}</p>}
      <p className="muted small">{t('Sem senha: você entra pelo Google ou por um código enviado ao seu e-mail. Os mapas deste aparelho são enviados para a sua conta ao entrar.')}</p>
      <p className="muted small">{t('Ao entrar, você concorda com os')} <a href="#/termos">{t('Termos de Uso')}</a> {t('e a')} <a href="#/privacidade">{t('Política de Privacidade')}</a>.</p>
    </section>
  )
}

function SignedIn({ user, sync, profileCount, onClearLocal }: { user: User; sync: SyncStatus; profileCount: number; onClearLocal: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? t('Você')
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const provider = user.app_metadata?.provider === 'google' ? 'Google' : 'e-mail'

  return (
    <>
      <section className="glass pad account-card">
        <div className="account-head">
          {avatar ? <img className="avatar" src={avatar} alt="" referrerPolicy="no-referrer" /> : <span className="avatar letter">{name.charAt(0).toUpperCase()}</span>}
          <div>
            <h3>{name}</h3>
            <p className="muted small">{name !== user.email && `${user.email} · `}{t('entrou com {provider}', { provider })}</p>
          </div>
        </div>
        <p className={`sync-line ${sync}`}>{t(SYNC_LABEL[sync])}</p>
        <p className="muted small">{t(profileCount === 1 ? '1 mapa salvo na sua conta.' : '{n} mapas salvos na sua conta.', { n: profileCount })}</p>
        <div className="head-tools left">
          <button className="ghost" onClick={() => signOut()}>{t('Sair')}</button>
          <button className="ghost" onClick={async () => { await signOut(); onClearLocal() }}>{t('Sair e apagar mapas deste aparelho')}</button>
        </div>
      </section>

      <MyAccess />

      <section className="glass pad account-card danger-zone">
        <h2>{t('Excluir conta')}</h2>
        <p className="muted">{t('Apaga seu login e todos os mapas guardados na nuvem. Essa ação não pode ser desfeita.')}</p>
        {!confirming ? (
          <button className="ghost danger" onClick={() => setConfirming(true)}>{t('Excluir minha conta')}</button>
        ) : (
          <div className="head-tools left">
            <button
              className="ghost danger"
              onClick={async () => {
                try { await deleteAccount(); onClearLocal() } catch { setError(t('Não foi possível excluir agora. Tente novamente.')) }
              }}
            >
              {t('Sim, excluir definitivamente')}
            </button>
            <button className="ghost" onClick={() => setConfirming(false)}>{t('Cancelar')}</button>
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
  const until = access.data.planUntil ? new Date(access.data.planUntil).toLocaleDateString(locale(), { dateStyle: 'long' }) : ''
  return (
    <section className="glass pad account-card">
      <h2>{t('Meu acesso')}</h2>
      {plan ? (
        <p>
          {t('Plano')} <b>{plan === 'cosmos' ? 'Cosmos' : t('Estrela')}</b> {t('ativo até {date}', { date: until })} ·{' '}
          {t('{left} de {total} análises disponíveis neste mês.', { left: Math.max(0, PLAN_ANALYSES[plan] - access.data.planUsedThisMonth), total: PLAN_ANALYSES[plan] })}
        </p>
      ) : (
        <p className="muted">
          {t('Conta gratuita')}{` · ${t('presente: sua Previsão de 30 dias liberada')}`}.
        </p>
      )}
      {purchases.length > 0 && (
        <ul className="purchase-list">
          {purchases.map((p) => (
            <li key={p.id}>
              <span>{PRODUCTS[p.product] ? t(PRODUCTS[p.product].name) : p.product}{p.label ? ` · ${p.label}` : ''}</span>
              <small className="muted">
                {new Date(p.created_at).toLocaleDateString(locale())}
                {p.expires_at && !PRODUCTS[p.product]?.plan ? ` · ${t('válida até {date}', { date: new Date(p.expires_at).toLocaleDateString(locale()) })}` : ''}
              </small>
            </li>
          ))}
        </ul>
      )}
      <a className="ghost inline" href="#/planos">{t(plan ? 'Renovar ou mudar de plano' : 'Ver planos e análises')}</a>
      {!access.simulated && <PromoCode onDone={access.refresh} />}
    </section>
  )
}

const REDEEM_ERROR = {
  login: 'Entre na sua conta para usar o cupom.',
  invalid: 'Cupom inválido ou expirado.',
  used: 'Este cupom já foi usado nesta conta.',
  server: 'Não foi possível aplicar o cupom agora. Tente novamente.',
} as const

/** Promo code field (e.g. a free month of Estrela for testers). */
function PromoCode({ onDone }: { onDone: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null)

  const apply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setMsg(null)
    const r = await redeemCode(code)
    setBusy(false)
    if (r.ok) {
      setMsg({ good: true, text: t('Cupom aplicado: {item} liberado na sua conta!', { item: t(PRODUCTS[r.product].name) }) })
      setCode('')
      await onDone()
    } else {
      setMsg({ good: false, text: t(REDEEM_ERROR[r.error]) })
    }
  }

  if (!open) return <button className="link promo-open" onClick={() => setOpen(true)}>🎁 {t('Tenho um cupom')}</button>
  return (
    <form className="promo-form" onSubmit={apply}>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t('Código do cupom')} aria-label={t('Código do cupom')} autoCapitalize="characters" spellCheck={false} />
      <button className="cta" disabled={busy || !code.trim()}><span>{busy ? t('Aplicando…') : t('Aplicar')}</span></button>
      {msg && <p className={msg.good ? 'promo-ok' : 'error'}>{msg.text}</p>}
    </form>
  )
}
