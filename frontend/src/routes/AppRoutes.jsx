import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context'
import ProtectedRoute       from './ProtectedRoute'
import LoginPage            from '@/pages/LoginPage'
import RegisterPage         from '@/pages/RegisterPage'
import DashboardPage        from '@/pages/DashboardPage'
import ApplicationsListPage from '@/pages/ApplicationsListPage'
import ProfilePage          from '@/pages/ProfilePage'

/**
 * AppRoutes — React Router v6 route tree
 *
 * Public:    /login, /register
 * Protected: /dashboard, /applications
 */
export default function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  const AuthGuard = ({ children }) => {
    if (isLoading) return null
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
  }

  return (
    <Routes>
      {/* ── Public auth routes ─────────────────────────────────── */}
      <Route path="/login"    element={<AuthGuard><LoginPage /></AuthGuard>} />
      <Route path="/register" element={<AuthGuard><RegisterPage /></AuthGuard>} />

      {/* ── Protected routes ───────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
      </Route>

      {/* ── Redirects ──────────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
