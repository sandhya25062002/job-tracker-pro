/**
 * Card — flexible container component
 *
 * Variants: default | flat | elevated | ghost
 * Supports: optional header, footer, padding control, hover state
 */

const variantStyles = {
  default: [
    'bg-white border border-neutral-200',
    'shadow-sm',
  ].join(' '),

  elevated: [
    'bg-white border border-neutral-200',
    'shadow-md hover:shadow-lg',
    'transition-shadow duration-200 ease-in-out',
  ].join(' '),

  flat: [
    'bg-neutral-50 border border-neutral-200',
  ].join(' '),

  ghost: [
    'bg-transparent border border-transparent',
  ].join(' '),
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

// ── Card Root ──────────────────────────────────────────────
export function Card({
  variant = 'default',
  padding = 'md',
  radius = 'xl',
  hoverable = false,
  className = '',
  children,
  ...props
}) {
  const radiusMap = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    xl: 'rounded-2xl',
  }

  return (
    <div
      className={[
        variantStyles[variant] ?? variantStyles.default,
        paddingStyles[padding],
        radiusMap[radius] ?? radiusMap.md,
        hoverable
          ? 'cursor-pointer hover:-translate-y-0.5 transition-transform duration-150 ease-in-out'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Card Header ───────────────────────────────────────────
export function CardHeader({ className = '', children, ...props }) {
  return (
    <div
      className={[
        'flex items-center justify-between',
        'border-b border-neutral-100 pb-4 mb-4',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Card Title ────────────────────────────────────────────
export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={[
        'text-base font-semibold text-neutral-900 leading-tight',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </h3>
  )
}

// ── Card Description ──────────────────────────────────────
export function CardDescription({ className = '', children, ...props }) {
  return (
    <p
      className={[
        'text-sm text-neutral-500 leading-relaxed',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </p>
  )
}

// ── Card Content ──────────────────────────────────────────
export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

// ── Card Footer ───────────────────────────────────────────
export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={[
        'flex items-center',
        'border-t border-neutral-100 pt-4 mt-4',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// Default export for convenience
export default Card
