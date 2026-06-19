import type {
  RequestStatus,
  RequestStatusHistoryEntry,
  StudentRequestListItem,
  TimelineStep,
  TimelineStepState,
  UserSummary,
} from '../types/request'

export type StatusBadgeVariant = 'pending' | 'approved' | 'rejected'

const OPEN_STATUSES: RequestStatus[] = ['pending', 'in_progress', 'approved']

const STATUS_BADGE_VARIANT: Record<RequestStatus, StatusBadgeVariant> = {
  pending: 'pending',
  in_progress: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  completed: 'approved',
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

function findHistoryDate(
  timeline: RequestStatusHistoryEntry[],
  statuses: RequestStatus[],
): string | null {
  const entry = timeline.find((item) => statuses.includes(item.new_status))
  return entry?.created_at ?? null
}

function resolveStepState(
  stepIndex: number,
  reachedIndex: number,
  isRejectedPath: boolean,
  currentStatus: RequestStatus,
): TimelineStepState {
  if (stepIndex === 2 && isRejectedPath) {
    return currentStatus === 'rejected' ? 'rejected' : reachedIndex >= 2 ? 'completed' : 'pending'
  }

  if (stepIndex < reachedIndex) {
    return 'completed'
  }

  if (stepIndex === reachedIndex) {
    return 'active'
  }

  return 'pending'
}

export function buildTimelineSteps(
  status: RequestStatus,
  createdAt: string,
  timeline: RequestStatusHistoryEntry[],
): TimelineStep[] {
  const inProgressDate = findHistoryDate(timeline, ['in_progress'])
  const decisionDate = findHistoryDate(timeline, ['approved', 'rejected'])
  const completedDate = findHistoryDate(timeline, ['completed'])

  const isRejectedPath =
    status === 'rejected' || timeline.some((item) => item.new_status === 'rejected')

  let reachedIndex = 0
  if (status === 'pending') {
    reachedIndex = 0
  } else if (status === 'in_progress') {
    reachedIndex = 1
  } else if (status === 'approved' || status === 'rejected') {
    reachedIndex = 2
  } else if (status === 'completed') {
    reachedIndex = 3
  }

  const stepDefinitions: Omit<TimelineStep, 'state'>[] = [
    { id: 'submitted', label: 'ثبت شده', date: createdAt },
    {
      id: 'review',
      label: 'در حال بررسی',
      date: inProgressDate ?? (reachedIndex >= 1 ? createdAt : null),
    },
    {
      id: 'decision',
      label: isRejectedPath && status === 'rejected' ? 'رد شده' : 'تأیید/رد',
      date: decisionDate,
    },
    {
      id: 'completed',
      label: 'انجام شده',
      date: completedDate,
    },
  ]

  return stepDefinitions.map((step, index) => ({
    ...step,
    state: resolveStepState(index, reachedIndex, isRejectedPath, status),
  }))
}
