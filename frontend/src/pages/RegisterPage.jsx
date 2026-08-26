import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useAuth } from '@/context'
import Button from '@/components/ui/Button'
import Input  from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

/**
 * RegisterPage — /register
 *
 * - username, email, password, confirmPassword fields
 * - Client-side: password match + min 8 chars
 * - Server errors mapped per-field where possible
 * - Auto-login and redirect to /dashboard on success
 */
export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [isSubmitting,  setIsSubmitting]  = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  const passwordValue = watch('password')

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    clearErrors('root.serverError')
    try {
      const user = await registerUser({
        username: values.username,
        email:    values.email,
        password: values.password,
      })
      toast.success(`Account created! Welcome, ${user.username} 🎉`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Django REST Framework typically returns field-level errors as
      // { username: ["..."], email: ["..."], password: ["..."] }
      const data = err?.data

      if (data && typeof data === 'object') {
        const fieldMap = {
          username: 'username',
          email:    'email',
          password: 'password',
        }
        let hasFieldError = false
        for (const [field, rhfField] of Object.entries(fieldMap)) {
          if (data[field]) {
            setError(rhfField, {
              message: Array.isArray(data[field]) ? data[field][0] : data[field],
            })
            hasFieldError = true
          }
        }
        if (!hasFieldError) {
          const message = data.detail ?? data.non_field_errors?.[0] ?? data.message ?? 'Registration failed.'
          setError('root.serverError', { message })
          toast.error(message, { id: 'reg-error-toast', duration: 5000 })
        }
      } else {
        const message = err?.message ?? 'Something went wrong. Please try again.'
        setError('root.serverError', { message })
        toast.error(message, { id: 'reg-error-toast', duration: 5000 })
      }
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
      {/* Dot-grid background */}
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
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Start tracking your job search in seconds.
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
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="choose_a_username"
                  leftDecorator={<User size={14} />}
                  error={errors.username?.message}
                  required
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'At least 3 characters' },
                    maxLength: { value: 30, message: 'Max 30 characters' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Only letters, numbers, and underscores',
                    },
                    onChange: handleInputChange,
                  })}
                />

                {/* Email */}
                <Input
                  label="Email address"
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  leftDecorator={<Mail size={14} />}
                  error={errors.email?.message}
                  required
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                    onChange: handleInputChange,
                  })}
                />

                {/* Password */}
                <Input
                  label="Password"
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  error={errors.password?.message}
                  required
                  {...register('password', {
                    required: 'Password is required',
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
                  label="Confirm password"
                  id="reg-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
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
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === passwordValue || 'Passwords do not match',
                    onChange: handleInputChange,
                  })}
                />

                {/* Password strength hint */}
                {!errors.password && (
                  <p className="text-xs text-neutral-400 -mt-2">
                    Use 8+ characters with a mix of letters, numbers, or symbols.
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full mt-1"
                >
                  Create account
                </Button>
              </div>
            </form>
          </Card>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
