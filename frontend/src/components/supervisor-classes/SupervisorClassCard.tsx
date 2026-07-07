import { Pencil, Trash2 } from "lucide-react";

import {
  buildRatingStars,
  formatAverageRating,
} from "../../data/supervisorClassItems";
import type { SupervisorClassItem } from "../../types/supervisorClass";
import { formatClassSchedule } from "../../utils/formatClassSchedule";
import { formatPersianDateShort } from "../../utils/formatRelativeDate";

interface SupervisorClassCardProps {
  classItem: SupervisorClassItem;
  onEdit: (classItem: SupervisorClassItem) => void;
  onDelete: (classItem: SupervisorClassItem) => void;
  isCancelling: boolean;
}

function getTeacherName(classItem: SupervisorClassItem): string {
  const teacherName =
    `${classItem.teacher?.first_name ?? ""} ${classItem.teacher?.last_name ?? ""}`.trim();
  return teacherName || "نامشخص";
}

function getStatusBadge(classItem: SupervisorClassItem): {
  label: string;
  className: string;
} {
  if (classItem.status === "cancelled") {
    return {
      label: classItem.status_display,
      className: "bg-error-pale text-error",
    };
  }

  if (classItem.status === "completed") {
    return {
      label: classItem.status_display,
      className: "bg-surface-card text-mute",
    };
  }

  if (classItem.is_full) {
    return { label: "تکمیل ظرفیت", className: "bg-warning-pale text-warning" };
  }

  return { label: "فعال", className: "bg-success-pale text-success-deep" };
}

export function SupervisorClassCard({
  classItem,
  onEdit,
  onDelete,
  isCancelling,
}: SupervisorClassCardProps) {
  const capacityPercent =
    classItem.capacity > 0
      ? Math.min(100, (classItem.enrolled_count / classItem.capacity) * 100)
      : 0;
  const statusBadge = getStatusBadge(classItem);
  const canManage =
    classItem.status === "active" &&
    new Date(classItem.end_datetime) > new Date();
  const scheduleText = formatClassSchedule(
    classItem.day_of_week_display,
    classItem.start_time,
    classItem.end_time,
  );

  return (
    <article className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-heading-md text-ink">
            {classItem.title}
          </h3>
          <p className="mt-1 text-body-sm text-mute">
            مدرس: {getTeacherName(classItem)}
          </p>
          <p className="mt-1 text-body-sm text-mute">
            تاریخ: {formatPersianDateShort(classItem.start_datetime)}
          </p>
          {scheduleText !== "—" ? (
            <p className="mt-1 text-body-sm text-mute">
              برنامه: {scheduleText}
            </p>
          ) : null}
          {classItem.location.trim() ? (
            <p className="mt-1 text-body-sm text-mute">
              مکان: {classItem.location}
            </p>
          ) : null}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption-md font-medium ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-body-sm">
          <span className="text-mute">ظرفیت {classItem.capacity} نفر</span>
          <span className="text-body-sm-strong text-ink">
            {classItem.enrolled_count}/{classItem.capacity}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-card">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${capacityPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-heading-md leading-none text-warning">
            {buildRatingStars(classItem.average_rating).map((star, index) => (
              <span key={index} aria-hidden="true">
                {star}
              </span>
            ))}
          </div>
          <p className="mt-1 text-caption-md text-mute">
            {formatAverageRating(classItem.average_rating)}
          </p>
        </div>
      </div>

      {canManage ? (
        <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4">
          <button
            type="button"
            onClick={() => onEdit(classItem)}
            disabled={isCancelling}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-stone bg-transparent text-button-md text-ink transition-colors hover:bg-surface-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>ویرایش</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(classItem)}
            disabled={isCancelling}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-error bg-transparent text-button-md text-error transition-colors hover:bg-error-pale disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
            <span>حذف</span>
          </button>
        </div>
      ) : null}
    </article>
  );
}
