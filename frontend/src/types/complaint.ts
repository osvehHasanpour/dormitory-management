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
