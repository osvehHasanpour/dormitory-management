import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type { IdeaRequestFormValues, IdeaRequestResponse } from '../types/idea'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export async function submitIdeaRequest(
  values: IdeaRequestFormValues,
  accessToken: string,
): Promise<IdeaRequestResponse> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<IdeaRequestResponse>>(
      '/v1/ideas/',
      {
        title: values.title.trim(),
        description: values.description.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'ثبت ایده ناموفق بود. لطفاً دوباره تلاش کنید.'), {
      cause: error,
    })
  }
}
