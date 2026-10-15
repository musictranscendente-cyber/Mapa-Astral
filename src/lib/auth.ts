import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { redirectUrl, supabase } from './supabase'

export interface AuthState {
  user: User | null
  loading: boolean
}

const RETURN_ROUTE = 'mapa-astral:after-login'

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
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
  if (!supabase) throw new Error('Login não configurado.')
  rememberRoute()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl() },
  })
  if (error) throw error
}

/** Sends an e-mail with a 6-digit code (and a sign-in link, depending on the template). */
export async function sendEmailCode(email: string) {
  if (!supabase) throw new Error('Login não configurado.')
  rememberRoute()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: redirectUrl() },
  })
  if (error) throw error
}

export async function verifyEmailCode(email: string, token: string) {
  if (!supabase) throw new Error('Login não configurado.')
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
  const msg = e instanceof Error ? e.message : String(e)
  if (/rate|security purposes|seconds/i.test(msg)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.'
  if (/email/i.test(msg) && /invalid/i.test(msg)) return 'E-mail inválido.'
  if (/expired|invalid|token/i.test(msg)) return 'Código inválido ou expirado. Peça um novo código.'
  return 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.'
}
