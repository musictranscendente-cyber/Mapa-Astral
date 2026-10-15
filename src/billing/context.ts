import { createContext, useContext } from 'react'
import { EMPTY_ACCESS, type AccessData, type Allowance, type PlanKey, type ProductKey, type Scope } from './rules'

export interface Offer {
  product: ProductKey
  scope: Scope
  /** Who/what the purchase is for, shown on the receipt (e.g. the person's name). */
  label: string
}

export interface Access {
  /** False while payments are off: everything is open, as before. */
  enabled: boolean
  loggedIn: boolean
  /** Signed in, but the plan and purchases haven't loaded yet. */
  loading: boolean
  plan: PlanKey | null
  data: AccessData
  /** Full content for an access key (plan or purchase). */
  full: (key: string) => boolean
  allowance: (key: string) => Allowance
  profileLimit: number
  refresh: () => Promise<void>
  buy: (offer: Offer | ProductKey) => Promise<void>
}

export const OPEN: Access = {
  enabled: false,
  loggedIn: true,
  loading: false,
  plan: null,
  data: EMPTY_ACCESS,
  full: () => true,
  allowance: () => ({ ok: true }),
  profileLimit: Infinity,
  refresh: async () => {},
  buy: async () => {},
}

export const AccessContext = createContext<Access>(OPEN)

export const useAccess = () => useContext(AccessContext)

