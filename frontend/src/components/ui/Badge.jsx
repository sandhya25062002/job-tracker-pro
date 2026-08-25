/**
 * Badge — status/label indicator chip
 *
 * Variants map directly to job application pipeline statuses,
 * plus neutral, primary, and custom variants.
 *
 * Sizes: sm | md | lg
 * Dot:   optional leading status dot
 */

const variantStyles = {
  // ── Job pipeline statuses ────────────────────
  applied: {
    container: 'bg-blue-50 text-blue-700 border border-blue-100',
    dot: 'bg-blue-500',
  },
  interview: {
    container: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-500',
  },
  offer: {
    container: 'bg-green-50 text-green-700 border border-green-100',
    dot: 'bg-green-500',
  },
  rejected: {
    container: 'bg-rose-50 text-rose-700 border border-rose-100',
    dot: 'bg-rose-500',
  },
  saved: {
    container: 'bg-purple-50 text-purple-700 border border-purple-100',
    dot: 'bg-purple-500',
  },
  // ── Generic statuses ─────────────────────────
  neutral: {
    container: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    dot: 'bg-neutral-400',
  },
  primary: {
    container: 'bg-primary-50 text-primary-700 border border-primary-100',
    dot: 'bg-primary-500',
  },
  success: {
    container: 'bg-green-50 text-green-700 border border-green-100',
    dot: 'bg-green-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-500',
  },
  danger: {
    container: 'bg-rose-50 text-rose-700 border border-rose-100',
    dot: 'bg-rose-500',
  },
}

const sizeStyles = {
  sm: 'h-5 px-1.5 text-xs gap-1 rounded-md',
  md: 'h-6 px-2 text-xs gap-1.5 rounded-lg',
  lg: 'h-7 px-2.5 text-sm gap-1.5 rounded-lg',
}

const dotSizeStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
}

/** Friendly display labels for job pipeline statuses */
export const STATUS_LABELS = {
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
  saved:     'Saved',
}

function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) {
  const styles = variantStyles[variant] ?? variantStyles.neutral

  return (
    <span
      className={[
        'inline-flex items-center justify-center font-medium',
        'leading-none whitespace-nowrap select-none',
        styles.container,
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={[
            'rounded-full shrink-0',
            dotSizeStyles[size],
            styles.dot,
          ].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

/**
 * Convenience: StatusBadge auto-derives variant from status string
 * and renders a dot by default.
 *
 * Usage: <StatusBadge status="interview" />
 */
export function StatusBadge({ status, size = 'md', dot = true, className = '' }) {
  const normalised = status?.toLowerCase() ?? 'neutral'
  const label = STATUS_LABELS[normalised] ?? status

  return (
    <Badge
      variant={variantStyles[normalised] ? normalised : 'neutral'}
      size={size}
      dot={dot}
      className={className}
    >
      {label}
    </Badge>
  )
}

Badge.displayName = 'Badge'

export default Badge
