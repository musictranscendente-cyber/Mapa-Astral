/** Lightweight AI settings — safe to import eagerly (no SDK). */
export const AI_MODEL = 'claude-opus-5-5'
const KEY_STORAGE = 'mapa-astral:anthropic-key'

/** Server endpoint (recommended for production; keeps the API key secret). */
export const AI_ENDPOINT: string | undefined = import.meta.env.VITE_AI_ENDPOINT || undefined

export function getUserKey(): string {
  try { return localStorage.getItem(KEY_STORAGE) ?? '' } catch { return '' }
}
export function setUserKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  } catch { /* storage unavailable */ }
}

export const aiAvailable = () => !!AI_ENDPOINT || !!getUserKey()

export class AiError extends Error {}

