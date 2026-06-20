import { CheckCircle2, Clock3, XCircle } from 'lucide-react'

import type { TimelineStep } from '../../types/request'
import { formatPersianDateShort } from '../../utils/formatRelativeDate'

interface RequestTimelineProps {
  steps: TimelineStep[]
}

const dotClasses: Record<TimelineStep['state'], string> = {
  pending: 'border-stone bg-canvas text-ash',
  active: 'border-primary bg-primary text-on-primary scale-110',
  completed: 'border-success-deep bg-success-pale text-success-deep',
  approved: 'border-success-deep bg-success-deep text-on-primary scale-110',
  rejected: 'border-error bg-error text-on-primary scale-110',
}

const lineClasses: Record<TimelineStep['state'], string> = {
  pending: 'bg-hairline',
  active: 'bg-primary',
  completed: 'bg-success-deep/40',
  approved: 'bg-success-deep/40',
  rejected: 'bg-error/40',
}

function TimelineIcon({ step }: { step: TimelineStep }) {
  if (step.state === 'rejected') {
    return <XCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
  }

  if (step.state === 'approved' || (step.id === 'completed' && step.state !== 'pending')) {
    return <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
  }

  if (step.state === 'completed' || step.state === 'active') {
    return step.id === 'decision' ? (
      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
    ) : (
      <Clock3 className="h-3.5 w-3.5" strokeWidth={2.25} />
    )
  }

  return <Clock3 className="h-3.5 w-3.5" strokeWidth={2.25} />
}

export function RequestTimeline({ steps }: RequestTimelineProps) {
  return (
    <ol className="glass-card space-y-0 overflow-hidden px-4 py-2">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const connectorActive =
          step.state === 'completed' ||
          step.state === 'active' ||
          step.state === 'approved' ||
          step.state === 'rejected'
        const connectorClass =
          step.state === 'rejected'
            ? lineClasses.rejected
            : step.state === 'approved'
              ? lineClasses.approved
              : connectorActive
                ? lineClasses.completed
                : lineClasses.pending

        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 ${dotClasses[step.state]}`}
                aria-hidden="true"
              >
                <TimelineIcon step={step} />
              </span>
              {!isLast ? (
                <span
                  className={`my-1 w-0.5 flex-1 min-h-10 transition-colors duration-300 ${connectorClass}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div
              className={`pb-5 pt-0.5 transition-opacity duration-300 ${
                step.state === 'pending' ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <p
                className={`text-body-sm-strong ${
                  step.state === 'rejected'
                    ? 'text-error'
                    : step.state === 'approved' || step.state === 'completed'
                      ? 'text-success-deep'
                      : step.state === 'active'
                        ? 'text-ink'
                        : 'text-body-text'
                }`}
              >
                {step.label}
              </p>
              {step.date ? (
                <p className="mt-1 text-caption-sm text-mute">{formatPersianDateShort(step.date)}</p>
              ) : (
                <p className="mt-1 text-caption-sm text-ash">در انتظار</p>
              )}
              {step.note ? (
                <p className="mt-2 rounded-md border border-error/20 bg-error-pale px-3 py-2 text-body-sm text-error">
                  {step.note}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
