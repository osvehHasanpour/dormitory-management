export type ClassesTabValue = "active" | "enrolled" | "ended";

export interface ClassUserSummary {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
  role_name: string | null;
}

export interface StudentClassItem {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  category_display: string;
  capacity: number;
  registered_count: number;
  remaining_capacity: number;
  is_full: boolean;
  start_datetime: string;
  end_datetime: string;
  teacher: ClassUserSummary | null;
  created_by: ClassUserSummary | null;
  average_rating: number | null;
  is_enrolled: boolean;
  can_rate: boolean;
  user_rating: number | null;
  registered_at?: string | null;
}

export interface PaginatedClassesData {
  count?: number;
  next: string | null;
  previous: string | null;
  results: StudentClassItem[];
}

export interface ClassRatingPayload {
  score: number;
  comment?: string;
}

export interface ClassRatingResponse extends StudentClassItem {
  submitted_rating: number;
}
