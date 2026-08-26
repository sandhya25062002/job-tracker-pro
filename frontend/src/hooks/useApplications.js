import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createApplication,
  deleteApplication,
  getApplications,
  patchApplication,
  updateApplication,
} from '@/features/applications/applicationsApi'

/**
 * useApplications — data layer hook for the applications feature
 *
 * Manages:
 *   - Fetching and caching the applications list
 *   - Loading / error state
 *   - Client-side search (company + role) and status filtering
 *   - CRUD mutations that optimistically update the local list
 *     and emit toast notifications
 *
 * Note: filtering is done client-side because the backend doesn't
 * expose confirmed query-param filtering yet. When it does, move the
 * filter params into the getApplications() call.
 */
export function useApplications() {
  const [applications, setApplications] = useState([])
  const [isLoading,    setIsLoading]    = useState(true)
  const [error,        setError]        = useState(null)

  // Filter state
  const [searchQuery,   setSearchQuery]   = useState('')
  const [statusFilter,  setStatusFilter]  = useState('all')

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    if (mounted.current) setIsLoading(true)
    try {
      const data = await getApplications()
      if (mounted.current) {
        setApplications(data)
        setError(null)
      }
    } catch (err) {
      if (mounted.current) {
        setError(err?.message ?? 'Failed to load applications.')
      }
    } finally {
      if (mounted.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = applications

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      )
    }

    return list
  }, [applications, statusFilter, searchQuery])

  // ── Create ───────────────────────────────────────────────────────────────
  const create = useCallback(async (payload) => {
    const newApp = await createApplication(payload)
    setApplications((prev) => [newApp, ...prev])
    toast.success(`Application to ${newApp.company} added!`)
    return newApp
  }, [])

  // ── Update (full) ────────────────────────────────────────────────────────
  const update = useCallback(async (id, payload) => {
    const updated = await updateApplication(id, payload)
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    )
    toast.success(`${updated.company} updated.`)
    return updated
  }, [])

  // ── Quick status patch ───────────────────────────────────────────────────
  const changeStatus = useCallback(async (id, newStatus) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    )
    try {
      const updated = await patchApplication(id, { status: newStatus })
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      )
      toast.success('Status updated.')
    } catch (err) {
      // Roll back on failure
      fetchApplications()
      toast.error(err?.message ?? 'Failed to update status.')
      throw err
    }
  }, [fetchApplications])

  // ── Delete ───────────────────────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    const app = applications.find((a) => a.id === id)
    await deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
    toast.success(`Application at ${app?.company ?? 'company'} deleted.`)
  }, [applications])

  return {
    // Data
    applications,
    filtered,
    isLoading,
    error,
    // Filter controls
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    // Mutations
    refetch: fetchApplications,
    create,
    update,
    changeStatus,
    remove,
  }
}

export default useApplications
