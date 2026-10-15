import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BILLING, fetchAccess, startCheckout } from './api'
import { AccessContext, OPEN, type Access } from './context'
import { EMPTY_ACCESS, PROFILE_LIMIT, activePlan, analysisAllowance, unlocked, type AccessData } from './rules'

export function AccessProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  // Tagged with the account it was loaded for, so a different account never sees stale data.
  const [state, setState] = useState<{ uid: string | null; data: AccessData }>({ uid: null, data: EMPTY_ACCESS })
  const data = state.uid === userId ? state.data : EMPTY_ACCESS

  const refresh = useCallback(async () => {
    if (!BILLING || !userId) return
    try {
      setState({ uid: userId, data: await fetchAccess(userId) })
    } catch {
      /* keep what we had; the next refresh will retry */
    }
  }, [userId])

  useEffect(() => {
    if (!BILLING || !userId) return
    let cancelled = false
    fetchAccess(userId).then(
      (d) => { if (!cancelled) setState({ uid: userId, data: d }) },
      () => { if (!cancelled) setState({ uid: userId, data: EMPTY_ACCESS }) }, // offline: free until the next refresh
    )
    return () => { cancelled = true }
  }, [userId])

  const value = useMemo<Access>(() => {
    if (!BILLING) return OPEN
    const plan = activePlan(data)
    return {
      enabled: true,
      loggedIn: !!userId,
      loading: !!userId && state.uid !== userId,
      plan,
      data,
      full: (key) => !!userId && unlocked(data, key),
      allowance: (key) => (userId ? analysisAllowance(data, key) : { ok: false }),
      profileLimit: !userId ? PROFILE_LIMIT.anon : plan ? PROFILE_LIMIT[plan] : PROFILE_LIMIT.free,
      refresh,
      buy: (offer) => (typeof offer === 'string' ? startCheckout(offer) : startCheckout(offer.product, offer.scope, offer.label)),
    }
  }, [data, userId, refresh, state.uid])

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}
