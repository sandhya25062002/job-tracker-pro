import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, LayoutDashboard, ListChecks, LogIn, LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '@/context'
import Button from '@/components/ui/Button'

/**
 * Navbar — top navigation bar
 *
 * Unauthenticated: Login + Register CTAs
 * Authenticated:   Dashboard + Applications nav links, user chip, logout
 */
export default function Navbar() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLink = (to, label, Icon) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={[
          'hidden sm:flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-md transition-colors',
          active
            ? 'text-primary-700 bg-primary-50 font-medium'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
        ].join(' ')}
      >
        <Icon size={14} />
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm border-b border-neutral-200 flex items-center px-4 sm:px-6 gap-4 shadow-xs">
      {/* Brand */}
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        className="flex items-center gap-2.5 shrink-0 group"
      >
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center transition-transform group-hover:scale-105">
          <Briefcase className="text-white" size={14} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-neutral-900 tracking-tight hidden xs:block">
          Job Tracker Pro
        </span>
      </Link>

      {/* Centre nav links (authenticated) */}
      {!isLoading && isAuthenticated && (
        <nav className="flex items-center gap-1 ml-2">
          {navLink('/dashboard',    'Dashboard',    LayoutDashboard)}
          {navLink('/applications', 'Applications', ListChecks)}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right-side controls */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* User avatar chip */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold leading-none">
                    {(user?.username?.[0] ?? 'U').toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-700 hidden sm:block max-w-[120px] truncate">
                  {user?.username ?? 'User'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut size={14} />}
                onClick={handleLogout}
                className="text-neutral-600 hover:text-rose-600 hover:bg-rose-50"
                id="navbar-logout-btn"
              >
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogIn size={14} />}
                onClick={() => navigate('/login')}
                id="navbar-login-btn"
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus size={14} />}
                onClick={() => navigate('/register')}
                id="navbar-register-btn"
              >
                Get started
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
