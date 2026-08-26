import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, LayoutDashboard, ListChecks, LogIn, LogOut, UserCircle, UserCog, UserPlus } from 'lucide-react'
import { useAuth } from '@/context'
import Button from '@/components/ui/Button'

/**
 * InitialsAvatar — renders a coloured circle with the user's initials.
 * Falls back to 'U' if username is undefined.
 */
export function InitialsAvatar({ username, avatarSrc, size = 'sm' }) {
  const initials = (username ?? 'U')
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizeCls = {
    xs:  'w-6 h-6 text-xs',
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-20 h-20 text-2xl',
  }[size] ?? 'w-7 h-7 text-xs'

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={username ?? 'User avatar'}
        className={`${sizeCls} rounded-full object-cover ring-2 ring-white`}
      />
    )
  }

  return (
    <div
      className={[
        sizeCls,
        'rounded-full flex items-center justify-center shrink-0',
        'bg-primary-600 text-white font-bold leading-none select-none',
      ].join(' ')}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

/**
 * Navbar — top navigation bar
 *
 * Unauthenticated: Sign in + Get started CTAs
 * Authenticated:   Dashboard + Applications nav, user avatar dropdown
 *   Dropdown: Profile · Edit Profile · Sign out
 */
export default function Navbar() {
  const { isAuthenticated, isLoading, user, avatar, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = user?.first_name || user?.name || user?.username || 'User'

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false) }, [location.pathname])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const navLink = (to, label, Icon) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        title={label}
        className={[
          'flex items-center gap-1.5 text-xs sm:text-sm px-2 py-1.5 sm:px-2.5 rounded-lg transition-all duration-150',
          active
            ? 'text-primary-700 bg-primary-50 font-medium'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
        ].join(' ')}
      >
        <Icon size={15} />
        <span className="hidden md:inline">{label}</span>
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-sm border-b border-neutral-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shadow-sm">
      {/* ── Brand ── */}
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        className="flex items-center gap-2 sm:gap-2.5 shrink-0 group"
      >
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center transition-transform duration-150 group-hover:scale-105 shrink-0">
          <Briefcase className="text-white" size={14} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-neutral-900 tracking-tight select-none">
          <span className="sm:hidden">Job Tracker</span>
          <span className="hidden sm:inline">Job Tracker Pro</span>
        </span>
      </Link>

      {/* ── Centre nav links ── */}
      {!isLoading && isAuthenticated && (
        <nav className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2">
          {navLink('/dashboard',    'Dashboard',    LayoutDashboard)}
          {navLink('/applications', 'Applications', ListChecks)}
        </nav>
      )}

      <div className="flex-1" />

      {/* ── Right-side controls ── */}
      {!isLoading && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            /* ── User dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-label="Open user menu"
                className={[
                  'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg',
                  'border transition-all duration-150',
                  dropdownOpen
                    ? 'bg-neutral-100 border-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300',
                ].join(' ')}
              >
                <InitialsAvatar username={displayName} avatarSrc={avatar} size="xs" />
                <span className="text-sm font-medium text-neutral-700 hidden sm:block max-w-[120px] truncate">
                  {displayName}
                </span>
                <svg
                  className={`text-neutral-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  role="menu"
                  className={[
                    'absolute right-0 top-full mt-2 w-52',
                    'bg-white border border-neutral-200 rounded-xl shadow-lg',
                    'py-1.5 overflow-hidden',
                    'animate-in fade-in slide-in-from-top-1 duration-150',
                  ].join(' ')}
                >
                  {/* User info header */}
                  <div className="px-3.5 py-2.5 border-b border-neutral-100 mb-1">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {displayName}
                    </p>
                    {user?.username && displayName !== user.username && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        @{user.username}
                      </p>
                    )}
                    {user?.email && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile navigation links (visible on mobile only) */}
                  <div className="sm:hidden border-b border-neutral-100 pb-1 mb-1">
                    <DropdownItem
                      icon={<LayoutDashboard size={14} />}
                      label="Dashboard"
                      onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}
                    />
                    <DropdownItem
                      icon={<ListChecks size={14} />}
                      label="Applications"
                      onClick={() => { setDropdownOpen(false); navigate('/applications') }}
                    />
                  </div>

                  <DropdownItem
                    icon={<UserCircle size={14} />}
                    label="Profile"
                    onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                  />
                  <DropdownItem
                    icon={<UserCog size={14} />}
                    label="Edit Profile"
                    onClick={() => { setDropdownOpen(false); navigate('/profile?edit=true') }}
                  />

                  <div className="my-1.5 border-t border-neutral-100" />

                  <DropdownItem
                    icon={<LogOut size={14} />}
                    label="Sign out"
                    onClick={handleLogout}
                    danger
                  />
                </div>
              )}
            </div>
          ) : (
            /* ── Unauthenticated ── */
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

function DropdownItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm',
        'transition-colors duration-100 text-left',
        danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
      ].join(' ')}
    >
      <span className="shrink-0 opacity-70">{icon}</span>
      {label}
    </button>
  )
}
