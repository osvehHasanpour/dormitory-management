import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type {
  Block,
  BlocksResponse,
  CleaningRequestFormValues,
  CleaningRequestResponse,
  Floor,
  FloorsResponse,
} from '../types/cleaning'
import { cleaningLines, cleaningSpaceTypes } from '../types/cleaning'

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

function unwrapResults<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) {
    return data
  }

  return data.results ?? []
}

export async function fetchBlocks(accessToken: string): Promise<Block[]> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<Block[] | BlocksResponse>>(
      '/v1/blocks/',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return unwrapResults(response.data.data)
  } catch (error) {
    throw new Error(extractApiError(error, 'دریافت لیست بلوک‌ها ناموفق بود. لطفاً دوباره تلاش کنید.'), {
      cause: error,
    })
  }
}

export async function fetchFloors(blockId: string, accessToken: string): Promise<Floor[]> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<Floor[] | FloorsResponse>>(
      `/v1/blocks/${blockId}/floors/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return unwrapResults(response.data.data)
  } catch (error) {
    throw new Error(extractApiError(error, 'دریافت لیست طبقات ناموفق بود. لطفاً دوباره تلاش کنید.'), {
      cause: error,
    })
  }
}

function resolveLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

function buildLocation(
  blockName: string,
  floorLabel: string,
  lineLabel: string,
  spaceLabel: string,
): string {
  return `${blockName} - ${floorLabel} - ${lineLabel} - ${spaceLabel}`
}

export async function submitCleaningRequest(
  values: CleaningRequestFormValues,
  accessToken: string,
  blockName: string,
  floorLabel: string,
): Promise<CleaningRequestResponse> {
  const lineLabel = resolveLabel(cleaningLines, values.line)
  const spaceLabel = resolveLabel(cleaningSpaceTypes, values.spaceType)
  const location = buildLocation(blockName, floorLabel, lineLabel, spaceLabel)
  const preferredDate = new Date().toISOString().slice(0, 10)

  try {
    const response = await apiClient.post<ApiSuccessResponse<CleaningRequestResponse>>(
      '/v1/cleaning/requests/',
      {
        description: spaceLabel,
        location,
        preferred_date: preferredDate,
        extra_description: values.description.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error, 'ثبت درخواست نظافت ناموفق بود. لطفاً دوباره تلاش کنید.'), {
      cause: error,
    })
  }
}
