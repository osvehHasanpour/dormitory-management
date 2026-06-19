import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type {
  PaginatedRequestsData,
  RequestType,
  StudentRequestDetail,
} from '../types/request'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export async function fetchMyRequests(
  accessToken: string,
  requestType?: RequestType,
): Promise<PaginatedRequestsData> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedRequestsData>>(
      '/v1/requests/my/',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: requestType ? { request_type: requestType } : undefined,
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'دریافت درخواست‌ها ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}

export async function fetchRequestDetail(
  accessToken: string,
  requestId: number,
): Promise<StudentRequestDetail> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<StudentRequestDetail>>(
      `/v1/requests/${requestId}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'دریافت جزئیات درخواست ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}
