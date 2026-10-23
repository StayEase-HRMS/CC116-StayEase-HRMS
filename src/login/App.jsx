import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginRoute from './auth/LoginRoute'
import ProtectedRoute from './auth/ProtectedRoute'
import CustomerDashboard from './CustomerDashboard'
import AdminPage from './admin/Admin'

// Temporary page until src/staff/ is built
function StaffPlaceholder() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-lg font-semibold">Staff portal coming soon</p>
      <button onClick={signOut} className="rounded-lg bg-[#d6a75f] px-4 py-2 text-white">
        Log out
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allow={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allow={['staff', 'admin']}>
                <StaffPlaceholder />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
