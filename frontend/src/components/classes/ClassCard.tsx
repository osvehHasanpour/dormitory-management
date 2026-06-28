import type { ClassesTabValue, StudentClassItem } from '../../types/class'
import { formatPersianDateShort } from '../../utils/formatRelativeDate'

type CardActionType = 'register' | 'cancel' | 'rate'

interface ClassCardProps {
  classItem: StudentClassItem
  tab: ClassesTabValue
  onRegister: (classId: number) => void
  onCancel: (classId: number) => void
  onRate: (classItem: StudentClassItem) => void
  isActionPending: (type: CardActionType, classId: number) => boolean
}

interface CardActionConfig {
  label: string
  onClick?: () => void
  variant: 'primary' | 'secondary' | 'disabled'
  isPending: boolean
}

function getTeacherName(classItem: StudentClassItem): string {
  const teacherName = `${classItem.teacher?.first_name ?? ''} ${classItem.teacher?.last_name ?? ''}`.trim()
  return teacherName || 'نامشخص'
}

function buildRatingStars(averageRating: number | null): string[] {
  const roundedValue = Math.max(0, Math.min(5, Math.round(averageRating ?? 0)))
  return Array.from({ length: 5 }, (_, index) => (index < roundedValue ? '★' : '☆'))
}

function getActionConfig(
  tab: ClassesTabValue,
  classItem: StudentClassItem,
  onRegister: (classId: number) => void,
  onCancel: (classId: number) => void,
  onRate: (classItem: StudentClassItem) => void,
  isActionPending: (type: CardActionType, classId: number) => boolean,
): CardActionConfig {
  if (tab === 'active') {
    if (classItem.is_enrolled) {
      return {
        label: 'ثبت‌نام شده',
        variant: 'secondary',
        isPending: false,
      }
    }

    if (classItem.is_full) {
      return {
        label: 'تکمیل ظرفیت',
        variant: 'disabled',
        isPending: false,
      }
    }

    return {
      label: 'ثبت‌نام',
      onClick: () => onRegister(classItem.id),
      variant: 'primary',
      isPending: isActionPending('register', classItem.id),
    }
  }

  if (tab === 'enrolled') {
    return {
      label: 'لغو ثبت‌نام',
      onClick: () => onCancel(classItem.id),
      variant: 'secondary',
      isPending: isActionPending('cancel', classItem.id),
    }
  }

  if (classItem.can_rate) {
    return {
      label: 'امتیازدهی',
      onClick: () => onRate(classItem),
      variant: 'primary',
      isPending: isActionPending('rate', classItem.id),
    }
  }

  return {
    label: classItem.user_rating ? `امتیاز: ${classItem.user_rating}/5` : 'امتیاز ثبت شده',
    variant: 'secondary',
    isPending: false,
  }
}

export function ClassCard({
  classItem,
  tab,
  onRegister,
  onCancel,
  onRate,
  isActionPending,
}: ClassCardProps) {
  const capacityPercent =
    classItem.capacity > 0 ? Math.min(100, (classItem.registered_count / classItem.capacity) * 100) : 0
  const averageRatingText =
    classItem.average_rating == null ? 'بدون امتیاز' : `${classItem.average_rating.toFixed(1)} از ۵`
  const actionConfig = getActionConfig(tab, classItem, onRegister, onCancel, onRate, isActionPending)
  const statusBadgeClass =
    tab === 'ended'
      ? 'bg-surface-card text-mute'
      : classItem.is_full
        ? 'bg-warning-pale text-warning'
        : 'bg-success-pale text-success-deep'
  const statusLabel =
    tab === 'ended' ? 'پایان یافته' : classItem.is_full ? 'تکمیل ظرفیت' : 'در حال ثبت‌نام'
  const actionClass =
    actionConfig.variant === 'primary'
      ? 'bg-primary text-on-primary hover:bg-primary-pressed'
      : actionConfig.variant === 'secondary'
        ? 'bg-secondary-bg text-on-secondary hover:bg-secondary-pressed'
        : 'bg-surface-card text-ash'

  return (
    <article className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-heading-md text-ink">{classItem.title}</h3>
          <p className="mt-1 text-body-sm text-mute">مدرس: {getTeacherName(classItem)}</p>
          <p className="mt-1 text-body-sm text-mute">
            تاریخ: {formatPersianDateShort(classItem.start_datetime)}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption-md font-medium ${statusBadgeClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-body-sm">
          <span className="text-mute">ظرفیت {classItem.capacity} نفر</span>
          <span className="text-body-sm-strong text-ink">
            {classItem.registered_count}/{classItem.capacity}
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
          <p className="mt-1 text-caption-md text-mute">{averageRatingText}</p>
        </div>

        <button
          type="button"
          onClick={actionConfig.onClick}
          disabled={!actionConfig.onClick || actionConfig.isPending}
          className={`inline-flex h-10 min-w-[110px] items-center justify-center gap-2 rounded-md px-4 text-button-md transition-colors disabled:cursor-not-allowed disabled:hover:bg-inherit ${actionClass}`}
        >
          {actionConfig.isPending ? (
            <span
              className={`h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent`}
              aria-hidden="true"
            />
          ) : null}
          <span>{actionConfig.isPending ? 'در حال ارسال...' : actionConfig.label}</span>
        </button>
      </div>
    </article>
  )
}
