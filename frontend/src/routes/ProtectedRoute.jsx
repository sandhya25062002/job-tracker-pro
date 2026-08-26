import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context'
import Spinner from '@/components/ui/Spinner'

/**
 * ProtectedRoute — guards any route that requires authentication.
 *
 * While the session is being restored from localStorage (isLoading=true),
 * we show a full-screen spinner so there's no flash of the login page
 * for users who are actually authenticated.
 *
 * Once isLoading=false:
 *   - authenticated  → render <Outlet /> (the protected child route)
 *   - unauthenticated → redirect to /login, preserving the intended path
 *     in location.state so LoginPage can redirect back after sign-in.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="xl" color="primary" />
          <p className="text-sm text-neutral-500 animate-pulse">Restoring session…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
