export interface IdeaRequestFormValues {
  title: string
  description: string
}

export type IdeaVoteType = 'up' | 'down'

export interface IdeaAuthorSummary {
  id: number
  personnel_code: string
  first_name: string
  last_name: string
}

export interface IdeaRequestResponse {
  id: number
  title: string
  description: string
  status: string
  status_display: string
  type: 'idea'
  type_display: string
  likes_count: number
  dislikes_count: number
  user_vote?: IdeaVoteType | null
  is_owner: boolean
  supervisor_response?: string
  response_text?: string
  category?: string | null
  category_display?: string | null
  created_at?: string | null
  responded_at?: string | null
  responded_within_sla?: boolean | null
  author: IdeaAuthorSummary
}

export type IdeaFeedItem = IdeaRequestResponse

export interface IdeaListResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results: IdeaFeedItem[]
}
