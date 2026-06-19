import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  originX: number
  originY: number
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  originX,
  originY,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!open || !card) {
      return
    }

    const cardRect = card.getBoundingClientRect()
    card.style.transformOrigin = `${originX - cardRect.left}px ${originY - cardRect.top}px`
  }, [open, originX, originY])

  useEffect(() => {
    if (!open) {
      return
    }

    cancelRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-surface-dark/40"
        aria-label="بستن"
        onClick={onCancel}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        <DialogCard cardRef={cardRef}>
          <h2 id="confirm-dialog-title" className="text-heading-lg text-ink">
            {title}
          </h2>
          <p id="confirm-dialog-message" className="mt-3 text-body-md text-body">
            {message}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className="pointer-events-auto flex-1 rounded-md bg-secondary-bg px-5 py-2.5 text-button-md text-on-secondary transition-colors active:bg-secondary-pressed"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="pointer-events-auto flex-1 rounded-md bg-primary px-5 py-2.5 text-button-md text-on-primary transition-colors active:bg-primary-pressed"
            >
              {confirmLabel}
            </button>
          </div>
        </DialogCard>
      </div>
    </div>
  )
}

interface DialogCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>
  children: ReactNode
}

function DialogCard({ cardRef, children }: DialogCardProps) {
  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="animate-dialog-pop pointer-events-auto w-full max-w-sm rounded-lg bg-canvas p-7 shadow-[0_16px_48px_rgba(46,17,69,0.18)]"
    >
      {children}
    </div>
  )
}
