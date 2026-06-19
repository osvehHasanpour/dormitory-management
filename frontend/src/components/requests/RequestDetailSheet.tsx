import { getRequestTypeConfig } from '../../data/requestItems'
import type { StudentRequestDetail } from '../../types/request'
import {
  buildTimelineSteps,
  formatHandledBy,
  getStatusBadgeVariant,
} from '../../utils/requestHelpers'
import { StatusBadge } from '../ui/StatusBadge'
import { RequestTimeline } from './RequestTimeline'
import { Skeleton } from '../ui/Skeleton'

interface RequestDetailSheetProps {
  request: StudentRequestDetail | null
  isLoading: boolean
}

export function RequestDetailSheet({ request, isLoading }: RequestDetailSheetProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    )
  }

  if (!request) {
    return null
  }

  const typeConfig = getRequestTypeConfig(request.request_type)
  const timelineSteps = buildTimelineSteps(
    request.status,
    request.created_at,
    request.status_timeline,
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-body-sm-strong text-mute">نوع درخواست</p>
        <p className="mt-1 text-heading-md text-ink">{typeConfig.label}</p>
      </div>

      <div>
        <p className="text-body-sm-strong text-mute">توضیحات</p>
        <p className="mt-1 whitespace-pre-wrap text-body-md text-body-text">{request.description}</p>
      </div>

      {request.rejection_reason ? (
        <div className="rounded-md border border-error/20 bg-error-pale px-4 py-3">
          <p className="text-body-sm-strong text-error">دلیل رد</p>
          <p className="mt-1 text-body-sm text-error">{request.rejection_reason}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-body-sm-strong text-mute">رسیدگی‌کننده</p>
          <p className="mt-1 text-body-md text-ink">{formatHandledBy(request.handled_by)}</p>
        </div>
        <div>
          <p className="text-body-sm-strong text-mute">وضعیت</p>
          <div className="mt-1">
            <StatusBadge
              label={request.status_display}
              variant={getStatusBadgeVariant(request.status)}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-4 text-body-sm-strong text-mute">پیگیری وضعیت</p>
        <RequestTimeline steps={timelineSteps} />
      </div>
    </div>
  )
}
