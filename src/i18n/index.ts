import { useSyncExternalStore } from 'react'
import { EN } from './en'
import { ES } from './es'

/**
 * App language. Portuguese is the source language: UI strings are written in Portuguese and
 * passed through t(); interpretation tables use byLang() to pick the current language.
 * Changing the language remounts the app (see main.tsx), so plain functions can read it.
 */
export type Lang = 'pt' | 'en' | 'es'
export const LANGS: { key: Lang; label: string; flag: string }[] = [
  { key: 'pt', label: 'Português', flag: '🇧🇷' },
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'es', label: 'Español', flag: '🇪🇸' },
]

const STORAGE_KEY = 'cosmic-sky:lang'
const LOCALES: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
const isLang = (v: unknown): v is Lang => v === 'pt' || v === 'en' || v === 'es'

/** Opened from the Android app (Trusted Web Activity) rather than a browser. */
const inAndroidApp = () => typeof document !== 'undefined' && document.referrer.startsWith('android-app://')

/**
 * The site leads in English: a link with ?lang= (remembered for next time) or an earlier choice
 * wins; otherwise Spanish browsers get Spanish and everyone else English. The Android app keeps
 * following the phone's language.
 */
function detect(): Lang {
  // Tests are written against the source language.
  if (import.meta.env?.MODE === 'test') return 'pt'
  if (typeof window === 'undefined') return 'en'
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (isLang(fromUrl)) {
      try { localStorage.setItem(STORAGE_KEY, fromUrl) } catch { /* ignore */ }
      return fromUrl
    }
  } catch { /* ignore */ }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch { /* ignore */ }
  const preferred = (navigator.languages ?? [navigator.language]).map((l) => l.slice(0, 2).toLowerCase())
  if (inAndroidApp() && preferred[0] === 'pt') return 'pt'
  if (preferred[0] === 'es') return 'es'
  return 'en'
}

const TITLES: Record<Lang, string> = {
  pt: 'Cosmic Sky · Mapa Astral',
  en: 'Cosmic Sky · Birth Chart & Astrology',
  es: 'Cosmic Sky · Carta Astral',
}

let current: Lang = detect()
const listeners = new Set<() => void>()
if (typeof document !== 'undefined') { document.documentElement.lang = LOCALES[current]; document.title = TITLES[current] }

export const getLang = () => current
/** BCP 47 locale for dates and numbers in the current language. */
export const locale = () => LOCALES[current]

export function setLang(lang: Lang) {
  if (lang === current) return
  current = lang
  try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  document.documentElement.lang = LOCALES[lang]
  document.title = TITLES[lang]
  listeners.forEach((l) => l())
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => current,
    () => current,
  )
}

const DICTS: Record<Exclude<Lang, 'pt'>, Record<string, string>> = { en: EN, es: ES }

/**
 * Translates a Portuguese UI string. `{name}` placeholders are filled from `vars`.
 * Missing translations fall back to Portuguese (the dictionary test lists them).
 */
export function t(pt: string, vars?: Record<string, string | number>): string {
  const text = current === 'pt' ? pt : (DICTS[current][pt] ?? pt)
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text
}

/**
 * A table available in the three languages that always reads as the current one.
 * Keeps call sites unchanged: `SIGN_TEXT[3].title`, `HOUSE_TEXT.map(...)` etc.
 */
export function byLang<T extends object>(tables: Record<Lang, T>): T {
  const pick = () => tables[current] as object
  return new Proxy(tables.pt, {
    get: (_t, prop) => Reflect.get(pick(), prop),
    has: (_t, prop) => Reflect.has(pick(), prop),
    ownKeys: () => Reflect.ownKeys(pick()),
    getOwnPropertyDescriptor: (_t, prop) => Reflect.getOwnPropertyDescriptor(pick(), prop),
  }) as T
}

/** Picks the current language's value from an inline triple. */
export const tri = <T,>(v: Record<Lang, T>): T => v[current]
