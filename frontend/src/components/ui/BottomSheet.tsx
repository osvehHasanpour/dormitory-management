import { useEffect, type ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px] animate-sheet-scrim"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
        className="relative z-10 w-full max-w-lg animate-sheet-panel glass-card-modal rounded-t-lg px-5 pb-8 pt-5 sm:rounded-lg sm:px-7 sm:pb-7 sm:pt-6"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline sm:hidden" aria-hidden="true" />

        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="request-detail-title" className="text-heading-lg text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-caption-md font-bold text-primary transition-colors hover:bg-surface-card"
          >
            بستن
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
