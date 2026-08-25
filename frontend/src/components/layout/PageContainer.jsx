/**
 * PageContainer — main content area wrapper
 * Provides consistent max-width, padding, and responsive behavior
 */

export default function PageContainer({ children, className = '', maxWidth = '7xl' }) {
  const maxWidthMap = {
    '5xl':  'max-w-5xl',
    '6xl':  'max-w-6xl',
    '7xl':  'max-w-7xl',
    'full': 'max-w-full',
  }

  return (
    <main
      className={[
        'flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6',
        maxWidthMap[maxWidth] ?? maxWidthMap['7xl'],
        className,
      ].join(' ')}
    >
      {children}
    </main>
  )
}
