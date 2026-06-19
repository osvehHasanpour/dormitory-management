import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

export interface DialogAnchor {
  x: number
  y: number
}

interface LogoutConfirmDialogProps {
  isOpen: boolean
  anchor: DialogAnchor | null
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutConfirmDialog({
  isOpen,
  anchor,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [transformOrigin, setTransformOrigin] = useState('center center')

  useLayoutEffect(() => {
    if (!isOpen || !anchor || !panelRef.current) {
      setTransformOrigin('center center')
      return
    }

    const rect = panelRef.current.getBoundingClientRect()
    const originX = anchor.x - rect.left
    const originY = anchor.y - rect.top
    setTransformOrigin(`${originX}px ${originY}px`)
  }, [isOpen, anchor])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) {
    return null
  }

  const panelStyle: CSSProperties = {
    transformOrigin,
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px] animate-modal-scrim"
        onClick={onCancel}
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-description"
        style={panelStyle}
        className="relative z-10 w-full max-w-sm animate-modal-pop rounded-lg bg-canvas px-7 py-7 text-center shadow-[0_16px_48px_rgba(46,17,69,0.18)]"
      >
        <h2 id="logout-confirm-title" className="text-heading-lg text-ink">
          آیا مطمئن هستید؟
        </h2>
        <p id="logout-confirm-description" className="mt-3 text-body-md text-mute">
          با خروج از حساب، به صفحه ورود منتقل می‌شوید.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-md bg-secondary-bg px-5 text-button-md text-on-secondary transition-colors active:bg-secondary-pressed sm:max-w-[140px]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 flex-1 rounded-md bg-primary px-5 text-button-md text-on-primary transition-colors active:bg-primary-pressed sm:max-w-[140px]"
          >
            بله، خروج
          </button>
        </div>
      </div>
    </div>
  )
}
