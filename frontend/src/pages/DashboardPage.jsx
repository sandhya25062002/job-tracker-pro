import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  LayoutDashboard,
  ListChecks,
} from 'lucide-react'
import { useAuth } from '@/context'
import { useApplications } from '@/hooks/useApplications'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import Button  from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Navbar  from '@/components/layout/Navbar'

/** Format 'YYYY-MM-DD' → nice date string */
function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

const PIPELINE_STATUSES = ['applied', 'interview', 'offer', 'rejected']

export default function DashboardPage() {
  const { user } = useAuth()
  const { applications, isLoading } = useApplications()
  const navigate = useNavigate()

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = PIPELINE_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }))

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.created_at || b.applied_date) - new Date(a.created_at || a.applied_date))
    .slice(0, 5)

  const statCardColors = {
    applied:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'   },
    interview: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100'  },
    offer:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100'  },
    rejected:  { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-100'   },
  }

  const statLabels = {
    applied: 'Applied', interview: 'Interviewing', offer: 'Offers', rejected: 'Rejected',
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Welcome ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={18} className="text-primary-600" />
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Welcome back,{' '}
            <span className="font-semibold text-neutral-700">{user?.username ?? 'there'}</span>.
            {' '}Here&apos;s your job search at a glance.
          </p>
        </div>

        {/* ── Pipeline stats grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {PIPELINE_STATUSES.map((s) => (
              <Card key={s} className="animate-pulse h-24">
                <div className="h-full flex flex-col justify-between">
                  <div className="h-3 w-16 bg-neutral-200 rounded" />
                  <div className="h-8 w-10 bg-neutral-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ status, count }) => {
              const c = statCardColors[status]
              return (
                <Link
                  key={status}
                  to={`/applications`}
                  className={[
                    'rounded-xl border p-5 flex flex-col gap-2',
                    'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
                    c.bg, c.border,
                  ].join(' ')}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
                    {statLabels[status]}
                  </span>
                  <span className={`text-3xl font-bold ${c.text}`}>{count}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Recent applications ── */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks size={15} className="text-primary-600" />
              Recent Applications
            </CardTitle>
            <Link
              to="/applications"
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : recentApps.length === 0 ? (
              <div className="text-center py-10">
                <Briefcase size={28} className="text-neutral-300 mx-auto mb-3" />
                <CardDescription>No applications yet.</CardDescription>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/applications')}
                >
                  Add your first application
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentApps.map((app) => (
                  <li key={app.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {app.company}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{app.role}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-neutral-400 hidden sm:block">
                        {formatDate(app.applied_date)}
                      </span>
                      <StatusBadge status={app.status} size="sm" dot />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Stage checklist ── */}
        <Card variant="flat">
          <CardHeader>
            <CardTitle className="text-sm">Project progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {[
                { done: true,  label: 'Stage 1 — Vite + Tailwind v4 design system' },
                { done: true,  label: 'Stage 2 — JWT auth (login, register, protected routes)' },
                { done: true,  label: 'Stage 3 — Applications CRUD' },
                { done: false, label: 'Stage 4 — Dashboard charts & analytics' },
              ].map(({ done, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <CheckCircle
                    size={16}
                    className={done ? 'text-green-500' : 'text-neutral-300'}
                    strokeWidth={done ? 2.5 : 1.5}
                  />
                  <span className={`text-sm ${done ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
