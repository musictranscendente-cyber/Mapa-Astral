import { LANGS, setLang, useLang } from '../i18n'

/** PT / EN / ES switch. Changing it remounts the app in the new language. */
export function LangPicker({ compact = false }: { compact?: boolean }) {
  const lang = useLang()
  return (
    <div className={`segmented lang-picker ${compact ? 'small' : ''}`} role="group" aria-label="Idioma / Language / Idioma">
      {LANGS.map((l) => (
        <button key={l.key} className={lang === l.key ? 'active' : ''} aria-pressed={lang === l.key} onClick={() => setLang(l.key)}>
          {l.flag} {compact ? l.key.toUpperCase() : l.label}
        </button>
      ))}
    </div>
  )
}
