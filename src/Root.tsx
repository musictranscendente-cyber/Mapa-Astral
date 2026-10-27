import App from './App.tsx'
import { useLang } from './i18n'

/** Remounts the whole app when the language changes, so every text and table is re-read. */
export function Root() {
  const lang = useLang()
  return <App key={lang} />
}
