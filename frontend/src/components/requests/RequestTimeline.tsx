import type { TimelineStep } from '../../types/request'
import { formatAbsoluteDate } from '../../utils/formatRelativeDate'

interface RequestTimelineProps {
  steps: TimelineStep[]
}

const dotClasses: Record<TimelineStep['state'], string> = {
  pending: 'border-stone bg-canvas',
  active: 'border-primary bg-primary scale-110',
  completed: 'border-success-deep bg-success-pale',
  rejected: 'border-error bg-error-pale',
}

const lineClasses: Record<TimelineStep['state'], string> = {
  pending: 'bg-hairline',
  active: 'bg-primary',
  completed: 'bg-success-deep/40',
  rejected: 'bg-error/40',
}

export function RequestTimeline({ steps }: RequestTimelineProps) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const connectorActive = step.state === 'completed' || step.state === 'active' || step.state === 'rejected'
        const connectorClass =
          step.state === 'rejected'
            ? lineClasses.rejected
            : connectorActive
              ? lineClasses.completed
              : lineClasses.pending

        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-4 w-4 rounded-full border-2 transition-all duration-300 ${dotClasses[step.state]}`}
                aria-hidden="true"
              />
              {!isLast ? (
                <span
                  className={`my-1 w-0.5 flex-1 min-h-8 transition-colors duration-300 ${connectorClass}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div className={`pb-6 transition-opacity duration-300 ${step.state === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
              <p
                className={`text-body-strong ${
                  step.state === 'rejected'
                    ? 'text-error'
                    : step.state === 'active'
                      ? 'text-ink'
                      : 'text-body'
                }`}
              >
                {step.label}
              </p>
              {step.date ? (
                <p className="mt-1 text-caption-sm text-mute">{formatAbsoluteDate(step.date)}</p>
              ) : (
                <p className="mt-1 text-caption-sm text-ash">در انتظار</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
