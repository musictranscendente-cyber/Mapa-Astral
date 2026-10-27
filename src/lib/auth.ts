import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { t } from '../i18n'
import { redirectUrl, supabase, supabaseAnonKey, supabaseUrl } from './supabase'

export interface AuthState {
  user: User | null
  loading: boolean
}

const RETURN_ROUTE = 'mapa-astral:after-login'

/** A login error whose message is already written for the person. */
class LoginError extends Error {}

/* ── Login errors coming back from Google / Supabase, shown on the account screen ── */
const LOGIN_ERROR_EVENT = 'mapa-astral:login-error'
let loginError = ''

function reportLoginError(raw: string) {
  loginError = `${describeLoginError(raw)} (${raw})`
  window.dispatchEvent(new Event(LOGIN_ERROR_EVENT))
}

/** Turns the provider's message into something the person (and we) can act on. */
export function describeLoginError(raw: string): string {
  if (/provider is not enabled|unsupported provider/i.test(raw)) return t('O login com Google ainda não está ativado no servidor (Supabase → Authentication → Providers → Google).')
  if (/redirect_uri_mismatch|redirect/i.test(raw)) return t('O endereço de retorno do Google não está autorizado (confira as URLs de redirecionamento no Google Cloud e no Supabase).')
  if (/code verifier|flow state|flow_state|pkce/i.test(raw)) return t('O login começou em um navegador e terminou em outro. Abra o Cosmic Sky no mesmo navegador e tente de novo, ou entre com o código por e-mail.')
  if (/access_denied|denied|cancel/i.test(raw)) return t('O login com Google foi cancelado.')
  return t('Não foi possível entrar com Google.')
}

// Errors arrive in the URL (`?error_description=` or `#error_description=`); read them before anything cleans the URL.
;(() => {
  // `#error=…` (from Supabase) or `#/conta?error=…`; the query string is checked as-is
  const fromHash = (h: string) => new URLSearchParams(h.includes('?') ? h.slice(h.indexOf('?') + 1) : h.slice(1))
  const read = (q: URLSearchParams) => q.get('error_description') || q.get('error')
  const found = read(new URLSearchParams(window.location.search)) || read(fromHash(window.location.hash))
  if (!found) return
  loginError = describeLoginError(found) + ` (${found.replace(/\+/g, ' ')})`
  window.history.replaceState(null, '', window.location.pathname + '#/conta')
})()

/** The last login error, and a way to dismiss it. */
export function useLoginError(): [string, () => void] {
  const [msg, setMsg] = useState(loginError)
  useEffect(() => {
    const on = () => setMsg(loginError)
    window.addEventListener(LOGIN_ERROR_EVENT, on)
    return () => window.removeEventListener(LOGIN_ERROR_EVENT, on)
  }, [])
  return [msg, () => { loginError = ''; setMsg('') }]
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    // Back from Google with `?code=`: if exchanging it fails, say why instead of silently staying logged out.
    supabase.auth.initialize().then(async ({ error }) => {
      const pending = window.location.search.includes('code=')
      if (!error && !pending) return
      // A code with no session: the login began in another browser (e.g. the installed app vs. the browser),
      // where the PKCE verifier lives, so Supabase ignores it without an error.
      if (!error && (await supabase!.auth.getSession()).data.session) return
      reportLoginError(error ? error.message : 'PKCE code verifier not found in this browser')
      if (pending) window.history.replaceState(null, '', window.location.pathname + '#/conta')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
      // Back from Google / e-mail link: drop `?code=` and return to where the person was.
      if (s && window.location.search.includes('code=')) {
        let route = '#/conta'
        try { route = sessionStorage.getItem(RETURN_ROUTE) || route } catch { /* ignore */ }
        window.history.replaceState(null, '', window.location.pathname + route)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return { user: session?.user ?? null, loading }
}

const PENDING = 'mapa-astral:return-to'

/** Remember the screen that asked for a login, to come back to it afterwards. */
export function rememberReturn(hash = window.location.hash) {
  try { sessionStorage.setItem(PENDING, hash) } catch { /* ignore */ }
}

/** The screen saved by rememberReturn (read once). */
export function takeReturn(): string | null {
  try {
    const v = sessionStorage.getItem(PENDING)
    sessionStorage.removeItem(PENDING)
    return v
  } catch {
    return null
  }
}

const rememberRoute = () => {
  let target = window.location.hash || '#/conta'
  try { target = sessionStorage.getItem(PENDING) || target } catch { /* ignore */ }
  try { sessionStorage.setItem(RETURN_ROUTE, target) } catch { /* ignore */ }
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error(t('Login não configurado.'))
  // If Google is off in Supabase, /authorize shows a raw error page and never returns to the app: check first.
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey! } })
    if (res.ok && (await res.json())?.external?.google === false) throw new LoginError(describeLoginError('provider is not enabled'))
  } catch (e) {
    if (e instanceof LoginError) throw e // network hiccups: let the normal flow try anyway
  }
  rememberRoute()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl() },
  })
  if (error) throw new LoginError(`${describeLoginError(error.message)} (${error.message})`)
}

/** Sends an e-mail with a 6-digit code (and a sign-in link, depending on the template). */
export async function sendEmailCode(email: string) {
  if (!supabase) throw new Error(t('Login não configurado.'))
  rememberRoute()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: redirectUrl() },
  })
  if (error) throw error
}

export async function verifyEmailCode(email: string, token: string) {
  if (!supabase) throw new Error(t('Login não configurado.'))
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
}

export async function signOut() {
  await supabase?.auth.signOut()
}

/** Deletes the login and, by cascade, every synced chart (LGPD). */
export async function deleteAccount() {
  if (!supabase) return
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  await supabase.auth.signOut()
}

export function authErrorMessage(e: unknown): string {
  if (e instanceof LoginError) return e.message
  const msg = e instanceof Error ? e.message : String(e)
  if (/rate|security purposes|seconds/i.test(msg)) return t('Muitas tentativas. Aguarde um minuto e tente de novo.')
  if (/email/i.test(msg) && /invalid/i.test(msg)) return t('E-mail inválido.')
  if (/expired|invalid|token/i.test(msg)) return t('Código inválido ou expirado. Peça um novo código.')
  return t('Não foi possível entrar agora. Verifique sua conexão e tente novamente.')
}
