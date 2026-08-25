/**
 * Spinner — animated loading indicator
 *
 * Sizes: sm | md | lg | xl
 */

const sizeMap = {
  sm:  { size: 16, stroke: 2 },
  md:  { size: 24, stroke: 2.5 },
  lg:  { size: 36, stroke: 3 },
  xl:  { size: 48, stroke: 3.5 },
}

const colorMap = {
  primary: 'text-primary-600',
  white:   'text-white',
  neutral: 'text-neutral-400',
}

function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const { size: px, stroke } = sizeMap[size] ?? sizeMap.md
  const colorClass = colorMap[color] ?? colorMap.primary

  return (
    <svg
      className={['animate-spin', colorClass, className].join(' ')}
      style={{ width: px, height: px }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth={stroke}
        opacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Spinner
