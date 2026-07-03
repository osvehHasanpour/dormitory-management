import { feedbackTypeBadgeConfig } from '../../data/supervisorFeedbackItems'
import type { SupervisorFeedbackItem } from '../../types/supervisorFeedback'
import { formatPersianDateShort } from '../../utils/formatRelativeDate'
import {
  buildFeedbackPreview,
  getFeedbackStatusBadgeVariant,
} from '../../utils/supervisorFeedbackHelpers'
import { StatusBadge } from '../ui/StatusBadge'

interface FeedbackCardProps {
  item: SupervisorFeedbackItem
  onClick: (item: SupervisorFeedbackItem) => void
}

export function FeedbackCard({ item, onClick }: FeedbackCardProps) {
  const typeConfig = feedbackTypeBadgeConfig[item.type]
  const preview = buildFeedbackPreview(item.description)

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="flex w-full flex-col gap-3 glass-card p-4 text-right transition-colors hover:bg-white/55 active:bg-white/65"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption-md font-medium ${typeConfig.className}`}
        >
          {typeConfig.label}
        </span>
        <StatusBadge
          label={item.status_display}
          variant={getFeedbackStatusBadgeVariant(item.status)}
        />
      </div>

      <div>
        <p className="text-heading-md text-ink">{item.title}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-sm text-mute">
        <span>{formatPersianDateShort(item.created_at)}</span>
        {item.category_display ? <span>دسته‌بندی: {item.category_display}</span> : null}
        {item.is_sla_overdue ? (
          <span className="text-error">گذشته از مهلت پاسخ</span>
        ) : null}
      </div>

      <p className="line-clamp-2 text-body-sm text-body-text">{preview}</p>
    </button>
  )
}
