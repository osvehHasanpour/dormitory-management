import { getRequestTypeConfig } from "../../data/requestItems";
import type { StudentRequestListItem } from "../../types/request";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import { getStatusBadgeVariant } from "../../utils/requestHelpers";
import { StatusBadge } from "../ui/StatusBadge";

interface RequestCardProps {
  request: StudentRequestListItem;
  onClick: (request: StudentRequestListItem) => void;
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const typeConfig = getRequestTypeConfig(request.request_type);

  return (
    <button
      type="button"
      onClick={() => onClick(request)}
      className="flex w-full min-w-0 flex-col gap-3 glass-card p-4 text-right transition-colors hover:bg-white/55 active:bg-white/65 min-[480px]:flex-row min-[480px]:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-card">
          <img
            src={typeConfig.image}
            alt=""
            className="h-9 w-9 rounded-sm object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-heading-md text-ink">
            {typeConfig.label}
          </p>
          <p className="mt-1 line-clamp-2 break-words text-body-sm text-body-text">
            {request.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 min-[480px]:flex-col min-[480px]:items-end">
        <StatusBadge
          label={request.status_display}
          variant={getStatusBadgeVariant(request.status)}
        />
        <span className="text-caption-sm text-mute">
          {formatRelativeDate(request.created_at)}
        </span>
      </div>
    </button>
  );
}
