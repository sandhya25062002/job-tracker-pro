import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context'
import ProtectedRoute from './ProtectedRoute'
import LoginPage    from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'

/**
 * AppRoutes — React Router v6 route tree
 *
 * Public routes:   /login, /register
 * Protected routes: /dashboard (wrapped by ProtectedRoute)
 *
 * Authenticated users visiting /login or /register are redirected
 * to /dashboard immediately.
 */
export default function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect authenticated users away from auth pages
  const AuthGuard = ({ children }) => {
    if (isLoading) return null
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
  }

  return (
    <Routes>
      {/* ── Public auth routes ─────────────────────────────────── */}
      <Route
        path="/login"
        element={<AuthGuard><LoginPage /></AuthGuard>}
      />
      <Route
        path="/register"
        element={<AuthGuard><RegisterPage /></AuthGuard>}
      />

      {/* ── Protected routes ───────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* ── Default redirect ───────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
