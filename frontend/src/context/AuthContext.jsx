import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { tokenStorage } from '@/api/client'
import * as authApi from '@/features/auth/authApi'

/**
 * AuthContext — global authentication state for Job Tracker Pro
 *
 * Token storage: localStorage (keys: jtp_access, jtp_refresh)
 *   Trade-off note: localStorage is accessible by JS, which means a
 *   successful XSS attack could steal tokens. In a hardened production
 *   deployment you'd prefer httpOnly cookies + CSRF tokens managed by
 *   the server. For this project localStorage is an acceptable
 *   simplification given we control the server and enforce CSP.
 *
 * Session restoration: on app load, if a stored access token exists
 * we treat the session as valid (the API will return 401 if it has
 * expired, which the interceptor will handle with a refresh attempt).
 */

const AuthContext = createContext(null)

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature.
 * Used only for reading the `username` claim from the access token.
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function buildUserFromToken(accessToken) {
  if (!accessToken) return null
  const payload = decodeJwtPayload(accessToken)
  if (!payload) return null
  return {
    id:       payload.user_id ?? payload.sub ?? null,
    username: payload.username ?? payload.name ?? 'User',
    email:    payload.email ?? null,
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken]   = useState(() => tokenStorage.getAccess())
  const [refreshToken, setRefreshToken] = useState(() => tokenStorage.getRefresh())
  const [user, setUser]                 = useState(() => buildUserFromToken(tokenStorage.getAccess()))
  const [isLoading, setIsLoading]       = useState(true) // true until session restore is done

  const isAuthenticated = Boolean(accessToken && user)

  // Track mounted state to avoid state updates after unmount
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // ── Session restore on mount ───────────────────────────────────────────
  useEffect(() => {
    const storedAccess  = tokenStorage.getAccess()
    const storedRefresh = tokenStorage.getRefresh()

    if (storedAccess) {
      // Token exists — restore user from payload
      const restoredUser = buildUserFromToken(storedAccess)
      if (mounted.current) {
        setUser(restoredUser)
        setAccessToken(storedAccess)
        setRefreshToken(storedRefresh)
      }
    }

    if (mounted.current) setIsLoading(false)
  }, [])

  // ── login() ───────────────────────────────────────────────────────────
  const login = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password })
    // data = { access, refresh }
    tokenStorage.setTokens(data)
    const restoredUser = buildUserFromToken(data.access)

    setAccessToken(data.access)
    setRefreshToken(data.refresh)
    setUser(restoredUser)

    return restoredUser
  }, [])

  // ── register() ────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    // Step 1: create account
    await authApi.register({ username, email, password })
    // Step 2: auto-login so the user lands straight in the app
    const loginData = await authApi.login({ username, password })
    tokenStorage.setTokens(loginData)
    const restoredUser = buildUserFromToken(loginData.access)

    setAccessToken(loginData.access)
    setRefreshToken(loginData.refresh)
    setUser(restoredUser)

    return restoredUser
  }, [])

  // ── logout() ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.clearTokens()
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    toast.success('Signed out successfully')
  }, [])

  // ── Context value — memoised to prevent re-render on unrelated state ──
  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, accessToken, refreshToken, isAuthenticated, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Consumer hook ──────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

export default AuthContext
