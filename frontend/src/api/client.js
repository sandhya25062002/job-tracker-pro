import axios from 'axios'

/**
 * api/client.js — Axios instance for Job Tracker Pro API
 *
 * Token storage strategy: localStorage
 *   - Simpler than httpOnly cookies and works well for SPAs.
 *   - Trade-off: tokens are accessible to JS, so XSS is a risk.
 *     Mitigate with strict CSP headers and sanitised user input.
 *     A production hardened version would use httpOnly cookies +
 *     a CSRF-token approach handled by the backend.
 */

// ── Token helpers ──────────────────────────────────────────────────────────
// These are used by the interceptors below AND exported so AuthContext
// can set/clear tokens without importing apiClient circularly.

const ACCESS_KEY  = 'jtp_access'
const REFRESH_KEY = 'jtp_refresh'

export const tokenStorage = {
  getAccess:    () => localStorage.getItem(ACCESS_KEY),
  getRefresh:   () => localStorage.getItem(REFRESH_KEY),
  setAccess:    (token) => localStorage.setItem(ACCESS_KEY, token),
  setRefresh:   (token) => localStorage.setItem(REFRESH_KEY, token),
  setTokens:    ({ access, refresh }) => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clearTokens:  () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ── Axios instance ─────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request Interceptor: attach access token ───────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor: 401 → refresh → retry ───────────────────────────
// Uses a flag (_retry) on the original request config to prevent
// infinite retry loops when the refresh itself returns 401.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refresh = tokenStorage.getRefresh()

      if (refresh) {
        try {
          // Call refresh endpoint directly (not via apiClient to avoid
          // triggering this interceptor again)
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'}/login/refresh/`,
            { refresh },
            { headers: { 'Content-Type': 'application/json' } }
          )
          tokenStorage.setAccess(data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return apiClient(originalRequest)
        } catch (_refreshError) {
          // Refresh failed — clear tokens and kick user to /login
          tokenStorage.clearTokens()
          window.location.replace('/login')
          return Promise.reject(_refreshError)
        }
      } else {
        // No refresh token — go to login
        tokenStorage.clearTokens()
        window.location.replace('/login')
      }
    }

    // Normalise error shape for consistent consumer handling
    const normalisedError = {
      status:  error.response?.status,
      message: error.response?.data?.detail
               ?? error.response?.data?.message
               ?? error.message,
      data:    error.response?.data ?? null,
    }

    return Promise.reject(normalisedError)
  }
)

export default apiClient
