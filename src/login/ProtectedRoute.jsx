import { Loader2 } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthContext'
import { ROLE_HOME } from './auth'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#d6a75f]" aria-label="Loading" />
    </div>
  )
}

/**
 * Wrap a page to require login (and optionally specific roles).
 *   <ProtectedRoute allow={['admin']}><AdminPage /></ProtectedRoute>
 * - not signed in      -> /login (remembers where they were going)
 * - signed in, wrong role -> redirected to their own home page
 */
export default function ProtectedRoute({ allow, children }) {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />
  if (allow && !allow.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
  }
  return children
}
