interface ToastProps {
  message: string
  onRetry?: () => void
}

export function Toast({ message, onRetry }: ToastProps) {
  return (
    <div
      role="alert"
      className="fixed bottom-24 left-4 right-4 z-[60] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-md bg-ink px-4 py-3 text-body-sm text-on-primary shadow-elevated sm:bottom-28"
    >
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-md bg-on-primary/15 px-3 py-1.5 text-caption-md font-bold text-on-primary transition-colors hover:bg-on-primary/25"
        >
          تلاش مجدد
        </button>
      ) : null}
    </div>
  )
}
