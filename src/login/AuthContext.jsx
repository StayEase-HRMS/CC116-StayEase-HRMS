import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import { getUserRole, signOut as apiSignOut } from './auth'

const AuthContext = createContext(null)

/**
 * Keeps the Supabase session + the user's role in React state.
 *
 *   const { session, user, role, loading, recovering, signOut } = useAuth()
 *
 * initializing : first session check hasn't finished yet
 * loading      : initializing, OR signed in but the role hasn't been fetched yet
 * recovering   : the user is mid "forgot password" flow (temporary recovery
 *                session) - routes must NOT treat this as a normal login
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setRecovering(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Fetch the role whenever the signed-in user changes
  const userId = session?.user?.id ?? null
  useEffect(() => {
    setRole(null)
    if (!userId) return
    let cancelled = false
    getUserRole(userId).then((r) => {
      if (!cancelled) setRole(r)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      initializing,
      recovering,
      loading: initializing || (!!session && !role),
      signOut: apiSignOut,
    }),
    [session, role, initializing, recovering]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
