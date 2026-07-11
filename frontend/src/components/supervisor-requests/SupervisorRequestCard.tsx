import { MapPin } from "lucide-react";

import type { StudentRequestDetail } from "../../types/request";
import { formatPersianDateShort } from "../../utils/formatRelativeDate";
import {
  formatHandledBy,
  getEffectiveRequestStatus,
  getEffectiveStatusDisplay,
  getRequestDetailSubtitle,
  getRequestDetailTitle,
  getStatusBadgeVariant,
} from "../../utils/requestHelpers";
import { StatusBadge } from "../ui/StatusBadge";

interface SupervisorRequestCardProps {
  request: StudentRequestDetail;
  onClick: (request: StudentRequestDetail) => void;
}

export function SupervisorRequestCard({
  request,
  onClick,
}: SupervisorRequestCardProps) {
  const title = getRequestDetailTitle(request);
  const location = getRequestDetailSubtitle(request);
  const requester = formatHandledBy(request.user);

  return (
    <button
      type="button"
      onClick={() => onClick(request)}
      className="flex w-full flex-col gap-3 glass-card p-4 text-right transition-colors hover:bg-white/55 active:bg-white/65"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 break-words text-heading-md text-ink">{title}</p>
        <StatusBadge
          label={getEffectiveStatusDisplay(request)}
          variant={getStatusBadgeVariant(getEffectiveRequestStatus(request))}
        />
      </div>

      {location ? (
        <div className="flex items-center gap-1.5 text-body-sm text-mute">
          <MapPin
            className="h-4 w-4 shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="line-clamp-1">{location}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-sm text-mute">
        <span>{requester}</span>
        <span>{formatPersianDateShort(request.created_at)}</span>
      </div>
    </button>
  );
}
