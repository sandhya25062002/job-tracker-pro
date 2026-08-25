import { Toaster } from 'react-hot-toast'
import {
  Briefcase,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

// ── Design system showcase ─────────────────────────────────────────────────
// This page proves all design tokens are working and the component library
// is functional. It will be replaced by actual pages in Stage 2.

function Section({ title, description, children }) {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-1">{title}</h2>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-neutral-200 flex items-center px-6 gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <Briefcase className="text-white" size={14} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-neutral-900 tracking-tight">
            Job Tracker Pro
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="primary" size="sm">Stage 1 — Design System</Badge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Hero ── */}
        <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-primary-200" />
              <span className="text-xs font-semibold text-primary-200 uppercase tracking-widest">
                Design System Active
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Job Tracker Pro
            </h1>
            <p className="text-primary-200 text-sm max-w-lg leading-relaxed">
              Scaffold complete. Tailwind v4 design tokens are wired up and all
              UI primitives are ready. Stage 2 will add authentication, routing,
              and the first real feature pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" leftIcon={<TrendingUp size={14} />}>
                View Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-100 hover:text-white hover:bg-primary-700"
              >
                Browse Applications
              </Button>
            </div>
          </div>
        </div>

        {/* ── Buttons ── */}
        <Section
          title="Button"
          description="5 variants × 3 sizes with icon support and loading state."
        >
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="Icons & States">
            <Button leftIcon={<Briefcase size={14} />}>With Icon</Button>
            <Button rightIcon={<TrendingUp size={14} />} variant="secondary">
              Trailing Icon
            </Button>
            <Button iconOnly variant="ghost">
              <Search size={16} />
            </Button>
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Section>

        {/* ── Inputs ── */}
        <Section
          title="Input"
          description="Text input with label, helper text, error state, and icon decorators."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Company"
              placeholder="e.g. Stripe, Linear…"
              helperText="Enter the company you're applying to."
            />
            <Input
              label="Job Title"
              placeholder="e.g. Senior Engineer"
              required
            />
            <Input
              label="Search Applications"
              placeholder="Search by role or company…"
              leftDecorator={<Search size={14} />}
            />
            <Input
              label="Salary"
              placeholder="e.g. 120,000"
              leftDecorator={
                <span className="text-xs font-medium text-neutral-500">$</span>
              }
              rightDecorator={
                <span className="text-xs text-neutral-400">/yr</span>
              }
            />
            <Input
              label="Application URL"
              placeholder="https://…"
              error="Please enter a valid URL."
            />
            <Input
              label="Closed"
              placeholder="This field is disabled"
              disabled
            />
          </div>
        </Section>

        {/* ── Badges ── */}
        <Section
          title="Badge"
          description="Status chips for the job application pipeline + generic variants."
        >
          <Row label="Pipeline statuses (with dot)">
            <StatusBadge status="applied" />
            <StatusBadge status="interview" />
            <StatusBadge status="offer" />
            <StatusBadge status="rejected" />
            <StatusBadge status="saved" />
          </Row>
          <Row label="Generic variants">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="danger" dot>Error</Badge>
          </Row>
          <Row label="Sizes">
            <StatusBadge status="interview" size="sm" />
            <StatusBadge status="interview" size="md" />
            <StatusBadge status="interview" size="lg" />
          </Row>
        </Section>

        {/* ── Cards ── */}
        <Section
          title="Card"
          description="Compound container with header, content, and footer sub-components."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Default */}
            <Card>
              <CardHeader>
                <CardTitle>Stripe</CardTitle>
                <StatusBadge status="interview" size="sm" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-neutral-700">
                  Senior Software Engineer
                </p>
                <CardDescription className="mt-1">
                  Applied via LinkedIn · Remote
                </CardDescription>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-neutral-400">3 days ago</span>
                <Button variant="ghost" size="sm">View →</Button>
              </CardFooter>
            </Card>

            {/* Elevated + hoverable */}
            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>Linear</CardTitle>
                <StatusBadge status="offer" size="sm" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-neutral-700">
                  Product Designer
                </p>
                <CardDescription className="mt-1">
                  Direct referral · Hybrid SF
                </CardDescription>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-neutral-400">1 week ago</span>
                <Button variant="ghost" size="sm">View →</Button>
              </CardFooter>
            </Card>

            {/* Flat */}
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Vercel</CardTitle>
                <StatusBadge status="rejected" size="sm" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-neutral-700">
                  Frontend Engineer
                </p>
                <CardDescription className="mt-1">
                  Applied via careers page · Remote
                </CardDescription>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-neutral-400">2 weeks ago</span>
                <Button variant="ghost" size="sm">View →</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* ── Spinner ── */}
        <Section title="Spinner" description="Loading indicators in 4 sizes.">
          <Row label="Sizes">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </Row>
          <Row label="Colors">
            <Spinner color="primary" />
            <div className="p-2 bg-primary-600 rounded-lg">
              <Spinner color="white" />
            </div>
            <Spinner color="neutral" />
          </Row>
        </Section>

        {/* ── Color palette tokens ── */}
        <Section
          title="Color Palette"
          description="Design tokens in use — Primary (Indigo) + Status colors."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Applied', bg: 'bg-blue-500',     text: 'text-white' },
              { label: 'Interview', bg: 'bg-amber-500',  text: 'text-white' },
              { label: 'Offer', bg: 'bg-green-500',      text: 'text-white' },
              { label: 'Rejected', bg: 'bg-rose-500',    text: 'text-white' },
              { label: 'Primary 600', bg: 'bg-primary-600', text: 'text-white' },
              { label: 'Primary 400', bg: 'bg-primary-400', text: 'text-white' },
              { label: 'Neutral 100', bg: 'bg-neutral-100', text: 'text-neutral-700' },
              { label: 'Neutral 800', bg: 'bg-neutral-800', text: 'text-white' },
            ].map(({ label, bg, text }) => (
              <div key={label} className={`${bg} ${text} rounded-xl p-4 text-xs font-semibold`}>
                {label}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Status bar ── */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
          <CheckCircle size={16} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900">
              Stage 1 complete — design system is operational
            </p>
            <p className="text-xs text-neutral-500">
              Tailwind v4 · Inter font · React 19 · Vite 8 · All tokens wired
            </p>
          </div>
          <Badge variant="success" dot size="sm">Ready</Badge>
        </div>
      </div>

      {/* Toast container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          },
        }}
      />
    </div>
  )
}
