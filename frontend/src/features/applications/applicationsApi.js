import apiClient from '@/api/client'

/**
 * features/applications/applicationsApi.js
 *
 * CRUD service for JobApplication resources.
 * All calls are JWT-authenticated via the request interceptor in api/client.js.
 * The backend scopes every query to the logged-in user automatically.
 *
 * Endpoint: /api/applications/
 * Fields: id, company, role, status, applied_date, job_link, notes, created_at
 */

/** GET /api/applications/ — returns all applications for the current user */
export async function getApplications() {
  const { data } = await apiClient.get('/applications/')
  return data // array of JobApplication objects
}

/** GET /api/applications/:id/ */
export async function getApplication(id) {
  const { data } = await apiClient.get(`/applications/${id}/`)
  return data
}

/**
 * POST /api/applications/
 * @param {Object} payload - { company, role, status, applied_date, job_link?, notes? }
 */
export async function createApplication(payload) {
  const { data } = await apiClient.post('/applications/', payload)
  return data
}

/**
 * PATCH /api/applications/:id/ — partial update (e.g. quick status change)
 * @param {string|number} id
 * @param {Object} patch - partial fields, e.g. { status: 'interview' }
 */
export async function patchApplication(id, patch) {
  const { data } = await apiClient.patch(`/applications/${id}/`, patch)
  return data
}

/**
 * PUT /api/applications/:id/ — full update (used by the edit form)
 * @param {string|number} id
 * @param {Object} payload - all editable fields
 */
export async function updateApplication(id, payload) {
  const { data } = await apiClient.put(`/applications/${id}/`, payload)
  return data
}

/** DELETE /api/applications/:id/ */
export async function deleteApplication(id) {
  await apiClient.delete(`/applications/${id}/`)
}
