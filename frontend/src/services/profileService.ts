import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse, ApiUserProfile } from '../types/auth'

function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return 'دریافت پروفایل ناموفق بود. لطفاً دوباره تلاش کنید.'
}

export async function fetchProfile(accessToken: string): Promise<ApiUserProfile> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<ApiUserProfile>>('/v1/auth/profile/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error), { cause: error })
  }
}
