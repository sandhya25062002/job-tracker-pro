import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AlertTriangle, Briefcase, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { resetPassword } from '@/features/auth/authApi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

/**
 * ResetPasswordPage — /reset-password/:uid/:token
 *
 * Confirms and updates password using POST /api/reset-password/<uid>/<token>/
 */
export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: { new_password: '', confirm_password: '' },
    mode: 'onTouched',
  })

  const newPasswordValue = watch('new_password')

  const onSubmit = async (values) => {
    if (!uid || !token) {
      setError('root.serverError', {
        message: 'Invalid or missing password reset link parameters.',
      })
      return
    }

    setIsSubmitting(true)
    clearErrors('root.serverError')
    try {
      await resetPassword({
        uid,
        token,
        new_password: values.new_password,
      })
      setIsSuccess(true)
      toast.success('Password reset successfully! Please sign in.')
    } catch (err) {
      const message =
        err?.data?.detail ??
        err?.data?.new_password?.[0] ??
        err?.data?.token?.[0] ??
        err?.message ??
        'Failed to reset password. The link may be invalid or expired.'

      setError('root.serverError', { message })
      toast.error(message, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = () => {
    if (errors.root?.serverError) {
      clearErrors('root.serverError')
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

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo + heading */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 mb-4 shadow-lg">
              <Briefcase className="text-white" size={22} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Set new password
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Enter your new secure password below.
            </p>
          </div>

          {/* Card */}
          <Card className="p-6 shadow-lg border-neutral-200/80">
            {isSuccess ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900 mb-1.5">
                  Password updated!
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  Your password has been changed. You can now sign in with your new credentials.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Proceed to sign in
                </Button>
              </div>
            ) : (
              <>
                {/* Server Error */}
                {errors.root?.serverError && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-3 animate-in fade-in duration-150"
                  >
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm text-rose-700 leading-snug">
                      <p className="font-medium">{errors.root.serverError.message}</p>
                      <Link
                        to="/forgot-password"
                        className="inline-block text-xs font-semibold text-rose-800 underline mt-1.5 hover:text-rose-900"
                      >
                        Request a new reset link →
                      </Link>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="flex flex-col gap-4">
                    {/* New Password */}
                    <Input
                      label="New password"
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      placeholder="At least 8 characters"
                      leftDecorator={<Lock size={14} />}
                      rightDecorator={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="text-neutral-400 hover:text-neutral-600 transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                      error={errors.new_password?.message}
                      required
                      {...register('new_password', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'At least 8 characters required' },
                        validate: (val) =>
                          /[A-Z]/.test(val) || /[0-9]/.test(val) || /[^a-zA-Z0-9]/.test(val)
                            ? true
                            : 'Include a number, symbol, or uppercase letter',
                        onChange: handleInputChange,
                      })}
                    />

                    {/* Confirm Password */}
                    <Input
                      label="Confirm new password"
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      leftDecorator={<Lock size={14} />}
                      rightDecorator={
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="text-neutral-400 hover:text-neutral-600 transition-colors"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                      error={errors.confirm_password?.message}
                      required
                      {...register('confirm_password', {
                        required: 'Please confirm your new password',
                        validate: (val) =>
                          val === newPasswordValue || 'Passwords do not match',
                        onChange: handleInputChange,
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
                      Update password
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Card>

          {/* Back to Login link */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Back to sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
