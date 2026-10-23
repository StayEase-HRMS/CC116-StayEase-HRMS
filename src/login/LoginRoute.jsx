import { Navigate, useLocation, useNavigate } from 'react-router'
import AuthPage from './AuthPage'
import { ROLE_HOME } from './auth'
import { useAuth } from './AuthContext'
import { FullPageSpinner } from './ProtectedRoute'

/**
 * The /login route. Sends signed-in users to their home page, but stays put
 * while the user is in the middle of the forgot-password flow.
 */
export default function LoginRoute() {
  const { session, role, initializing, recovering } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Go back to the page they were trying to open, else to their role's home
  const from = location.state?.from?.pathname
  const targetFor = (r) => (from && from !== '/login' ? from : ROLE_HOME[r] ?? '/')

  if (initializing) return <FullPageSpinner />
  if (session && role && !recovering) return <Navigate to={targetFor(role)} replace />

  return (
    <AuthPage onLoginSuccess={({ role: r }) => navigate(targetFor(r), { replace: true })} />
  )
}
