import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context'
import ProtectedRoute       from './ProtectedRoute'
import LoginPage            from '@/pages/LoginPage'
import RegisterPage         from '@/pages/RegisterPage'
import ForgotPasswordPage   from '@/pages/ForgotPasswordPage'
import ResetPasswordPage    from '@/pages/ResetPasswordPage'
import DashboardPage        from '@/pages/DashboardPage'
import ApplicationsListPage from '@/pages/ApplicationsListPage'
import ProfilePage          from '@/pages/ProfilePage'

/**
 * AppRoutes — React Router v6 route tree
 *
 * Public:    /login, /register, /forgot-password, /reset-password/:uid/:token
 * Protected: /dashboard, /applications, /profile
 * Root "/" redirects to /login (or /dashboard if authenticated)
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
      <Route path="/login"                         element={<AuthGuard><LoginPage /></AuthGuard>} />
      <Route path="/register"                      element={<AuthGuard><RegisterPage /></AuthGuard>} />
      <Route path="/forgot-password"               element={<AuthGuard><ForgotPasswordPage /></AuthGuard>} />
      <Route path="/reset-password/:uid/:token"    element={<ResetPasswordPage />} />

      {/* ── Protected routes ───────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
      </Route>

      {/* ── Redirects ───────────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
