import { Link, Navigate } from 'react-router-dom'
import { Briefcase, Clock, Download, Sparkles } from 'lucide-react'
import { useAuth } from '@/context'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect to dashboard if already authenticated
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const features = [
    {
      icon: <Briefcase className="text-primary-600" size={24} />,
      title: 'Track Applications',
      description: 'Keep a comprehensive history of all your submissions. Monitor company details, positions, URLs, and applied dates.',
      colorBg: 'bg-primary-50',
    },
    {
      icon: <Sparkles className="text-amber-600" size={24} />,
      title: 'AI Follow-up Emails',
      description: 'Generate customized professional follow-up messages automatically based on your specific application details.',
      colorBg: 'bg-amber-50',
    },
    {
      icon: <Clock className="text-emerald-600" size={24} />,
      title: 'Interview Tracking',
      description: 'Log scheduled interview dates and times. Get highlighted notices for upcoming tasks to stay fully prepared.',
      colorBg: 'bg-emerald-50',
    },
    {
      icon: <Download className="text-blue-600" size={24} />,
      title: 'Export Your Data',
      description: 'Back up and download your entire applications list directly to your machine as a CSV with a single click.',
      colorBg: 'bg-blue-50',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/40 via-transparent to-neutral-50">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100/60 text-primary-800 border border-primary-200">
            <Sparkles size={12} className="text-primary-600" />
            AI-powered Job Search Organizer
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-tight max-w-3xl">
            Track every application, interview, and offer —{' '}
            <span className="text-primary-600 bg-clip-text">all in one place</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
            Job Tracker Pro helps you stay organized, prepare for interviews, and draft tailored follow-up messages using AI to accelerate your career search.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:px-8">
                Get Started for Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:px-8 bg-white shadow-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Everything you need to land your next role
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 mt-2">
            A comprehensive pipeline to streamline your job search and stay on top of critical dates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="flex flex-col p-6 hover:shadow-md transition-shadow duration-200">
              <div className={`w-12 h-12 rounded-xl ${feature.colorBg} flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Job Tracker Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-neutral-600">Secure. Professional. Fast.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
