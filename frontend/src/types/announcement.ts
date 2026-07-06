export interface AnnouncementCreatorSummary {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar?: string | null;
}

export interface AnnouncementListItem {
  id: number;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  created_by: AnnouncementCreatorSummary;
}

export interface AnnouncementListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: AnnouncementListItem[];
}

export interface AnnouncementCreateFormValues {
  title: string;
  content: string;
}
