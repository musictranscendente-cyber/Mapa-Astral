import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/** Opening screen (index.html): keep it at least ~1.5 s from page load, then fade it out. */
const splash = document.getElementById('splash')
if (splash) {
  const wait = Math.max(0, 1500 - performance.now())
  setTimeout(() => {
    splash.classList.add('hide')
    setTimeout(() => splash.remove(), 800)
  }, wait)
}
