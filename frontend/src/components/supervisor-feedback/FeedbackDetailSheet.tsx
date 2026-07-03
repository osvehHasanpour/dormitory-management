import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { feedbackTypeBadgeConfig } from '../../data/supervisorFeedbackItems'
import type {
  FeedbackResponseFormValues,
  FeedbackStatusAction,
  SupervisorFeedbackItem,
} from '../../types/supervisorFeedback'
import { formatPersianDateShort } from '../../utils/formatRelativeDate'
import {
  canApproveIdea,
  canMarkReviewed,
  canReject,
  canRejectIdea,
  canRespond,
  formatFeedbackAuthor,
  getFeedbackStatusBadgeVariant,
  hasAvailableFeedbackActions,
} from '../../utils/supervisorFeedbackHelpers'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { Toast } from '../ui/Toast'

interface FeedbackDetailSheetProps {
  item: SupervisorFeedbackItem | null
  preview: SupervisorFeedbackItem | null
  isLoading: boolean
  error: string | null
  isSubmitting: boolean
  toastMessage: string | null
  form: UseFormReturn<FeedbackResponseFormValues>
  onRetry: () => void
  onClearMessages: () => void
  onStatusAction: (action: FeedbackStatusAction) => void
  onApproveIdea: () => void
  onRejectIdea: () => void
}

const textareaClassName =
  'min-h-28 w-full resize-y rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

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
  )
}

function DetailInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-body-sm-strong text-mute">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-body-md text-ink">{value}</p>
    </div>
  )
}

export function FeedbackDetailSheet({
  item,
  preview,
  isLoading,
  error,
  isSubmitting,
  toastMessage,
  form,
  onRetry,
  onClearMessages,
  onStatusAction,
  onApproveIdea,
  onRejectIdea,
}: FeedbackDetailSheetProps) {
  const display = item ?? preview
  const { register, formState: { errors } } = form

  useEffect(() => {
    if (item?.response_text) {
      form.reset({ response_text: item.response_text })
    } else if (item && !item.response_text) {
      form.reset({ response_text: '' })
    }
  }, [form, item])

  if (isLoading && !display) {
    return <DetailLoadingSkeleton />
  }

  if (error && !display) {
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
    )
  }

  if (!display) {
    return null
  }

  const typeConfig = feedbackTypeBadgeConfig[display.type]
  const source = item ?? display
  const showComplaintActions = source.type === 'complaint' || source.type === 'suggestion'
  const showIdeaActions = source.type === 'idea'
  const showActions = item != null && hasAvailableFeedbackActions(item)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption-md font-medium ${typeConfig.className}`}
        >
          {typeConfig.label}
        </span>
        <StatusBadge
          label={source.status_display}
          variant={getFeedbackStatusBadgeVariant(source.status)}
        />
        {source.is_sla_overdue ? (
          <span className="text-caption-md text-error">گذشته از مهلت ۷۲ ساعته</span>
        ) : null}
      </div>

      <div className="glass-card overflow-hidden">
        <DetailInfoRow label="عنوان" value={source.title} />
        <div className="glass-divider" />
        <DetailInfoRow label="دانشجو" value={formatFeedbackAuthor(source.author)} />
        {source.category_display ? (
          <>
            <div className="glass-divider" />
            <DetailInfoRow label="دسته‌بندی" value={source.category_display} />
          </>
        ) : null}
        <div className="glass-divider" />
        <DetailInfoRow label="تاریخ ثبت" value={formatPersianDateShort(source.created_at)} />
        <div className="glass-divider" />
        <DetailInfoRow label="شرح کامل" value={source.description} />
        {source.response_text ? (
          <>
            <div className="glass-divider" />
            <DetailInfoRow label="پاسخ قبلی سرپرست" value={source.response_text} />
          </>
        ) : null}
      </div>

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

      {!isLoading && showActions ? (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-body-sm-strong text-ink">پاسخ سرپرست</span>
            <textarea
              rows={5}
              placeholder="پاسخ یا توضیح خود را بنویسید..."
              className={textareaClassName}
              disabled={isSubmitting}
              {...register('response_text', { onChange: onClearMessages })}
            />
            {errors.response_text?.message ? (
              <p className="mt-2 text-body-sm text-error">{errors.response_text.message}</p>
            ) : null}
          </label>

          {showComplaintActions ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {canMarkReviewed(source) ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onStatusAction('reviewed')}
                  className="flex h-10 flex-1 items-center justify-center rounded-md bg-[#ede4f7] px-4 text-button-sm text-[#582281] transition-colors hover:bg-[#e0d4f0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  در حال بررسی
                </button>
              ) : null}
              {canRespond(source) ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onStatusAction('answered')}
                  className="flex h-10 flex-1 items-center justify-center rounded-md bg-primary text-button-sm text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
                >
                  پاسخ داده شده
                </button>
              ) : null}
              {canReject(source) ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onStatusAction('rejected')}
                  className="flex h-10 flex-1 items-center justify-center rounded-md border border-error bg-error-pale text-button-sm text-error transition-colors hover:bg-[#f9d4d4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  رد شده
                </button>
              ) : null}
            </div>
          ) : null}

          {showIdeaActions ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {canApproveIdea(source) ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onApproveIdea}
                  className="flex h-10 flex-1 items-center justify-center rounded-md bg-primary text-button-sm text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
                >
                  تأیید / بررسی شده
                </button>
              ) : null}
              {canRejectIdea(source) ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onRejectIdea}
                  className="flex h-10 flex-1 items-center justify-center rounded-md border border-error bg-error-pale text-button-sm text-error transition-colors hover:bg-[#f9d4d4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  رد ایده
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </div>
  )
}
