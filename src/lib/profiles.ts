import { useCallback, useEffect, useRef, useState } from 'react'
import type { BirthData } from '../astro/chart'
import type { HouseSystem } from '../astro/houses'
import { deleteRemoteProfile, fetchRemoteProfiles, mergeProfiles, upsertRemoteProfiles } from './cloud'

export interface Profile extends BirthData {
  id: string
  createdAt: number
  updatedAt?: number
}

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'error'

const KEY = 'mapa-astral:profiles'
const ACTIVE = 'mapa-astral:active'
const SETTINGS = 'mapa-astral:settings'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

/**
 * Charts live in localStorage (works offline and without an account). When `userId` is set,
 * they are merged with the cloud copy on sign-in and every change is mirrored to it.
 */
export function useProfiles(userId: string | null = null) {
  const [profiles, setProfiles] = useState<Profile[]>(() => read<Profile[]>(KEY, []))
  const [activeId, setActiveId] = useState<string | null>(() => read<string | null>(ACTIVE, null))
  // Status is tagged with the account it belongs to; a new account reads as "syncing" until done.
  const [syncState, setSyncState] = useState<{ uid: string | null; status: SyncStatus }>({ uid: null, status: 'off' })
  const sync: SyncStatus = !userId ? 'off' : syncState.uid !== userId ? 'syncing' : syncState.status

  const current = useRef(profiles)
  useEffect(() => { current.current = profiles; write(KEY, profiles) }, [profiles])
  useEffect(() => write(ACTIVE, activeId), [activeId])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      try {
        const remote = await fetchRemoteProfiles()
        const local = read<Profile[]>(KEY, [])
        const { merged, toUpload } = mergeProfiles(local, remote)
        await upsertRemoteProfiles(toUpload)
        if (cancelled) return
        setProfiles(merged)
        setSyncState({ uid: userId, status: 'synced' })
      } catch {
        if (!cancelled) setSyncState({ uid: userId, status: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  const mirror = useCallback((task: () => Promise<void>) => {
    if (!userId) return
    setSyncState({ uid: userId, status: 'syncing' })
    task().then(
      () => setSyncState({ uid: userId, status: 'synced' }),
      () => setSyncState({ uid: userId, status: 'error' }),
    )
  }, [userId])

  const save = useCallback((data: BirthData, id?: string, activate = true) => {
    const pid = id ?? crypto.randomUUID()
    const now = Date.now()
    const existing = current.current.find((p) => p.id === pid)
    const next: Profile = { ...data, id: pid, createdAt: existing?.createdAt ?? now, updatedAt: now }
    setProfiles((list) => (list.some((p) => p.id === pid) ? list.map((p) => (p.id === pid ? next : p)) : [...list, next]))
    if (activate) setActiveId(pid)
    mirror(() => upsertRemoteProfiles([next]))
    return pid
  }, [mirror])

  const remove = useCallback((id: string) => {
    setProfiles((list) => list.filter((p) => p.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
    mirror(() => deleteRemoteProfile(id))
  }, [mirror])

  /** Forget the charts kept on this device (e.g. after signing out on a shared phone). */
  const clearLocal = useCallback(() => {
    setProfiles([])
    setActiveId(null)
  }, [])

  const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null
  return { profiles, active, setActiveId, save, remove, clearLocal, sync }
}

export interface NotifyTopics {
  /** Personal transits to the chart (the main daily message). */
  transitos: boolean
  /** New/full moons and eclipses. */
  lunacoes: boolean
  /** Planets turning retrograde/direct and changing sign. */
  planetas: boolean
  /** The Moon changing sign. */
  luaSigno: boolean
  /** Moon void of course periods. */
  foraDeCurso: boolean
}

export const DEFAULT_TOPICS: NotifyTopics = { transitos: true, lunacoes: true, planetas: true, luaSigno: false, foraDeCurso: false }

export interface Settings {
  houseSystem: HouseSystem
  motion: boolean
  notify: boolean
  notifyHour: number
  notifyTopics: NotifyTopics
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = read<Partial<Settings>>(SETTINGS, {})
    return { houseSystem: 'placidus', motion: true, notify: false, notifyHour: 8, ...saved, notifyTopics: { ...DEFAULT_TOPICS, ...saved.notifyTopics } }
  })
  useEffect(() => write(SETTINGS, settings), [settings])
  return [settings, setSettings] as const
}
