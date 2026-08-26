import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modal — accessible dialog overlay (portal-based)
 *
 * Features:
 *  - Renders into document.body via createPortal (avoids z-index/overflow issues)
 *  - Focus trap: Tab/Shift+Tab stays inside the modal
 *  - Closes on Escape key or overlay click
 *  - Body scroll locked while open
 *  - Sizes: sm | md | lg | xl
 *  - Smooth enter/exit transitions via CSS
 *
 * Usage:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Application">
 *     {children}
 *   </Modal>
 */

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  hideCloseButton = false,
  children,
  footer,
}) {
  const overlayRef  = useRef(null)
  const dialogRef   = useRef(null)
  const previousFocus = useRef(null)

  // ── Lock body scroll ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previousFocus.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Escape key ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Focus trap ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    // Auto-focus the dialog itself or first focusable element
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    first?.focus()

    const trap = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={[
          'relative w-full bg-white rounded-2xl shadow-xl',
          'flex flex-col max-h-[90vh]',
          'animate-in fade-in zoom-in-95 duration-150',
          sizeClasses[size] ?? sizeClasses.md,
        ].join(' ')}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-neutral-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-desc"
                  className="mt-0.5 text-sm text-neutral-500"
                >
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className={[
                  'shrink-0 rounded-lg p-1.5 -mt-0.5 -mr-1',
                  'text-neutral-400 hover:text-neutral-700',
                  'hover:bg-neutral-100 transition-colors',
                ].join(' ')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
