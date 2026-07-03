import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type {
  AnnouncementCreateFormValues,
  AnnouncementListItem,
  AnnouncementListResponse,
} from '../types/announcement'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export async function fetchAnnouncements(accessToken: string): Promise<AnnouncementListResponse> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<AnnouncementListResponse>>(
      '/v1/announcements/',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'دریافت اطلاعیه‌ها ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}

export async function createAnnouncement(
  values: AnnouncementCreateFormValues,
  accessToken: string,
): Promise<AnnouncementListItem> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<AnnouncementListItem>>(
      '/v1/announcements/',
      {
        title: values.title.trim(),
        content: values.content.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      extractApiError(error, 'ثبت اطلاعیه ناموفق بود. لطفاً دوباره تلاش کنید.'),
      { cause: error },
    )
  }
}
