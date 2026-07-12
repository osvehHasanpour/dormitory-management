export type RequestType = "maintenance" | "cleaning" | "item" | "booth";

export type RequestStatus =
  "pending" | "in_progress" | "approved" | "rejected" | "completed";

export type RequestFilterValue = "all" | RequestType;

export type MyRequestsTab = RequestFilterValue | "complaints";

export interface UserSummary {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
  role_name: string | null;
}

export interface RequestStatusHistoryEntry {
  id: number;
  previous_status: RequestStatus | null;
  previous_status_display: string | null;
  new_status: RequestStatus;
  new_status_display: string;
  acting_supervisor: UserSummary | null;
  comment: string;
  rejection_reason: string;
  created_at: string;
}

export interface StudentRequestListItem {
  id: number;
  request_type: RequestType;
  request_type_display: string;
  status: RequestStatus;
  status_display: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: UserSummary;
  handled_by: UserSummary | null;
  assigned_staff: UserSummary | null;
  rejection_reason: string;
  supervisor_response: string | null;
  status_timeline: RequestStatusHistoryEntry[];
  ai_content_flag: boolean | null;
}

export interface StudentRequestDetail extends StudentRequestListItem {
  location?: string;
  extra_description?: string;
  category?: string;
  photo_url?: string | null;
  item?: {
    id: number;
    item_name: string;
  };
  quantity?: number;
  delivery_status?: string;
  name?: string;
  event_date?: string;
  approval_date?: string | null;
}

export interface PaginatedRequestsData {
  count?: number;
  next: string | null;
  previous: string | null;
  results: StudentRequestListItem[];
}

export interface SupervisorRequestsData {
  count?: number;
  next: string | null;
  previous: string | null;
  results: StudentRequestDetail[];
}

export interface RequestStatusChangePayload {
  status: RequestStatus;
  supervisor_response?: string;
  rejection_reason?: string;
  comment?: string;
  assigned_staff_id?: number;
}

export type TimelineStepState =
  "pending" | "active" | "completed" | "rejected" | "approved";

export interface TimelineStep {
  id: string;
  label: string;
  state: TimelineStepState;
  date: string | null;
  note?: string;
}
