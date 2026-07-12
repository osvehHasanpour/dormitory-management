import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { RequestUpdateFormValues } from "../../hooks/useSupervisorRequestUpdate";
import type { StudentRequestDetail } from "../../types/request";
import {
  getAllowedNextStatuses,
  getRequestStatusLabel,
} from "../../data/supervisorRequestItems";
import { formatPersianDateShort } from "../../utils/formatRelativeDate";
import {
  buildRequestDetailRows,
  formatHandledBy,
  getEffectiveRequestStatus,
  getEffectiveStatusDisplay,
  getRequestTypeLabel,
  getStatusBadgeVariant,
  type RequestDetailRow,
} from "../../utils/requestHelpers";
import { Skeleton } from "../ui/Skeleton";
import { StatusBadge } from "../ui/StatusBadge";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";
import { Toast } from "../ui/Toast";

interface SupervisorRequestDetailSheetProps {
  request: StudentRequestDetail | null;
  preview: StudentRequestDetail | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  toastMessage: string | null;
  form: UseFormReturn<RequestUpdateFormValues>;
  onRetry: () => void;
  onClearMessages: () => void;
  onSubmit: () => void;
}

const fieldClassName =
  "w-full rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30";

function DetailLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-32 rounded-full" />
      <div className="glass-card space-y-3 p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );
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
                row.highlight ? "text-heading-md text-ink" : "text-ink"
              }`}
            >
              {row.value}
            </p>
          </div>
          {index < rows.length - 1 ? <div className="glass-divider" /> : null}
        </div>
      ))}
    </div>
  );
}

export function SupervisorRequestDetailSheet({
  request,
  preview,
  isLoading,
  error,
  isSubmitting,
  toastMessage,
  form,
  onRetry,
  onClearMessages,
  onSubmit,
}: SupervisorRequestDetailSheetProps) {
  const displayRequest = request ?? preview;
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (request) {
      form.reset({
        status: "",
        supervisor_response: request.supervisor_response ?? "",
      });
    }
  }, [form, request]);

  if (isLoading && !displayRequest) {
    return <DetailLoadingSkeleton />;
  }

  if (error && !displayRequest) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-body-md text-error">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-button-md text-on-primary"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!displayRequest) {
    return null;
  }

  const typeLabel = getRequestTypeLabel(displayRequest.request_type);
  const effectiveStatus = getEffectiveRequestStatus(displayRequest);
  const infoRows = request
    ? buildRequestDetailRows(request)
    : [
        {
          label: "تاریخ ثبت",
          value: formatPersianDateShort(displayRequest.created_at),
        },
      ];
  const allowedStatuses = getAllowedNextStatuses(
    displayRequest.request_type,
    displayRequest.status,
  );
  const isFinalized = allowedStatuses.length === 0;
  const canUpdate = request != null && !isFinalized;
  const statusOptions = allowedStatuses.map((status) => ({
    value: status,
    label: getRequestStatusLabel(status),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-primary-ultra-light px-3 py-1.5 text-body-sm-strong text-primary-deep">
          {typeLabel}
        </span>
        <StatusBadge
          label={getEffectiveStatusDisplay(displayRequest)}
          variant={getStatusBadgeVariant(effectiveStatus)}
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3.5">
          <p className="text-body-sm-strong text-mute">درخواست‌دهنده</p>
          <p className="mt-1 text-body-md text-ink">
            {formatHandledBy(displayRequest.user)}
          </p>
        </div>
      </div>

      <DetailInfoRows rows={infoRows} />

      {request?.request_type === "maintenance" && request.photo_url ? (
        <div className="glass-card overflow-hidden p-4">
          <p className="mb-3 text-body-sm-strong text-mute">تصویر پیوست</p>
          <img
            src={request.photo_url}
            alt="تصویر درخواست"
            className="max-h-48 w-full rounded-md object-cover"
          />
        </div>
      ) : null}

      {displayRequest.supervisor_response?.trim() ? (
        <div className="glass-card overflow-hidden px-4 py-3.5">
          <p className="text-body-sm-strong text-mute">پاسخ فعلی سرپرست</p>
          <p className="mt-1 whitespace-pre-wrap text-body-md text-ink">
            {displayRequest.supervisor_response}
          </p>
        </div>
      ) : null}

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

      {isFinalized && request ? (
        <p className="rounded-md bg-surface-card px-4 py-3 text-body-sm text-mute">
          این درخواست نهایی شده است و امکان تغییر وضعیت آن وجود ندارد.
        </p>
      ) : null}

      {canUpdate ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="block">
            <span className="mb-2 block text-body-sm-strong text-ink">
              تغییر وضعیت درخواست
            </span>
            <ResponsiveDropdown
              value={watch("status")}
              onChange={(nextValue) => {
                onClearMessages();
                setValue("status", nextValue, { shouldValidate: true });
              }}
              onBlur={() => {
                void trigger("status");
              }}
              disabled={isSubmitting}
              elevated
              options={statusOptions}
              placeholder="انتخاب وضعیت جدید"
              panelTitle="تغییر وضعیت درخواست"
            />
            {errors.status?.message ? (
              <p className="mt-2 text-body-sm text-error">
                {errors.status.message}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-body-sm-strong text-ink">
              پاسخ سرپرست
            </span>
            <textarea
              rows={5}
              placeholder="توضیحات و پاسخ خود را بنویسید (اختیاری)"
              className={`${fieldClassName} min-h-28 resize-y`}
              disabled={isSubmitting}
              {...register("supervisor_response", {
                onChange: onClearMessages,
              })}
            />
            {errors.supervisor_response?.message ? (
              <p className="mt-2 text-body-sm text-error">
                {errors.supervisor_response.message}
              </p>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "در حال ثبت..." : "ثبت تغییرات"}
          </button>
        </form>
      ) : null}

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </div>
  );
}
