import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BILLING, fetchAccess, startCheckout } from './api'
import { AccessContext, OPEN, type Access } from './context'
import { EMPTY_ACCESS, PROFILE_LIMIT, activePlan, analysisAllowance, unlocked, type AccessData } from './rules'
import { simAccess, simBuy, simRecordUse, useIsOwner, useSim } from './sim'

export function AccessProvider({ userId, email, children }: { userId: string | null; email: string | null; children: ReactNode }) {
  const owner = useIsOwner(email)
  const sim = useSim()
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
    if (owner && sim.on) {
      const d = simAccess(sim)
      const plan = activePlan(d)
      const logged = sim.loggedIn
      return {
        enabled: true,
        loggedIn: logged,
        loading: false,
        plan,
        data: d,
        full: (key) => logged && unlocked(d, key),
        allowance: (key) => (logged ? analysisAllowance(d, key) : { ok: false }),
        profileLimit: !logged ? PROFILE_LIMIT.anon : plan ? PROFILE_LIMIT[plan] : PROFILE_LIMIT.free,
        refresh: async () => {},
        buy: async (offer) => (typeof offer === 'string' ? simBuy(offer, {}, '') : simBuy(offer.product, offer.scope, offer.label)),
        owner,
        simulated: true,
        recordUse: simRecordUse,
      }
    }
    if (!BILLING) return { ...OPEN, owner }
    const plan = activePlan(data)
    return {
      enabled: true,
      loggedIn: !!userId,
      loading: !!userId && state.uid !== userId,
      plan,
      data,
      // the owner's real account sees everything and generates analyses freely (the server agrees)
      full: (key) => owner || (!!userId && unlocked(data, key)),
      allowance: (key) => (owner ? { ok: true } : userId ? analysisAllowance(data, key) : { ok: false }),
      profileLimit: owner ? Infinity : !userId ? PROFILE_LIMIT.anon : plan ? PROFILE_LIMIT[plan] : PROFILE_LIMIT.free,
      refresh,
      buy: (offer) => (typeof offer === 'string' ? startCheckout(offer) : startCheckout(offer.product, offer.scope, offer.label)),
      owner,
      simulated: false,
      recordUse: () => {},
    }
  }, [data, userId, refresh, state.uid, owner, sim])

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}
