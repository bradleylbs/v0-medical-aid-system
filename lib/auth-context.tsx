"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  type Role,
  type Permission,
  type SimulatedUser,
  SIMULATED_USERS,
  hasPermission,
} from "./rbac"

interface AuthContextValue {
  user: SimulatedUser
  role: Role
  can: (permission: Permission) => boolean
  switchUser: (userId: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default: Practice Owner (full access)
  const [currentUser, setCurrentUser] = useState<SimulatedUser>(SIMULATED_USERS[0])

  const can = useCallback(
    (permission: Permission) => hasPermission(currentUser.role, permission),
    [currentUser.role]
  )

  const switchUser = useCallback((userId: string) => {
    const user = SIMULATED_USERS.find((u) => u.id === userId)
    if (user) setCurrentUser(user)
  }, [])

  return (
    <AuthContext.Provider value={{ user: currentUser, role: currentUser.role, can, switchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
