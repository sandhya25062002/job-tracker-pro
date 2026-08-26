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

/** GET /api/profile/ → returns { id, username, email } for the logged-in user */
export async function getProfile() {
  const { data } = await apiClient.get('/profile/')
  return data // { id, username, email }
}

/** POST /api/change-password/ → body: { old_password, new_password } (authenticated) */
export async function changePassword({ old_password, new_password }) {
  const { data } = await apiClient.post('/change-password/', { old_password, new_password })
  return data
}

/** POST /api/forgot-password/ → body: { email } */
export async function forgotPassword({ email }) {
  const { data } = await apiClient.post('/forgot-password/', { email })
  return data
}

/** POST /api/reset-password/<uid>/<token>/ → body: { new_password } */
export async function resetPassword({ uid, token, new_password }) {
  const { data } = await apiClient.post(`/reset-password/${uid}/${token}/`, { new_password })
  return data
}

/** POST /api/delete-account/ → body: { password } (authenticated) */
export async function deleteAccount({ password }) {
  const { data } = await apiClient.post('/delete-account/', { password })
  return data
}

/** PATCH /api/profile/update-name/ → body: { name } (authenticated) */
export async function updateName({ name }) {
  const { data } = await apiClient.patch('/profile/update-name/', { name })
  return data // returns updated profile including first_name
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



