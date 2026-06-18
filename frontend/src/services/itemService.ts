import axios from 'axios'

import apiClient from './apiClient'
import type { ApiSuccessResponse } from '../types/auth'
import type {
  InventoryItemsResponse,
  ItemRequestFormValues,
  ItemRequestResponse,
} from '../types/item'

function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return 'ثبت درخواست لوازم ناموفق بود. لطفاً دوباره تلاش کنید.'
}

function buildItemRequestDescription(values: ItemRequestFormValues): string {
  const location = `${values.block} - اتاق ${values.roomNumber}`
  const notes = values.description.trim()

  return notes ? `${location}\n${notes}` : location
}

export async function fetchInventoryItems(accessToken: string) {
  try {
    const response = await apiClient.get<ApiSuccessResponse<InventoryItemsResponse>>(
      '/v1/requests/inventory-items/',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data.results
  } catch (error) {
    throw new Error(extractApiError(error), { cause: error })
  }
}

export async function submitItemRequest(
  values: ItemRequestFormValues,
  accessToken: string,
): Promise<ItemRequestResponse> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<ItemRequestResponse>>(
      '/v1/requests/items/',
      {
        item: Number(values.itemId),
        quantity: values.quantity,
        description: buildItemRequestDescription(values),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return response.data.data
  } catch (error) {
    throw new Error(extractApiError(error), { cause: error })
  }
}
