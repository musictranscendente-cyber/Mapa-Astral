import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Relative base so the build works on GitHub Pages or any sub-path.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  // Everything prefixed VITE_ ends up in the public bundle: refuse to ship a server-side key.
  const key = env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
  if (key.startsWith('sb_secret_') || /service_role/.test(key.split('.')[1] ? atob(key.split('.')[1]) : '')) {
    throw new Error('VITE_SUPABASE_ANON_KEY contém uma chave SECRETA. Use a "Publishable key" (sb_publishable_...) ou a anon key.')
  }
  return {
    base: './',
    plugins: [react()],
  }
})
