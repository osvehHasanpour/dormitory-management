import type { RequestStatus, RequestType } from "../types/request";

export interface SupervisorRequestTab {
  value: RequestType;
  label: string;
}

export const supervisorRequestTabs: SupervisorRequestTab[] = [
  { value: "cleaning", label: "نظافت" },
  { value: "item", label: "لوازم اتاق" },
  { value: "maintenance", label: "گزارش خرابی" },
  { value: "booth", label: "درخواست غرفه" },
];

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: "در انتظار",
  in_progress: "در حال بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
  completed: "انجام شده",
};

// Mirrors backend state machine (requests_app/services/state_machine.py) so the
// supervisor dropdown only offers transitions the API will accept.
const COMMON_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pending: ["in_progress", "approved", "rejected"],
  in_progress: ["approved", "rejected", "completed"],
  approved: ["in_progress", "completed", "rejected"],
  rejected: [],
  completed: [],
};

const MAINTENANCE_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pending: ["in_progress", "rejected"],
  in_progress: ["approved", "rejected", "completed"],
  approved: ["completed", "rejected"],
  rejected: [],
  completed: [],
};

export function getAllowedNextStatuses(
  requestType: RequestType,
  currentStatus: RequestStatus,
): RequestStatus[] {
  const transitions =
    requestType === "maintenance"
      ? MAINTENANCE_TRANSITIONS
      : COMMON_TRANSITIONS;
  return transitions[currentStatus] ?? [];
}

export function getRequestStatusLabel(status: RequestStatus): string {
  return requestStatusLabels[status];
}
