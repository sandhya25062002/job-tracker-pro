import { forwardRef } from 'react'

/**
 * Button — polymorphic, multi-variant button component
 *
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 */

const variantStyles = {
  primary: [
    'bg-primary-600 text-white border border-primary-600',
    'hover:bg-primary-700 hover:border-primary-700',
    'active:bg-primary-800',
    'shadow-sm hover:shadow-md',
    'disabled:bg-primary-300 disabled:border-primary-300 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-neutral-100 text-neutral-700 border border-neutral-200',
    'hover:bg-neutral-200 hover:border-neutral-300 hover:text-neutral-900',
    'active:bg-neutral-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600 border border-transparent',
    'hover:bg-neutral-100 hover:text-neutral-900',
    'active:bg-neutral-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  outline: [
    'bg-transparent text-primary-600 border border-primary-300',
    'hover:bg-primary-50 hover:border-primary-400',
    'active:bg-primary-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-rose-600 text-white border border-rose-600',
    'hover:bg-rose-700 hover:border-rose-700',
    'active:bg-rose-800',
    'shadow-sm hover:shadow-md',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs font-medium rounded-md gap-1.5',
  md: 'h-9 px-4 text-sm font-medium rounded-lg gap-2',
  lg: 'h-11 px-6 text-sm font-semibold rounded-xl gap-2',
}

const iconSizeStyles = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-9 w-9 rounded-lg',
  lg: 'h-11 w-11 rounded-xl',
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconOnly = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center justify-center',
        'font-sans select-none whitespace-nowrap',
        'transition-all duration-150 ease-in-out',
        // Ensure any accidentally-nested <a> (e.g. React Router Link) inherits
        // the button's text color rather than the global link style
        '[&_a]:text-inherit [&_a]:no-underline',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        // Variant
        variantStyles[variant] ?? variantStyles.primary,
        // Size
        iconOnly ? iconSizeStyles[size] : sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 12 : 14} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {!iconOnly && children && <span>{children}</span>}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})

/** Inline spinner for loading state — keeps it local to this file */
function Spinner({ size = 14 }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size }}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="8" cy="8" r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

Button.displayName = 'Button'

export default Button
