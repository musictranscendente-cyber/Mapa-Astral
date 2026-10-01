import { useCallback, useEffect, useState } from 'react'
import type { BirthData } from '../astro/chart'
import type { HouseSystem } from '../astro/houses'

export interface Profile extends BirthData {
  id: string
  createdAt: number
}

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

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>(() => read<Profile[]>(KEY, []))
  const [activeId, setActiveId] = useState<string | null>(() => read<string | null>(ACTIVE, null))

  useEffect(() => write(KEY, profiles), [profiles])
  useEffect(() => write(ACTIVE, activeId), [activeId])

  const save = useCallback((data: BirthData, id?: string) => {
    const pid = id ?? crypto.randomUUID()
    setProfiles((list) => {
      const existing = list.find((p) => p.id === pid)
      const next: Profile = { ...data, id: pid, createdAt: existing?.createdAt ?? Date.now() }
      return existing ? list.map((p) => (p.id === pid ? next : p)) : [...list, next]
    })
    setActiveId(pid)
    return pid
  }, [])

  const remove = useCallback((id: string) => {
    setProfiles((list) => list.filter((p) => p.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }, [])

  const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null
  return { profiles, active, setActiveId, save, remove }
}

export interface Settings {
  houseSystem: HouseSystem
  motion: boolean
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({ houseSystem: 'placidus', motion: true, ...read<Partial<Settings>>(SETTINGS, {}) }))
  useEffect(() => write(SETTINGS, settings), [settings])
  return [settings, setSettings] as const
}
