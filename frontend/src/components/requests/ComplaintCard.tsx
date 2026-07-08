import type { MyComplaintListItem } from "../../types/complaint";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import {
  buildFeedbackPreview,
  getFeedbackStatusBadgeVariant,
} from "../../utils/supervisorFeedbackHelpers";
import { StatusBadge } from "../ui/StatusBadge";

interface ComplaintCardProps {
  complaint: MyComplaintListItem;
  onClick: (complaint: MyComplaintListItem) => void;
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(complaint)}
      className="flex w-full items-start gap-3 glass-card p-4 text-right transition-colors hover:bg-white/55 active:bg-white/65"
    >
      <div className="min-w-0 flex-1">
        <p className="text-heading-md text-ink">{complaint.title}</p>
        <p className="mt-1 line-clamp-2 text-body-sm text-body-text">
          {buildFeedbackPreview(complaint.description)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge
          label={complaint.status_display}
          variant={getFeedbackStatusBadgeVariant(complaint.status)}
        />
        <span className="text-caption-sm text-mute">
          {formatRelativeDate(complaint.created_at)}
        </span>
      </div>
    </button>
  );
}
