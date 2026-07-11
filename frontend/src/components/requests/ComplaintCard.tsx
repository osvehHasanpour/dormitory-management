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
      className="flex w-full min-w-0 flex-col gap-3 glass-card p-4 text-right transition-colors hover:bg-white/55 active:bg-white/65 min-[480px]:flex-row min-[480px]:items-start"
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-heading-md text-ink">{complaint.title}</p>
        <p className="mt-1 line-clamp-2 break-words text-body-sm text-body-text">
          {buildFeedbackPreview(complaint.description)}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 min-[480px]:flex-col min-[480px]:items-end">
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
