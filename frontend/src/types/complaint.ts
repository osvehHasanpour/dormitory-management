export interface ComplaintRequestFormValues {
  category: string;
  title: string;
  description: string;
}

export interface ComplaintCategoryOption {
  value: string;
  label: string;
}

export const complaintCategoryOptions: ComplaintCategoryOption[] = [
  { value: "cleaning", label: "نظافت" },
  { value: "facilities", label: "امکانات" },
  { value: "welfare", label: "رفاهی" },
  { value: "security", label: "امنیتی" },
  { value: "education", label: "آموزشی" },
  { value: "maintenance", label: "تعمیرات" },
  { value: "other", label: "سایر" },
];

export interface ComplaintAuthorSummary {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
}

export type ComplaintStatus =
  | "pending"
  | "reviewed"
  | "answered"
  | "rejected";

export interface ComplaintRequestResponse {
  id: number;
  type: "complaint";
  type_display: string;
  category: string | null;
  category_display: string | null;
  title: string;
  description: string;
  status: string;
  status_display: string;
  supervisor_response: string;
  response_text?: string;
  created_at?: string | null;
  responded_at?: string | null;
  responded_within_sla?: boolean | null;
  author: ComplaintAuthorSummary;
}

export interface MyComplaintListItem {
  id: number;
  title: string;
  description: string;
  category: string | null;
  category_display: string | null;
  status: ComplaintStatus;
  status_display: string;
  supervisor_response: string;
  response_text?: string;
  created_at: string;
  responded_at?: string | null;
}

export interface MyComplaintDetail extends MyComplaintListItem {
  type: "complaint";
  type_display: string;
  responded_within_sla?: boolean | null;
  author: ComplaintAuthorSummary;
}

export interface PaginatedComplaintsData {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: MyComplaintListItem[];
}
