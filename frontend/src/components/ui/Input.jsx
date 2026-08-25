import { forwardRef } from 'react'

/**
 * Input — accessible, design-system-aligned text input
 *
 * Features:
 *  - Optional label, helper text, and error message
 *  - Left / right decorators (icons or text)
 *  - Error state with ring highlight
 *  - Disabled state with visual feedback
 *  - Sizes: sm | md | lg
 */

const sizeMap = {
  sm: {
    input: 'h-8 px-3 text-xs rounded-md',
    label: 'text-xs mb-1',
  },
  md: {
    input: 'h-9 px-3.5 text-sm rounded-lg',
    label: 'text-sm mb-1.5',
  },
  lg: {
    input: 'h-11 px-4 text-sm rounded-xl',
    label: 'text-sm mb-1.5',
  },
}

const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    size = 'md',
    leftDecorator,
    rightDecorator,
    className = '',
    id,
    disabled,
    required,
    ...props
  },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const hasError = Boolean(error)
  const { input: inputSizeClass, label: labelSizeClass } = sizeMap[size] ?? sizeMap.md

  return (
    <div className="flex flex-col w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={[
            'font-medium text-neutral-700 select-none',
            labelSizeClass,
          ].join(' ')}
        >
          {label}
          {required && (
            <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input wrapper — handles decorators */}
      <div className="relative flex items-center">
        {/* Left decorator */}
        {leftDecorator && (
          <span className="absolute left-3 flex items-center text-neutral-400 pointer-events-none">
            {leftDecorator}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={[
            // Base
            'w-full font-sans',
            'bg-white border border-neutral-200',
            'text-neutral-900 placeholder:text-neutral-400',
            'transition-all duration-150 ease-in-out',
            'outline-none',
            // Focus
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            // Error
            hasError
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : '',
            // Disabled
            disabled
              ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-200'
              : '',
            // Padding for decorators
            leftDecorator ? 'pl-9' : '',
            rightDecorator ? 'pr-9' : '',
            // Size
            inputSizeClass,
            className,
          ].join(' ')}
          {...props}
        />

        {/* Right decorator */}
        {rightDecorator && (
          <span className="absolute right-3 flex items-center text-neutral-400">
            {rightDecorator}
          </span>
        )}
      </div>

      {/* Helper / Error text */}
      {hasError ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
        >
          <svg
            className="shrink-0"
            width="12" height="12"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V5Zm.75 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="mt-1.5 text-xs text-neutral-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
