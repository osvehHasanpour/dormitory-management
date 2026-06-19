export interface ItemRequestFormValues {
  block: string
  roomNumber: string
  itemId: string
  quantity: number
  description: string
}

export interface InventoryItem {
  id: number
  item_name: string
  category: string
  quantity: number
  description: string
}

export interface InventoryItemsResponse {
  results: InventoryItem[]
}

export interface ItemRequestResponse {
  id: number
  request_type: 'item'
  status: string
  description: string
  item: {
    id: number
    item_name: string
    category: string
    quantity: number
    description: string
  }
  quantity: number
  delivery_status: string
  created_at: string
}

export const MIN_ITEM_QUANTITY = 1
export const MAX_ITEM_QUANTITY = 3
export const MAX_ACTIVE_ITEM_REQUESTS = 3
