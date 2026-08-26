import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '@/context'
import Button  from '@/components/ui/Button'
import Input   from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

/**
 * LoginPage — /login
 *
 * - React Hook Form with inline validation errors
 * - "Remember me" checkbox (sets session vs persistent intent)
 * - Show/hide password toggle
 * - Loading spinner on submit via Button[loading]
 * - Error toast on failed login (server errors)
 * - Redirects to the originally requested URL after login
 */
export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const from        = location.state?.from?.pathname ?? '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: { username: '', password: '', rememberMe: false },
    mode: 'onTouched',
  })

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    clearErrors('root.serverError')
    try {
      await login({ username: values.username, password: values.password })
      toast.success(`Welcome back, ${values.username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err?.data?.detail ??
        err?.data?.non_field_errors?.[0] ??
        err?.message ??
        'Invalid username or password. Please try again.'

      // Set persistent in-form error
      setError('root.serverError', { message })
      // Also trigger toast for visibility with 5s duration
      toast.error(message, { id: 'login-error-toast', duration: 5000 })
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

      {/* Centered content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo + heading */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shrink-0">
                <Briefcase className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-neutral-900 tracking-tight select-none">
                Job Tracker Pro
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Track every application, interview, and offer.
            </p>
          </div>

          {/* Card */}
          <Card className="p-6 shadow-lg border-neutral-200/80">
            {/* Server-level error banner */}
            {errors.root?.serverError && (
              <div
                role="alert"
                className="mb-5 flex items-start justify-between gap-2.5 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-3 animate-in fade-in duration-150"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <svg
                    className="mt-0.5 shrink-0 text-rose-500"
                    width="14" height="14" viewBox="0 0 16 16"
                    fill="currentColor" aria-hidden="true"
                  >
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V5Zm.75 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
                  </svg>
                  <p className="text-sm text-rose-700 leading-snug font-medium">
                    {errors.root.serverError.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => clearErrors('root.serverError')}
                  className="text-rose-400 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                  aria-label="Dismiss error"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 2l8 8M10 2l-8 8" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-4">
                {/* Username */}
                <Input
                  label="Username"
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="your_username"
                  leftDecorator={<User size={14} />}
                  error={errors.username?.message}
                  required
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'At least 3 characters' },
                    onChange: handleInputChange,
                  })}
                />

                {/* Password */}
                <Input
                  label="Password"
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  leftDecorator={<Lock size={14} />}
                  rightDecorator={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff size={14} />
                        : <Eye size={14} />
                      }
                    </button>
                  }
                  error={errors.password?.message}
                  required
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                    onChange: handleInputChange,
                  })}
                />

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      id="login-remember"
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 accent-primary-600 cursor-pointer"
                      {...register('rememberMe')}
                    />
                    <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full mt-1"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </Card>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
