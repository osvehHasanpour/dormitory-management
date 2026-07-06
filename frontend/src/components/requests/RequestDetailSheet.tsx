import type { StudentRequestDetail, StudentRequestListItem } from '../../types/request'
import {
  buildRequestDetailRows,
  buildTimelineSteps,
  getEffectiveRequestStatus,
  getEffectiveStatusDisplay,
  getRequestTypeLabel,
  getStatusBadgeVariant,
  type RequestDetailRow,
} from '../../utils/requestHelpers'
import { formatPersianDateShort } from '../../utils/formatRelativeDate'
import { RequestTimeline } from './RequestTimeline'
import { StatusBadge } from '../ui/StatusBadge'
import { Skeleton } from '../ui/Skeleton'

interface RequestDetailSheetProps {
  request: StudentRequestDetail | null
  preview: StudentRequestListItem | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

function buildPreviewRows(request: StudentRequestListItem): RequestDetailRow[] {
  const rows: RequestDetailRow[] = [
    {
      label: 'تاریخ ثبت',
      value: formatPersianDateShort(request.created_at),
    },
  ]

  if (request.description.trim()) {
    rows.push({ label: 'توضیحات', value: request.description.trim() })
  }

  return rows
}

function DetailInfoRows({ rows }: { rows: RequestDetailRow[] }) {
  return (
    <div className="glass-card overflow-hidden">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <div className="px-4 py-3.5">
            <p className="text-body-sm-strong text-mute">{row.label}</p>
            <p
              className={`mt-1 whitespace-pre-wrap text-body-md ${
                row.highlight ? 'text-heading-md text-ink' : 'text-ink'
              }`}
            >
              {row.value}
            </p>
          </div>
          {index < rows.length - 1 ? <div className="glass-divider" /> : null}
        </div>
      ))}
    </div>
  )
}

function DetailLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="glass-card space-y-3 p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  )
}

export function RequestDetailSheet({
  request,
  preview,
  isLoading,
  error,
  onRetry,
}: RequestDetailSheetProps) {
  const displayRequest = request ?? preview

  if (!displayRequest && isLoading) {
    return <DetailLoadingSkeleton />
  }

  if (!displayRequest) {
    return (
      <div className="py-6 text-center">
        <p className="text-body-md text-body-text">جزئیات درخواست در دسترس نیست.</p>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 text-body-sm-strong text-primary underline-offset-2 hover:underline"
          >
            تلاش مجدد
          </button>
        ) : null}
      </div>
    )
  }

  const typeLabel = getRequestTypeLabel(displayRequest.request_type)
  const effectiveStatus = getEffectiveRequestStatus(displayRequest)
  const supervisorResponse = displayRequest.supervisor_response?.trim()
  const infoRows = request ? buildRequestDetailRows(request) : buildPreviewRows(displayRequest)
  const timelineSteps = buildTimelineSteps(displayRequest)

  return (
    <div className="space-y-5 animate-[sheet-content-in_360ms_ease-out_both]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-primary-ultra-light px-3 py-1.5 text-body-sm-strong text-primary-deep">
          {typeLabel}
        </span>
        <StatusBadge
          label={getEffectiveStatusDisplay(displayRequest)}
          variant={getStatusBadgeVariant(effectiveStatus)}
        />
      </div>

      <p className="text-caption-sm text-mute">
        آخرین بروزرسانی: {formatPersianDateShort(displayRequest.updated_at)}
      </p>

      <section className="glass-card overflow-hidden px-4 py-3.5">
        <p className="text-body-sm-strong text-mute">پاسخ سرپرست</p>
        {supervisorResponse ? (
          <p className="mt-1 whitespace-pre-wrap text-body-md text-ink">{supervisorResponse}</p>
        ) : (
          <p className="mt-1 text-body-md text-ash">هنوز پاسخی ثبت نشده است</p>
        )}
      </section>

      {isLoading ? (
        <p className="text-caption-md text-mute">در حال دریافت جزئیات...</p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-error/20 bg-error-pale px-4 py-3">
          <p className="text-body-sm text-error">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-body-sm-strong text-error underline-offset-2 hover:underline"
          >
            تلاش مجدد
          </button>
        </div>
      ) : null}

      <DetailInfoRows rows={infoRows} />

      {request?.request_type === 'maintenance' && request.photo_url ? (
        <div className="glass-card overflow-hidden p-4">
          <p className="mb-3 text-body-sm-strong text-mute">تصویر پیوست</p>
          <img
            src={request.photo_url}
            alt="تصویر درخواست"
            className="max-h-48 w-full rounded-md object-cover"
          />
        </div>
      ) : null}

      <section>
        <h3 className="mb-4 text-body-sm-strong text-mute">پیگیری وضعیت</h3>
        <RequestTimeline steps={timelineSteps} />
      </section>
    </div>
  )
}
