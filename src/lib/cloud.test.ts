import { describe, expect, it } from 'vitest'
import { mergeProfiles } from './cloud'
import type { Profile } from './profiles'

const base = {
  place: 'São Paulo', latitude: -23.55, longitude: -46.63, timeZone: 'America/Sao_Paulo',
  local: { year: 1990, month: 6, day: 15, hour: 11, minute: 30 },
}
const p = (id: string, name: string, createdAt: number, updatedAt?: number): Profile =>
  ({ ...base, id, name, createdAt, updatedAt })

describe('sincronização de mapas', () => {
  it('une mapas locais e da nuvem sem duplicar', () => {
    const local = [p('a', 'Ana', 1), p('b', 'Bruno', 2)]
    const remote = [p('b', 'Bruno', 2), p('c', 'Carla', 3)]
    const { merged, toUpload } = mergeProfiles(local, remote)
    expect(merged.map((x) => x.id)).toEqual(['a', 'b', 'c'])
    expect(toUpload.map((x) => x.id)).toEqual(['a'])
  })

  it('a versão editada mais recentemente vence', () => {
    const local = [p('a', 'Ana Local', 1, 50)]
    const remote = [p('a', 'Ana Nuvem', 1, 100)]
    expect(mergeProfiles(local, remote).merged[0].name).toBe('Ana Nuvem')
    const newer = mergeProfiles([p('a', 'Ana Local', 1, 200)], remote)
    expect(newer.merged[0].name).toBe('Ana Local')
    expect(newer.toUpload).toHaveLength(1)
  })

  it('primeiro login com aparelho vazio baixa tudo da nuvem', () => {
    const { merged, toUpload } = mergeProfiles([], [p('x', 'X', 5), p('y', 'Y', 1)])
    expect(merged.map((m) => m.id)).toEqual(['y', 'x'])
    expect(toUpload).toHaveLength(0)
  })
})
