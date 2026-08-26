import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowLeft, Briefcase, CheckCircle2, Mail } from 'lucide-react'
import { forgotPassword } from '@/features/auth/authApi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

/**
 * ForgotPasswordPage — /forgot-password
 *
 * Requests a password reset email from POST /api/forgot-password/
 */
export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
    mode: 'onTouched',
  })

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      await forgotPassword({ email: values.email })
      setSubmittedEmail(values.email)
      toast.success('Reset link sent if account exists!')
    } catch (err) {
      // For security, even on error we can show the sent state or a clear notification
      setSubmittedEmail(values.email)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Subtle dot-grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.45,
        }}
        aria-hidden="true"
      />

      {/* Centered content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo + heading */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 mb-4 shadow-lg">
              <Briefcase className="text-white" size={22} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Reset your password
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Enter your email and we&apos;ll send you a recovery link.
            </p>
          </div>

          {/* Card */}
          <Card className="p-6 shadow-lg border-neutral-200/80">
            {submittedEmail ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900 mb-1.5">
                  Check your inbox
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  If an account exists for <span className="font-semibold text-neutral-900">{submittedEmail}</span>, you will receive an email with instructions to reset your password.
                </p>
                <div className="w-full space-y-3">
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
                  >
                    Return to sign in
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmittedEmail(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Didn&apos;t receive an email? Try another address
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Email address"
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    leftDecorator={<Mail size={14} />}
                    error={errors.email?.message}
                    required
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full mt-1"
                  >
                    Send reset link
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Back to Login link */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
