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

// ── User localStorage helpers ──────────────────────────────────────────────
const USER_KEY = 'jtp_user'
const userStorage = {
  get: () => {
    try {
      const data = localStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },
  set: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  },
  clear: () => localStorage.removeItem(USER_KEY),
}

// ── Avatar localStorage helpers ────────────────────────────────────────────
// TODO: In a future iteration, avatar upload should move to backend file
// storage (e.g. Django media files + Cloudinary CDN) and the URL returned
// by the API should replace this client-side base64 approach.
const AVATAR_KEY = 'jtp_avatar'
const avatarStorage = {
  get:   ()    => localStorage.getItem(AVATAR_KEY) ?? null,
  set:   (b64) => localStorage.setItem(AVATAR_KEY, b64),
  clear: ()    => localStorage.removeItem(AVATAR_KEY),
}

/**
 * AuthContext — global authentication state for Job Tracker Pro
 *
 * Token storage: localStorage (keys: jtp_access, jtp_refresh)
 * User storage:  localStorage (key:  jtp_user)
 *
 * Session restoration: on app load, if a stored access token exists
 * we restore cached user and call getProfile() to ensure fresh state.
 */

const AuthContext = createContext(null)

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature.
 * Used only as an initial fallback if username claim is present in the access token.
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
    username: payload.username ?? payload.name ?? null,
    email:    payload.email ?? null,
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken]   = useState(() => tokenStorage.getAccess())
  const [refreshToken, setRefreshToken] = useState(() => tokenStorage.getRefresh())
  const [user, setUser]                 = useState(() => userStorage.get() || buildUserFromToken(tokenStorage.getAccess()))
  const [avatar, setAvatar]             = useState(() => avatarStorage.get())
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
    const restoreSession = async () => {
      const storedAccess  = tokenStorage.getAccess()
      const storedRefresh = tokenStorage.getRefresh()

      if (storedAccess) {
        setAccessToken(storedAccess)
        setRefreshToken(storedRefresh)

        try {
          const profile = await authApi.getProfile()
          if (mounted.current) {
            setUser(profile)
            userStorage.set(profile)
          }
        } catch (err) {
          console.error('Failed to fetch user profile on session restore:', err)
          // If token was invalid and cleared by client interceptor
          if (!tokenStorage.getAccess() && mounted.current) {
            setUser(null)
            userStorage.clear()
            setAccessToken(null)
            setRefreshToken(null)
          }
        }
      }

      if (mounted.current) setIsLoading(false)
    }

    restoreSession()
  }, [])

  // ── login() ───────────────────────────────────────────────────────────
  const login = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password })
    // data = { access, refresh }
    tokenStorage.setTokens(data)
    setAccessToken(data.access)
    setRefreshToken(data.refresh)

    try {
      const profile = await authApi.getProfile()
      userStorage.set(profile)
      setUser(profile)
      return profile
    } catch (err) {
      const fallbackUser = { username, email: null }
      userStorage.set(fallbackUser)
      setUser(fallbackUser)
      return fallbackUser
    }
  }, [])

  // ── register() ────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    // Step 1: create account (returns created user)
    const registeredUser = await authApi.register({ username, email, password })
    // Step 2: auto-login so the user lands straight in the app
    const loginData = await authApi.login({ username, password })
    tokenStorage.setTokens(loginData)
    setAccessToken(loginData.access)
    setRefreshToken(loginData.refresh)

    const profile = registeredUser?.username ? registeredUser : { username, email }
    userStorage.set(profile)
    setUser(profile)

    return profile
  }, [])

  // ── logout() ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.clearTokens()
    avatarStorage.clear()
    userStorage.clear()
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    setAvatar(null)
    toast.success('Signed out successfully')
  }, [])

  // ── updateUser() — patch local user data (email, first_name/name, avatar) ────
  // Called by ProfilePage after the user edits their profile.
  const updateUser = useCallback(({ email, first_name, name, avatar: newAvatar } = {}) => {
    setUser((prev) => {
      const updatedName = first_name !== undefined ? first_name : name
      const updated = {
        ...prev,
        ...(email !== undefined ? { email } : {}),
        ...(updatedName !== undefined ? { first_name: updatedName, name: updatedName } : {}),
      }
      userStorage.set(updated)
      return updated
    })

    if (newAvatar !== undefined) {
      if (newAvatar) {
        avatarStorage.set(newAvatar)
      } else {
        avatarStorage.clear()
      }
      setAvatar(newAvatar || null)
    }
  }, [])

  // ── Context value — memoised to prevent re-render on unrelated state ──
  const value = useMemo(
    () => ({
      user,
      avatar,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, avatar, accessToken, refreshToken, isAuthenticated, isLoading, login, register, logout, updateUser]
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
