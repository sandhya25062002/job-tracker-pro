import apiClient from '@/api/client'

/**
 * features/auth/authApi.js
 *
 * Auth service functions hitting Django + SimpleJWT endpoints.
 * All functions use the shared Axios instance which handles
 * token attachment and 401 refresh via its interceptors.
 */

/** POST /api/register/ */
export async function register({ username, email, password }) {
  const { data } = await apiClient.post('/register/', { username, email, password })
  return data
}

/** POST /api/login/ → returns { access, refresh } */
export async function login({ username, password }) {
  const { data } = await apiClient.post('/login/', { username, password })
  return data // { access, refresh }
}

/** POST /api/login/refresh/ → returns { access } */
export async function refreshToken(refresh) {
  const { data } = await apiClient.post('/login/refresh/', { refresh })
  return data // { access }
}

/**
 * logout — client-side only for now.
 * If the backend exposes a token-blacklist endpoint in a later stage,
 * call it here before clearing local state.
 */
export async function logout() {
  // Future: await apiClient.post('/logout/', { refresh })
  return true
}
