import { useEffect, useState } from 'react'

import type { StudentClassItem } from '../../types/class'
import { formatClassSchedule } from '../../utils/formatClassSchedule'

interface RatingBottomSheetContentProps {
  classItem: StudentClassItem
  isSubmitting: boolean
  error: string | null
  onSubmit: (score: number) => Promise<void>
}

const STAR_VALUES = [1, 2, 3, 4, 5]

export function RatingBottomSheetContent({
  classItem,
  isSubmitting,
  error,
  onSubmit,
}: RatingBottomSheetContentProps) {
  const [score, setScore] = useState<number>(0)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setScore(0)
    setLocalError(null)
  }, [classItem.id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (score < 1 || score > 5) {
      setLocalError('لطفاً یک امتیاز بین ۱ تا ۵ انتخاب کنید.')
      return
    }

    setLocalError(null)
    await onSubmit(score)
  }

  const scheduleText = formatClassSchedule(
    classItem.day_of_week_display,
    classItem.start_time,
    classItem.end_time,
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="glass-card p-4">
        <p className="text-heading-md text-ink">{classItem.title}</p>
        {scheduleText !== '—' ? (
          <p className="mt-1 text-body-sm text-mute">برنامه: {scheduleText}</p>
        ) : null}
        <p className="mt-3 text-body-sm text-mute">امتیاز شما (۱ تا ۵)</p>

        <div className="mt-3 flex items-center justify-center gap-1">
          {STAR_VALUES.map((value) => {
            const isActive = value <= score
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setScore(value)
                  setLocalError(null)
                }}
                className={`text-heading-xl leading-none transition-transform active:scale-95 ${
                  isActive ? 'text-warning' : 'text-stone'
                }`}
                aria-label={`امتیاز ${value}`}
              >
                ★
              </button>
            )
          })}
        </div>
      </div>

      {localError ? (
        <div className="rounded-md border border-error/20 bg-error-pale px-4 py-3 text-body-sm text-error">
          {localError}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-error/20 bg-error-pale px-4 py-3 text-body-sm text-error">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash"
      >
        {isSubmitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت امتیاز'}</span>
      </button>
    </form>
  )
}
