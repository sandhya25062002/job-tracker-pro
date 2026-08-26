import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Clock,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  TrendingUp,
  Video,
} from 'lucide-react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth }         from '@/context'
import { useApplications } from '@/hooks/useApplications'
import { FollowUpBadge, InterviewBadge } from '@/pages/ApplicationsListPage'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import Button  from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Navbar  from '@/components/layout/Navbar'

// ── Design-system status colors (match Badge.jsx) ─────────────────────────────
const STATUS_COLORS = {
  applied:   '#3b82f6', // blue-500
  interview: '#f59e0b', // amber-500
  offer:     '#22c55e', // green-500
  rejected:  '#f43f5e', // rose-500
}

const STATUS_LABELS = {
  applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

const PIPELINE_STATUSES = ['applied', 'interview', 'offer', 'rejected']

const STAT_CARD_STYLES = {
  applied:   { bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-100'  },
  interview: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  offer:     { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  rejected:  { bg: 'bg-rose-50',  text: 'text-rose-700',  border: 'border-rose-100'  },
}

const STAT_LABELS = {
  applied: 'Applied', interview: 'Interviewing', offer: 'Offers', rejected: 'Rejected',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

/**
 * Groups applications by applied_date into weekly or monthly buckets.
 * Uses weekly when the full date range is < 90 days, monthly otherwise.
 */
function buildTimelineData(applications) {
  if (!applications.length) return { data: [], granularity: 'week' }

  const valid = applications.filter((a) => a.applied_date)
  if (!valid.length) return { data: [], granularity: 'week' }

  const dates = valid.map((a) => new Date(a.applied_date + 'T00:00:00'))
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))
  const rangeDays = (maxDate - minDate) / (1000 * 60 * 60 * 24)
  const granularity = rangeDays < 90 ? 'week' : 'month'

  const buckets = {}

  valid.forEach((app) => {
    const d = new Date(app.applied_date + 'T00:00:00')
    let key

    if (granularity === 'week') {
      // ISO week start (Monday)
      const day = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((day + 6) % 7))
      key = monday.toISOString().split('T')[0]
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    buckets[key] = (buckets[key] ?? 0) + 1
  })

  const sorted = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rawKey, count]) => {
      let label
      if (granularity === 'week') {
        const d = new Date(rawKey + 'T00:00:00')
        label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      } else {
        const [year, month] = rawKey.split('-')
        label = new Date(Number(year), Number(month) - 1, 1)
          .toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      }
      return { label, count }
    })

  return { data: sorted, granularity }
}

// ── Custom Recharts pieces ────────────────────────────────────────────────────

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-3.5 py-2.5 text-sm">
      <p className="font-semibold text-neutral-700 mb-1">{label}</p>
      <p className="text-neutral-900">
        <span className="font-bold text-primary-600">{payload[0].value}</span>
        {' '}application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function CustomTooltipPie({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  const pct = p?.percent != null ? Math.round(p.percent * 100) : '—'
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-3.5 py-2.5 text-sm">
      <p className="font-semibold text-neutral-700 mb-0.5">{name}</p>
      <p className="text-neutral-900">
        <span className="font-bold">{value}</span> · {pct}%
      </p>
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map(({ value, color }) => (
        <li key={value} className="flex items-center gap-1.5 text-xs text-neutral-600">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          {value}
        </li>
      ))}
    </ul>
  )
}

// ── Skeleton for chart panels ────────────────────────────────────────────────
function ChartSkeleton({ height = 220 }) {
  return (
    <div
      className="animate-pulse bg-neutral-100 rounded-xl w-full"
      style={{ height }}
    />
  )
}

// ── Response Rate Card ────────────────────────────────────────────────────────
function ResponseRateCard({ total, responded, rate, isLoading }) {
  const circumference = 2 * Math.PI * 30 // r=30
  const offset = circumference - (rate / 100) * circumference

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare size={15} className="text-primary-600" />
          Response Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
        {isLoading ? (
          <ChartSkeleton height={140} />
        ) : total === 0 ? (
          <p className="text-sm text-neutral-400 text-center">No data yet</p>
        ) : (
          <>
            {/* Circular progress */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                {/* Track */}
                <circle
                  cx="36" cy="36" r="30"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="7"
                />
                {/* Progress */}
                <circle
                  cx="36" cy="36" r="30"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-neutral-900">
                  {rate}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 leading-relaxed">
                <span className="font-semibold text-neutral-800">{responded}</span> of{' '}
                <span className="font-semibold text-neutral-800">{total}</span> applications
                received a response
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }   = useAuth()
  const { applications, isLoading } = useApplications()
  const navigate   = useNavigate()

  const displayName = user?.first_name || user?.name || user?.username || 'there'

  // ── Derived analytics ─────────────────────────────────────────────────────
  const stats = useMemo(() =>
    PIPELINE_STATUSES.map((status) => ({
      status,
      count: applications.filter((a) => a.status === status).length,
    })),
  [applications])

  const donutData = useMemo(() =>
    PIPELINE_STATUSES
      .map((status) => ({
        name:  STATUS_LABELS[status],
        value: applications.filter((a) => a.status === status).length,
        color: STATUS_COLORS[status],
      }))
      .filter((d) => d.value > 0),
  [applications])

  const { data: timelineData, granularity } = useMemo(
    () => buildTimelineData(applications),
    [applications]
  )

  const responseRate = useMemo(() => {
    const total = applications.length
    if (total === 0) return { total: 0, responded: 0, rate: 0 }
    const responded = applications.filter(
      (a) => ['interview', 'offer', 'rejected'].includes(a.status)
    ).length
    return { total, responded, rate: Math.round((responded / total) * 100) }
  }, [applications])

  const recentApps = useMemo(() =>
    [...applications]
      .sort((a, b) =>
        new Date(b.created_at || b.applied_date) -
        new Date(a.created_at || a.applied_date)
      )
      .slice(0, 5),
  [applications])

  // Upcoming Follow-ups: exclude rejected, include follow_up_date within next 7 days (or overdue)
  const upcomingFollowUps = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return applications
      .filter((a) => {
        if (!a.follow_up_date || a.status === 'rejected') return false
        const target = new Date(a.follow_up_date + 'T00:00:00')
        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      })
      .sort((a, b) => new Date(a.follow_up_date + 'T00:00:00') - new Date(b.follow_up_date + 'T00:00:00'))
      .slice(0, 5)
  }, [applications])

  // Upcoming Interviews: exclude rejected, exclude past interviews, within next 7 days
  const upcomingInterviews = useMemo(() => {
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return applications
      .filter((a) => {
        if (!a.interview_date || a.status === 'rejected') return false
        const target = new Date(a.interview_date)
        return target >= now && target <= sevenDaysLater
      })
      .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))
      .slice(0, 5)
  }, [applications])

  const hasData = applications.length > 0

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Welcome header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={18} className="text-primary-600" />
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Welcome back,{' '}
            <span className="font-semibold text-neutral-700">{displayName}</span>.
            {' '}Here&apos;s your job search at a glance.
          </p>
        </div>

        {/* ── 4 Pipeline stat cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PIPELINE_STATUSES.map((s) => (
              <Card key={s} className="animate-pulse h-[88px]">
                <div className="h-full flex flex-col justify-between">
                  <div className="h-2.5 w-16 bg-neutral-200 rounded" />
                  <div className="h-8 w-10 bg-neutral-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ status, count }) => {
              const c = STAT_CARD_STYLES[status]
              return (
                <Link
                  key={status}
                  to="/applications"
                  className={[
                    'rounded-xl border p-5 flex flex-col gap-2 group',
                    'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
                    c.bg, c.border,
                  ].join(' ')}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
                    {STAT_LABELS[status]}
                  </span>
                  <span className={`text-3xl font-bold ${c.text}`}>{count}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Analytics section ── */}
        {!isLoading && !hasData ? (
          /* ── Empty state ── */
          <Card className="mb-6 py-14 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-primary-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-neutral-900 mb-1">
                  No analytics yet
                </p>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                  Add your first application to start seeing your pipeline charts and trends.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/applications')}
              >
                Add your first application
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

              {/* Donut chart — 1 col */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1 py-2">
                  {isLoading ? (
                    <ChartSkeleton height={200} />
                  ) : donutData.length === 0 ? (
                    <p className="text-sm text-neutral-400">No data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={donutData.length > 1 ? 3 : 0}
                          strokeWidth={0}
                        >
                          {donutData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltipPie />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Bar / timeline chart — 2 cols */}
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    Applications Over Time
                    <span className="ml-1 text-xs font-normal text-neutral-400">
                      ({granularity === 'week' ? 'weekly' : 'monthly'})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 py-2">
                  {isLoading ? (
                    <ChartSkeleton height={200} />
                  ) : timelineData.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-sm text-neutral-400">No dated applications</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart
                        data={timelineData}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                        barCategoryGap="30%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                          width={36}
                        />
                        <Tooltip
                          content={<CustomTooltipBar />}
                          cursor={{ fill: '#f3f4f6', radius: 6 }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Response rate card & Pipeline summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <ResponseRateCard
                total={responseRate.total}
                responded={responseRate.responded}
                rate={responseRate.rate}
                isLoading={isLoading}
              />

              {/* Quick-stats summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp size={15} className="text-primary-600" />
                    Pipeline Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Total sent',
                        value: applications.length,
                        sub: 'all time',
                        color: 'text-neutral-900',
                      },
                      {
                        label: 'In progress',
                        value: stats.find((s) => s.status === 'interview')?.count ?? 0,
                        sub: 'interviewing',
                        color: 'text-amber-600',
                      },
                      {
                        label: 'Offers',
                        value: stats.find((s) => s.status === 'offer')?.count ?? 0,
                        sub: 'received',
                        color: 'text-green-600',
                      },
                      {
                        label: 'Response rate',
                        value: `${responseRate.rate}%`,
                        sub: `${responseRate.responded} responses`,
                        color: 'text-primary-600',
                      },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                        <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                          {label}
                        </dt>
                        <dd className={`text-2xl font-bold ${color}`}>{value}</dd>
                        <span className="text-xs text-neutral-400">{sub}</span>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ── Upcoming Interviews, Upcoming Follow-ups & Recent Applications ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Video size={15} className="text-indigo-600" />
                Upcoming Interviews
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
                <div className="space-y-3.5 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-neutral-200 rounded" />
                        <div className="h-3 w-20 bg-neutral-100 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : upcomingInterviews.length === 0 ? (
                <div className="text-center py-10">
                  <Video size={28} className="text-indigo-400/80 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-800">No interviews scheduled</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Keep applying!</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {upcomingInterviews.map((app) => (
                    <li key={app.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {app.company}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{app.role}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={app.status} size="sm" dot />
                        <InterviewBadge isoString={app.interview_date} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock size={15} className="text-amber-600" />
                Upcoming Follow-ups
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
                <div className="space-y-3.5 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-neutral-200 rounded" />
                        <div className="h-3 w-20 bg-neutral-100 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : upcomingFollowUps.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarCheck size={28} className="text-emerald-500/80 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-800">No upcoming follow-ups</p>
                  <p className="text-xs text-neutral-400 mt-0.5">You&apos;re all caught up!</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {upcomingFollowUps.map((app) => (
                    <li key={app.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {app.company}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{app.role}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={app.status} size="sm" dot />
                        <FollowUpBadge date={app.follow_up_date} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
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
                <div className="space-y-3.5 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-neutral-200 rounded" />
                        <div className="h-3 w-20 bg-neutral-100 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
                    </div>
                  ))}
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
        </div>

      </main>
    </div>
  )
}

