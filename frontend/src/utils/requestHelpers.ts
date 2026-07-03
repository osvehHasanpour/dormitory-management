import { getRequestTypeConfig } from '../data/requestItems'
import { getMaintenanceCategoryLabel } from '../types/maintenance'
import type {
  RequestStatus,
  RequestStatusHistoryEntry,
  RequestType,
  StudentRequestDetail,
  StudentRequestListItem,
  TimelineStep,
  TimelineStepState,
  UserSummary,
} from '../types/request'
import { formatPersianDateShort } from './formatRelativeDate'

export interface RequestDetailRow {
  label: string
  value: string
  highlight?: boolean
}

export type StatusBadgeVariant = 'pending' | 'reviewed' | 'approved' | 'rejected'

const OPEN_STATUSES: RequestStatus[] = ['pending', 'in_progress', 'approved']

const ITEM_DELIVERED_STATUS = 'تحویل داده شده'

const STATUS_BADGE_VARIANT: Record<RequestStatus, StatusBadgeVariant> = {
  pending: 'pending',
  in_progress: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  completed: 'approved',
}

export function getRequestTypeLabel(type: RequestType): string {
  return getRequestTypeConfig(type).label
}

export function isItemRequestDelivered(
  request: StudentRequestListItem | StudentRequestDetail,
): boolean {
  const deliveryStatus = (request as StudentRequestDetail).delivery_status
  return request.request_type === 'item' && deliveryStatus?.trim() === ITEM_DELIVERED_STATUS
}

export function getEffectiveRequestStatus(
  request: StudentRequestListItem | StudentRequestDetail,
): RequestStatus {
  if (isItemRequestDelivered(request)) {
    return 'completed'
  }

  return request.status
}

export function getEffectiveStatusDisplay(
  request: StudentRequestListItem | StudentRequestDetail,
): string {
  if (isItemRequestDelivered(request)) {
    return 'انجام شده'
  }

  return request.status_display
}

export function getStatusBadgeVariant(status: RequestStatus): StatusBadgeVariant {
  return STATUS_BADGE_VARIANT[status]
}

export function isOpenRequest(status: RequestStatus): boolean {
  return OPEN_STATUSES.includes(status)
}

export function sortRequestsOpenFirst(
  requests: StudentRequestListItem[],
): StudentRequestListItem[] {
  return [...requests].sort((left, right) => {
    const leftOpen = isOpenRequest(left.status)
    const rightOpen = isOpenRequest(right.status)

    if (leftOpen !== rightOpen) {
      return leftOpen ? -1 : 1
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

export function formatHandledBy(user: UserSummary | null): string {
  if (!user) {
    return '—'
  }

  const fullName = `${user.first_name} ${user.last_name}`.trim()
  return fullName || user.personnel_code
}

function findHistoryEntry(
  timeline: RequestStatusHistoryEntry[],
  statuses: RequestStatus[],
): RequestStatusHistoryEntry | null {
  return timeline.find((item) => statuses.includes(item.new_status)) ?? null
}

export function getRequestDetailTitle(
  request: StudentRequestListItem | StudentRequestDetail,
): string {
  return getRequestTypeLabel(request.request_type)
}

export function getRequestDetailSubtitle(
  request: StudentRequestListItem | StudentRequestDetail,
): string | null {
  const detail = request as StudentRequestDetail

  switch (request.request_type) {
    case 'maintenance':
      return detail.location?.trim() || null
    case 'cleaning':
      return detail.location?.trim() || null
    case 'item':
      return detail.item?.item_name?.trim() || null
    case 'booth':
      return detail.name?.trim() || null
    default:
      return null
  }
}

export function buildRequestDetailRows(request: StudentRequestDetail): RequestDetailRow[] {
  const rows: RequestDetailRow[] = []

  switch (request.request_type) {
    case 'maintenance':
      if (request.location?.trim()) {
        rows.push({
          label: 'محل خرابی',
          value: request.location.trim(),
          highlight: true,
        })
      }
      if (request.category) {
        rows.push({
          label: 'دسته‌بندی',
          value: getMaintenanceCategoryLabel(request.category),
        })
      }
      break
    case 'cleaning':
      if (request.location?.trim()) {
        rows.push({
          label: 'محل نظافت',
          value: request.location.trim(),
          highlight: true,
        })
      }
      if (request.extra_description?.trim()) {
        rows.push({
          label: 'توضیحات تکمیلی',
          value: request.extra_description.trim(),
        })
      }
      break
    case 'item':
      if (request.item?.item_name) {
        rows.push({
          label: 'نام کالا',
          value: request.item.item_name,
          highlight: true,
        })
      }
      if (request.quantity != null) {
        rows.push({ label: 'تعداد', value: String(request.quantity) })
      }
      if (request.delivery_status?.trim()) {
        rows.push({ label: 'وضعیت تحویل', value: request.delivery_status.trim() })
      }
      break
    case 'booth':
      if (request.name?.trim()) {
        rows.push({
          label: 'عنوان غرفه',
          value: request.name.trim(),
          highlight: true,
        })
      }
      if (request.category?.trim()) {
        rows.push({ label: 'دسته‌بندی', value: request.category.trim() })
      }
      if (request.event_date) {
        rows.push({
          label: 'تاریخ رویداد',
          value: formatPersianDateShort(request.event_date),
        })
      }
      if (request.approval_date) {
        rows.push({
          label: 'تاریخ تأیید',
          value: formatPersianDateShort(request.approval_date),
        })
      }
      break
    default:
      break
  }

  rows.push({
    label: 'تاریخ ثبت',
    value: formatPersianDateShort(request.created_at),
  })

  if (request.description.trim()) {
    rows.push({ label: 'توضیحات', value: request.description.trim() })
  }

  return rows
}

function resolveStepState(
  stepIndex: number,
  reachedIndex: number,
  currentStatus: RequestStatus,
): TimelineStepState {
  if (stepIndex < reachedIndex) {
    if (stepIndex === 1 && currentStatus === 'rejected') {
      return 'rejected'
    }

    if (stepIndex === 1 && currentStatus === 'approved') {
      return 'approved'
    }

    return 'completed'
  }

  if (stepIndex === reachedIndex) {
    if (stepIndex === 1 && currentStatus === 'rejected') {
      return 'rejected'
    }

    if (stepIndex === 1 && currentStatus === 'approved') {
      return 'approved'
    }

    if (currentStatus === 'completed') {
      return 'completed'
    }

    return 'active'
  }

  return 'pending'
}

export function buildTimelineSteps(
  request: StudentRequestListItem | StudentRequestDetail,
): TimelineStep[] {
  const status = getEffectiveRequestStatus(request)
  const timeline = request.status_timeline ?? []
  const rejectionReason = request.rejection_reason ?? ''

  const reviewEntry = findHistoryEntry(timeline, ['in_progress'])
  const approvedEntry = findHistoryEntry(timeline, ['approved'])
  const rejectedEntry = findHistoryEntry(timeline, ['rejected'])
  const completedEntry = findHistoryEntry(timeline, ['completed'])

  const isRejected = status === 'rejected' || rejectedEntry != null
  const decisionEntry = isRejected ? rejectedEntry : approvedEntry

  let reachedIndex = 0
  if (status === 'pending' || status === 'in_progress') {
    reachedIndex = 0
  } else if (status === 'approved' || status === 'rejected') {
    reachedIndex = 1
  } else if (status === 'completed') {
    reachedIndex = 2
  }

  const completedDate =
    completedEntry?.created_at ??
    (isItemRequestDelivered(request) ? request.updated_at : null)

  const stepDefinitions: Omit<TimelineStep, 'state'>[] = [
    {
      id: 'review',
      label: 'در حال بررسی',
      date: reviewEntry?.created_at ?? request.created_at,
    },
    {
      id: 'decision',
      label: isRejected && status === 'rejected' ? 'رد شده' : 'تأیید / رد',
      date: decisionEntry?.created_at ?? null,
      note:
        isRejected && status === 'rejected'
          ? rejectedEntry?.rejection_reason?.trim() || rejectionReason.trim() || undefined
          : undefined,
    },
    {
      id: 'completed',
      label: 'انجام شده',
      date: completedDate,
    },
  ]

  return stepDefinitions.map((step, index) => ({
    ...step,
    state: resolveStepState(index, reachedIndex, status),
  }))
}
