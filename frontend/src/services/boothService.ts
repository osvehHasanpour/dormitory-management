import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type { BoothRequestFormValues, BoothRequestResponse } from '../types/booth'
import { BOOTH_EVENT_DATE } from '../types/booth'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

function buildBoothDescription(values: BoothRequestFormValues): string {
  const tableLabel = values.tableCount === '2' ? '۲' : '۱'
  const tableLine = `تعداد میز: ${tableLabel}`
  const notes = values.description.trim()

  return notes ? `${tableLine}\n${notes}` : tableLine
}

export async function submitBoothRequest(
  values: BoothRequestFormValues,
  accessToken: string,
): Promise<BoothRequestResponse> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<BoothRequestResponse>>(
      '/v1/requests/booths/',
      {
        name: values.title.trim(),
        category: values.category,
        description: buildBoothDescription(values),
        event_date: BOOTH_EVENT_DATE,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'ثبت درخواست غرفه ناموفق بود. لطفاً دوباره تلاش کنید.'), {
      cause: error,
    })
  }
}
