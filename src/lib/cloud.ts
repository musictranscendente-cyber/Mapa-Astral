import type { BirthData } from '../astro/chart'
import type { Profile } from './profiles'
import { supabase } from './supabase'

interface Row {
  id: string
  data: BirthData
  created_at: string
  updated_at: string
}

const toProfile = (r: Row): Profile => ({
  ...r.data,
  id: r.id,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
})

const birthData = (p: Profile): BirthData => ({
  name: p.name,
  local: p.local,
  timeZone: p.timeZone,
  latitude: p.latitude,
  longitude: p.longitude,
  place: p.place,
  timeUnknown: p.timeUnknown,
})

export async function fetchRemoteProfiles(): Promise<Profile[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('birth_profiles')
    .select('id, data, created_at, updated_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Row[]).map(toProfile)
}

export async function upsertRemoteProfiles(list: Profile[]) {
  if (!supabase || list.length === 0) return
  const rows = list.map((p) => ({
    id: p.id,
    data: birthData(p),
    created_at: new Date(p.createdAt).toISOString(),
    updated_at: new Date(p.updatedAt ?? p.createdAt).toISOString(),
  }))
  const { error } = await supabase.from('birth_profiles').upsert(rows)
  if (error) throw error
}

export async function deleteRemoteProfile(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('birth_profiles').delete().eq('id', id)
  if (error) throw error
}

/**
 * Union of local and cloud charts by id; when both have the same chart, the most
 * recently edited copy wins. Also returns which merged charts the cloud is missing
 * or holds an older version of.
 */
export function mergeProfiles(local: Profile[], remote: Profile[]): { merged: Profile[]; toUpload: Profile[] } {
  const byId = new Map<string, Profile>()
  for (const r of remote) byId.set(r.id, r)
  const toUpload: Profile[] = []
  for (const l of local) {
    const r = byId.get(l.id)
    const lt = l.updatedAt ?? l.createdAt
    const rt = r ? r.updatedAt ?? r.createdAt : -Infinity
    if (!r || lt > rt) {
      byId.set(l.id, l)
      toUpload.push(l)
    }
  }
  const merged = [...byId.values()].sort((a, b) => a.createdAt - b.createdAt)
  return { merged, toUpload }
}
