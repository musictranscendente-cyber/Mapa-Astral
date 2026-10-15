// Copies the import-free shared modules into the Edge Functions folder.
// Run after editing src/billing/rules.ts or src/ai/promptCore.ts: npm run sync:functions
import { copyFileSync } from 'node:fs'

export const SHARED = [
  ['src/billing/rules.ts', 'supabase/functions/_shared/rules.ts'],
  ['src/ai/promptCore.ts', 'supabase/functions/_shared/promptCore.ts'],
]

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [from, to] of SHARED) {
    copyFileSync(from, to)
    console.log(`${from} → ${to}`)
  }
}
