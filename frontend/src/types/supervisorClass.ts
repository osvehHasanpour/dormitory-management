import type { ClassUserSummary } from './class'

export type SupervisorClassTabValue = 'active' | 'all'

export type SupervisorClassStatus = 'active' | 'completed' | 'cancelled'

export interface SupervisorClassItem {
  id: number
  title: string
  description: string
  location: string
  category: string
  category_display: string
  status: SupervisorClassStatus
  status_display: string
  capacity: number
  enrolled_count: number
  remaining_capacity: number
  is_full: boolean
  start_datetime: string
  end_datetime: string
  teacher: ClassUserSummary | null
  created_by: ClassUserSummary | null
  average_rating: number | null
  ratings_count: number
}

export interface SupervisorClassesData {
  count?: number
  next: string | null
  previous: string | null
  results: SupervisorClassItem[]
}

export interface SupervisorClassCreatePayload {
  title: string
  teacher_id: number
  capacity: number
  location: string
  category: string
  start_datetime: string
  end_datetime: string
}

export type SupervisorClassUpdatePayload = Omit<SupervisorClassCreatePayload, 'category'>
