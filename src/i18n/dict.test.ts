import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EN } from './en'
import { ES } from './es'

/** Every t('…') literal in the source must exist in both dictionaries. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return sources(p)
    return /\.tsx?$/.test(f) && !f.includes('.test.') ? [p] : []
  })
}

const KEYS = new Set<string>()
for (const file of sources('src')) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/\bt\(\s*(['"`])((?:\\.|(?!\1).)*)\1/gs)) {
    if (m[1] === '`' && m[2].includes('${')) continue
    KEYS.add(m[2].replace(/\\(['"`\\])/g, '$1'))
  }
}

describe('translations', () => {
  it('has an English text for every UI string', () => {
    expect([...KEYS].filter((k) => !(k in EN))).toEqual([])
  })
  it('has a Spanish text for every UI string', () => {
    expect([...KEYS].filter((k) => !(k in ES))).toEqual([])
  })
  it('keeps the same placeholders', () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
    expect([...KEYS].filter((k) => (k in EN && ph(EN[k]) !== ph(k)) || (k in ES && ph(ES[k]) !== ph(k)))).toEqual([])
  })
})
