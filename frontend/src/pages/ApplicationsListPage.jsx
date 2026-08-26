import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Briefcase,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  FilePlus2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import Navbar         from '@/components/layout/Navbar'
import Button         from '@/components/ui/Button'
import { Card }       from '@/components/ui/Card'
import Badge, { StatusBadge, STATUS_LABELS } from '@/components/ui/Badge'
import Modal          from '@/components/ui/Modal'
import Spinner        from '@/components/ui/Spinner'
import Input          from '@/components/ui/Input'
import { useApplications } from '@/hooks/useApplications'
import ApplicationForm from '@/features/applications/ApplicationForm'

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUSES = ['applied', 'interview', 'offer', 'rejected']

/** Format 'YYYY-MM-DD' → 'DD Mon YYYY', e.g. '12 Aug 2026' */
function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

/** Format ISO datetime → '28 Aug, 2:00 PM' */
export function formatInterviewDateTime(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr
    const dayStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${dayStr}, ${timeStr}`
  } catch {
    return isoStr
  }
}

/** Safely escape a field for CSV (RFC 4180) */
function escapeCsvField(val) {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  return `"${str.replace(/"/g, '""')}"`
}

/** Convert applications array to CSV string */
function exportApplicationsToCSV(applications) {
  const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Follow-up Date', 'Interview Date', 'Job Link', 'Notes']
  const headerRow = headers.map(escapeCsvField).join(',')

  const rows = applications.map((app) => {
    const statusLabel = STATUS_LABELS[app.status] || app.status || ''
    const interviewFormatted = app.interview_date ? formatInterviewDateTime(app.interview_date) : ''
    return [
      escapeCsvField(app.company),
      escapeCsvField(app.role),
      escapeCsvField(statusLabel),
      escapeCsvField(app.applied_date),
      escapeCsvField(app.follow_up_date),
      escapeCsvField(interviewFormatted),
      escapeCsvField(app.job_link),
      escapeCsvField(app.notes),
    ].join(',')
  })

  // Prepend UTF-8 BOM so Excel opens non-ASCII properly
  return '\uFEFF' + [headerRow, ...rows].join('\r\n')
}

// ── Follow-up Date Badge Component ───────────────────────────────────────────
export function FollowUpBadge({ date }) {
  if (!date) return <span className="text-neutral-300 text-xs">—</span>

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date + 'T00:00:00')
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  const formattedDate = formatDate(date)

  if (diffDays < 0) {
    return (
      <span
        title={`Follow-up date was ${formattedDate}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200"
      >
        <AlertTriangle size={11} className="shrink-0 text-rose-600" />
        {diffDays === -1 ? 'Yesterday' : `${Math.abs(diffDays)}d overdue`}
      </span>
    )
  }

  if (diffDays === 0) {
    return (
      <span
        title={`Follow-up scheduled for today (${formattedDate})`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
      >
        <Clock size={11} className="shrink-0 text-rose-600" />
        Today
      </span>
    )
  }

  if (diffDays <= 7) {
    return (
      <span
        title={`Follow-up scheduled for ${formattedDate}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
      >
        <Clock size={11} className="shrink-0 text-amber-600" />
        {diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`}
      </span>
    )
  }

  return (
    <span className="text-xs text-neutral-600 font-medium">
      {formattedDate}
    </span>
  )
}

// ── Interview Date Badge Component ───────────────────────────────────────────
export function InterviewBadge({ isoString }) {
  if (!isoString) return <span className="text-neutral-300 text-xs">—</span>

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(isoString)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)

  const diffTime = dDay.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (diffDays === 0) {
    return (
      <span
        title={`Interview scheduled for today at ${timeStr}`}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse shadow-sm"
      >
        <Clock size={11} className="shrink-0 text-amber-700" />
        Today, {timeStr}
      </span>
    )
  }

  if (diffDays > 0 && diffDays <= 7) {
    const dayName = diffDays === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' })
    return (
      <span
        title={`Interview on ${formatInterviewDateTime(isoString)}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
      >
        <Video size={11} className="shrink-0 text-indigo-600" />
        {dayName}, {timeStr}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-neutral-600 font-medium">
      <Video size={11} className="shrink-0 text-neutral-400" />
      {formatInterviewDateTime(isoString)}
    </span>
  )
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-neutral-100 animate-pulse">
      {[60, 48, 28, 32, 28, 20].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 bg-neutral-200 rounded-md"
            style={{ width: `${w}%`, maxWidth: '200px' }}
          />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
      </td>
    </tr>
  )
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 w-32 bg-neutral-200 rounded mb-2" />
          <div className="h-3 w-24 bg-neutral-200 rounded" />
        </div>
        <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
      </div>
      <div className="h-3 w-28 bg-neutral-100 rounded" />
    </Card>
  )
}

// ── Status Dropdown (quick status change) ─────────────────────────────────────
function StatusDropdown({ application, onChangeStatus }) {
  const [open, setOpen] = useState(false)

  const handleSelect = async (status) => {
    setOpen(false)
    if (status === application.status) return
    try {
      await onChangeStatus(application.id, status)
    } catch { /* error already handled in hook */ }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 group"
        aria-label="Change application status"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StatusBadge status={application.status} size="sm" dot />
        <ChevronDown
          size={12}
          className="text-neutral-400 group-hover:text-neutral-600 transition-colors"
        />
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className={[
              'absolute top-full left-0 mt-1 z-20',
              'bg-white border border-neutral-200 rounded-xl shadow-lg',
              'min-w-[140px] py-1 overflow-hidden',
            ].join(' ')}
          >
            {STATUSES.map((s) => (
              <li key={s}>
                <button
                  role="option"
                  aria-selected={application.status === s}
                  onClick={() => handleSelect(s)}
                  className={[
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-neutral-50 transition-colors text-left',
                    application.status === s ? 'bg-neutral-50 font-medium' : '',
                  ].join(' ')}
                >
                  <StatusBadge status={s} size="sm" dot />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteConfirmModal({ application, onConfirm, onCancel, isDeleting }) {
  return (
    <Modal
      isOpen={Boolean(application)}
      onClose={onCancel}
      title="Delete application"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={isDeleting}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </>
      }
    >
      {application && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 mx-auto">
            <AlertTriangle size={22} className="text-rose-500" />
          </div>
          <p className="text-sm text-neutral-700 text-center leading-relaxed">
            Are you sure you want to delete the application at{' '}
            <span className="font-semibold text-neutral-900">
              {application.company}
            </span>
            ? This cannot be undone.
          </p>
        </div>
      )}
    </Modal>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4">
        <FilePlus2 size={24} className="text-primary-500" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            No applications match
          </h3>
          <p className="text-sm text-neutral-500 max-w-xs">
            Try adjusting your search or filters.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            No applications yet
          </h3>
          <p className="text-sm text-neutral-500 max-w-xs mb-6">
            Start tracking your job search by adding your first application.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={15} />}
            onClick={onAddClick}
          >
            Add your first application
          </Button>
        </>
      )}
    </div>
  )
}

// ── Desktop Table ─────────────────────────────────────────────────────────────
function ApplicationsTable({ applications, onEdit, onDelete, onChangeStatus }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {['Company', 'Role', 'Status', 'Applied', 'Follow-up', 'Interview', 'Link', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr
              key={app.id}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-0"
            >
              <td className="px-4 py-3.5">
                <span className="font-semibold text-neutral-900">{app.company}</span>
              </td>
              <td className="px-4 py-3.5 text-neutral-600">{app.role}</td>
              <td className="px-4 py-3.5">
                <StatusDropdown
                  application={app}
                  onChangeStatus={onChangeStatus}
                />
              </td>
              <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                {formatDate(app.applied_date)}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <FollowUpBadge date={app.follow_up_date} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <InterviewBadge isoString={app.interview_date} />
              </td>
              <td className="px-4 py-3.5">
                {app.job_link ? (
                  <a
                    href={app.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                    title={app.job_link}
                  >
                    <ExternalLink size={13} />
                    <span className="text-xs">Link</span>
                  </a>
                ) : (
                  <span className="text-neutral-300 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(app)}
                    aria-label={`Edit application at ${app.company}`}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    aria-label={`Delete application at ${app.company}`}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Mobile Card List ─────────────────────────────────────────────────────────
function ApplicationCard({ app, onEdit, onDelete, onChangeStatus }) {
  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900 truncate text-base">{app.company}</p>
          <p className="text-sm text-neutral-500 truncate mt-0.5">{app.role}</p>
        </div>
        <StatusDropdown application={app} onChangeStatus={onChangeStatus} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-medium">Applied: {formatDate(app.applied_date)}</span>
          {app.follow_up_date && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-medium">Follow-up:</span>
              <FollowUpBadge date={app.follow_up_date} />
            </div>
          )}
          {app.interview_date && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-medium">Interview:</span>
              <InterviewBadge isoString={app.interview_date} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {app.job_link && (
            <a
              href={app.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              aria-label={`Open job posting for ${app.company}`}
            >
              <ExternalLink size={15} />
            </a>
          )}
          <button
            onClick={() => onEdit(app)}
            aria-label={`Edit application at ${app.company}`}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(app)}
            aria-label={`Delete application at ${app.company}`}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationsListPage() {
  const {
    filtered,
    isLoading,
    error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    create, update, changeStatus, remove,
  } = useApplications()

  // Modal state
  const [formOpen,      setFormOpen]      = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)  // null = create mode
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [isDeleting,    setIsDeleting]    = useState(false)

  const hasFilters = searchQuery.trim() || statusFilter !== 'all'

  // ── Handlers ───────────────────────────────────────────────────────────
  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit   = (app) => { setEditTarget(app); setFormOpen(true) }
  const closeForm  = () => { setFormOpen(false); setEditTarget(null) }

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (editTarget) {
        await update(editTarget.id, data)
      } else {
        await create(data)
      }
      closeForm()
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err?.message ?? 'Delete failed.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No applications to export')
      return
    }

    const csvContent = exportApplicationsToCSV(filtered)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const filename = `job-applications-${today}.csv`

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filtered.length} application${filtered.length !== 1 ? 's' : ''} to CSV!`)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={18} className="text-primary-600" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Applications
              </h1>
              {!isLoading && (
                <Badge variant="neutral" size="sm">
                  {filtered.length}
                </Badge>
              )}
            </div>
            <p className="text-sm text-neutral-500">
              Track every role you&apos;ve applied for.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Download size={15} />}
              onClick={handleExportCSV}
              id="export-csv-btn"
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={15} />}
              onClick={openCreate}
              id="add-application-btn"
            >
              Add application
            </Button>
          </div>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by company or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={[
                'w-full h-10 sm:h-9 pl-10 pr-10 text-sm rounded-lg',
                'bg-white border border-neutral-200 shadow-sm',
                'placeholder:text-neutral-400 text-neutral-900',
                'outline-none transition-all duration-150',
                'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              ].join(' ')}
              aria-label="Search applications by company or role"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={[
              'h-10 sm:h-9 px-3.5 pr-8 text-sm rounded-lg min-w-[150px]',
              'bg-white border border-neutral-200 shadow-sm',
              'text-neutral-700 font-medium cursor-pointer',
              'outline-none transition-all duration-150',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            ].join(' ')}
            aria-label="Filter by application status"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* ── Content area ── */}
        {isLoading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {['Company', 'Role', 'Status', 'Applied', 'Link', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="grid md:hidden gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : error ? (
          <Card className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle size={32} className="text-rose-400" />
              <p className="text-sm font-medium text-neutral-700">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onAddClick={openCreate} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <ApplicationsTable
                applications={filtered}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onChangeStatus={changeStatus}
              />
            </div>
            {/* Mobile cards */}
            <div className="grid md:hidden gap-3">
              {filtered.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onChangeStatus={changeStatus}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Result count ── */}
        {!isLoading && !error && filtered.length > 0 && (
          <p className="mt-4 text-xs text-neutral-400 text-right">
            Showing {filtered.length} application{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        )}
      </main>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editTarget ? `Edit — ${editTarget.company}` : 'Add Application'}
        description={editTarget ? 'Update the details for this application.' : 'Fill in the details to track a new application.'}
        size="lg"
      >
        <ApplicationForm
          initialValues={editTarget}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <DeleteConfirmModal
        application={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
