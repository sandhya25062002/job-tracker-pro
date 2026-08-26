import { Briefcase, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuth } from '@/context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Navbar from '@/components/layout/Navbar'

/**
 * DashboardPage — /dashboard
 * Stage 2 placeholder. Full implementation (stats, charts, recent
 * activity) comes in Stage 3.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={18} className="text-primary-600" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-neutral-500">
              Welcome back,{' '}
              <span className="font-semibold text-neutral-700">
                {user?.username ?? 'there'}
              </span>
              . Your job search hub is ready.
            </p>
          </div>
          <Badge variant="primary" size="md" dot>Stage 2 — Auth complete</Badge>
        </div>

        {/* Placeholder content card */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase size={16} className="text-primary-600" />
              Dashboard — Stage 3
            </CardTitle>
            <Badge variant="neutral" size="sm">Coming soon</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed">
              This is the authenticated dashboard. Full features — application
              table, pipeline stats, charts, and quick-add form — will be built
              in Stage 3.
            </CardDescription>

            {/* Auth confirmation block */}
            <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-widest mb-3">
                Authentication confirmed ✓
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Username"  value={user?.username ?? '—'} />
                <InfoRow label="User ID"   value={user?.id       ?? '—'} />
                <InfoRow label="Email"     value={user?.email    ?? '—'} />
                <InfoRow label="Status"    value="Active session" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage checklist */}
        <Card variant="flat" className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Stage progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {[
                { done: true,  label: 'Stage 1 — Vite + Tailwind v4 design system' },
                { done: true,  label: 'Stage 2 — Auth (JWT login, register, protected routes)' },
                { done: false, label: 'Stage 3 — Applications CRUD & dashboard charts' },
                { done: false, label: 'Stage 4 — Timeline, notes, reminders' },
              ].map(({ done, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={[
                      'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-xs',
                      done ? 'bg-green-500' : 'bg-neutral-200',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {done && '✓'}
                  </span>
                  <span
                    className={[
                      'text-sm',
                      done ? 'text-neutral-700' : 'text-neutral-400',
                    ].join(' ')}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="flex justify-end">
          <Button
            variant="danger"
            size="sm"
            leftIcon={<LogOut size={14} />}
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-primary-900">
        {String(value)}
      </span>
    </div>
  )
}
