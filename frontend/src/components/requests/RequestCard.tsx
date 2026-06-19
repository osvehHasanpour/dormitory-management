import { getRequestTypeConfig } from '../../data/requestItems'
import type { StudentRequestListItem } from '../../types/request'
import { formatRelativeDate } from '../../utils/formatRelativeDate'
import { getStatusBadgeVariant } from '../../utils/requestHelpers'
import { StatusBadge } from '../ui/StatusBadge'

interface RequestCardProps {
  request: StudentRequestListItem
  onClick: (requestId: number) => void
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const typeConfig = getRequestTypeConfig(request.request_type)

  return (
    <button
      type="button"
      onClick={() => onClick(request.id)}
      className="flex w-full items-center gap-3 rounded-md border border-hairline bg-canvas p-4 text-right transition-colors hover:bg-surface-soft active:bg-surface-card"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-card">
        <img
          src={typeConfig.image}
          alt=""
          className="h-9 w-9 rounded-sm object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-heading-md text-ink">{typeConfig.label}</p>
        <p className="mt-1 line-clamp-2 text-body-sm text-mute">{request.description}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge
          label={request.status_display}
          variant={getStatusBadgeVariant(request.status)}
        />
        <span className="text-caption-sm text-mute">{formatRelativeDate(request.created_at)}</span>
      </div>
    </button>
  )
}
