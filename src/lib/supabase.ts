import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Login and sync are enabled only when the Supabase project is configured at build time. */
export const authConfigured = !!URL && !!ANON_KEY

export const supabase: SupabaseClient | null = authConfigured
  ? createClient(URL!, ANON_KEY!, {
      auth: {
        // PKCE returns `?code=` in the query string, which doesn't clash with the app's #/hash routes.
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Where OAuth / e-mail links return to: the app root, without the hash route. */
export const redirectUrl = () => window.location.origin + window.location.pathname
