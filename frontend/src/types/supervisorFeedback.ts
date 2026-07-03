export type FeedbackType = 'idea' | 'complaint' 

export type FeedbackStatus = 'pending' | 'reviewed' | 'answered' | 'rejected'

export type FeedbackFilterValue = 'all' | 'complaint' | 'suggestion'

export interface FeedbackAuthorSummary {
  id: number
  personnel_code: string
  first_name: string
  last_name: string
  block: string | null
}

export interface SupervisorFeedbackItem {
  id: number
  type: FeedbackType
  type_display: string
  category: string | null
  category_display: string | null
  title: string
  description: string
  status: FeedbackStatus
  status_display: string
  response_text: string
  created_at: string
  updated_at: string
  responded_at: string | null
  responded_within_sla: boolean | null
  is_sla_overdue: boolean
  author: FeedbackAuthorSummary
  responded_by: FeedbackAuthorSummary | null
}

export interface SupervisorFeedbackListResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results: SupervisorFeedbackItem[]
}

export interface FeedbackResponseFormValues {
  response_text: string
}

export type FeedbackStatusAction = 'reviewed' | 'answered' | 'rejected'
