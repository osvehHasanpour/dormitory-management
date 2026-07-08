import type {
  MyComplaintDetail,
  MyComplaintListItem,
} from "../../types/complaint";
import { formatPersianDateShort } from "../../utils/formatRelativeDate";
import { getFeedbackStatusBadgeVariant } from "../../utils/supervisorFeedbackHelpers";
import { Skeleton } from "../ui/Skeleton";
import { StatusBadge } from "../ui/StatusBadge";

interface ComplaintDetailSheetProps {
  complaint: MyComplaintDetail | null;
  preview: MyComplaintListItem | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function DetailLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="glass-card space-y-3 p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function ComplaintDetailSheet({
  complaint,
  preview,
  isLoading,
  error,
  onRetry,
}: ComplaintDetailSheetProps) {
  const displayComplaint = complaint ?? preview;

  if (!displayComplaint && isLoading) {
    return <DetailLoadingSkeleton />;
  }

  if (!displayComplaint) {
    return (
      <div className="py-6 text-center">
        <p className="text-body-md text-body-text">
          جزئیات شکایت در دسترس نیست.
        </p>
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
    );
  }

  const categoryLabel = displayComplaint.category_display?.trim();
  const supervisorResponse = (
    displayComplaint.supervisor_response ||
    displayComplaint.response_text ||
    ""
  ).trim();

  return (
    <div className="space-y-5 animate-[sheet-content-in_360ms_ease-out_both]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {categoryLabel ? (
          <span className="inline-flex rounded-full bg-primary-ultra-light px-3 py-1.5 text-body-sm-strong text-primary-deep">
            {categoryLabel}
          </span>
        ) : (
          <span />
        )}
        <StatusBadge
          label={displayComplaint.status_display}
          variant={getFeedbackStatusBadgeVariant(displayComplaint.status)}
        />
      </div>

      <p className="text-caption-sm text-mute">
        تاریخ ثبت: {formatPersianDateShort(displayComplaint.created_at)}
      </p>

      <section className="glass-card overflow-hidden px-4 py-3.5">
        <p className="text-body-sm-strong text-mute">شرح شکایت</p>
        <p className="mt-1 whitespace-pre-wrap text-body-md text-ink">
          {displayComplaint.description}
        </p>
      </section>

      <section className="glass-card overflow-hidden px-4 py-3.5">
        <p className="text-body-sm-strong text-mute">پاسخ سرپرست</p>
        {supervisorResponse ? (
          <p className="mt-1 whitespace-pre-wrap text-body-md text-ink">
            {supervisorResponse}
          </p>
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
    </div>
  );
}
