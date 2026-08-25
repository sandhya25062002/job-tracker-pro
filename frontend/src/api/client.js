import axios from 'axios'

/**
 * api/client.js — Axios instance for Job Tracker Pro API
 *
 * Reads base URL from VITE_API_BASE_URL environment variable.
 * Includes placeholder interceptor structure for auth (Stage 2).
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request Interceptor ────────────────────────────────────────────────────
// TODO (Stage 2): Attach JWT access token from auth context / localStorage
apiClient.interceptors.request.use(
  (config) => {
    // const token = getAccessToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ───────────────────────────────────────────────────
// TODO (Stage 2): Handle 401 → refresh token → retry, or redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      // TODO (Stage 2):
      //   1. Attempt token refresh via authService.refresh()
      //   2. On success: set new token, retry originalRequest
      //   3. On failure: clear auth state, redirect to /login
    }

    // Normalise error shape for consistent consumer handling
    const normalisedError = {
      status:  error.response?.status,
      message: error.response?.data?.message ?? error.message,
      data:    error.response?.data ?? null,
    }

    return Promise.reject(normalisedError)
  }
)

export default apiClient
