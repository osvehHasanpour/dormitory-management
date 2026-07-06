import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type {
  FeedbackType,
  SupervisorFeedbackItem,
  SupervisorFeedbackListResponse,
} from '../types/supervisorFeedback'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export async function fetchSupervisorFeedback(
  accessToken: string,
  params?: { type?: FeedbackType },
): Promise<SupervisorFeedbackListResponse> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<SupervisorFeedbackListResponse>>(
      '/v1/supervisor/feedback/',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: params?.type ? { type: params.type } : undefined,
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'دریافت لیست ایده‌ها و شکایات ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}

export async function fetchSupervisorFeedbackDetail(
  accessToken: string,
  id: number,
): Promise<SupervisorFeedbackItem> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<SupervisorFeedbackItem>>(
      `/v1/supervisor/feedback/${id}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'دریافت جزئیات ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}

export async function markFeedbackReviewed(
  accessToken: string,
  id: number,
): Promise<SupervisorFeedbackItem> {
  try {
    const response = await apiClient.patch<ApiSuccessResponse<SupervisorFeedbackItem>>(
      `/v1/supervisor/feedback/${id}/mark-review/`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'تغییر وضعیت به «در حال بررسی» ناموفق بود.'),
      { cause: error },
    )
  }
}

export async function respondToFeedback(
  accessToken: string,
  id: number,
  responseText: string,
): Promise<SupervisorFeedbackItem> {
  try {
    const response = await apiClient.patch<ApiSuccessResponse<SupervisorFeedbackItem>>(
      `/v1/supervisor/feedback/${id}/respond/`,
      { response_text: responseText.trim() },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'ثبت پاسخ ناموفق بود.'), { cause: error })
  }
}

export async function rejectFeedback(
  accessToken: string,
  id: number,
  responseText: string,
): Promise<SupervisorFeedbackItem> {
  try {
    const response = await apiClient.patch<ApiSuccessResponse<SupervisorFeedbackItem>>(
      `/v1/supervisor/feedback/${id}/reject/`,
      { response_text: responseText.trim() },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'رد مورد ناموفق بود.'), { cause: error })
  }
}

export async function reviewIdea(
  accessToken: string,
  id: number,
  action: 'approve' | 'reject',
  responseText: string,
): Promise<SupervisorFeedbackItem> {
  try {
    const response = await apiClient.patch<ApiSuccessResponse<SupervisorFeedbackItem>>(
      `/v1/supervisor/feedback/${id}/review/`,
      {
        action,
        response_text: responseText.trim(),
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'بررسی ایده ناموفق بود.'), { cause: error })
  }
}
