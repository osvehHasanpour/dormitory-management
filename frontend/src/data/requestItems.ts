import culturalStallRequest from '@media/cultural-stall-request.jpg'
import serviceCleaningRequest from '@media/service-cleaning-request.jpg'
import serviceRepairTools from '@media/service-repair-tools.jpg'
import serviceRoomSupplies from '@media/service-room-supplies.jpg'

import type { RequestFilterValue, RequestType } from '../types/request'

export interface RequestTypeConfig {
  type: RequestType
  label: string
  image: string
}

export const requestTypeConfigs: RequestTypeConfig[] = [
  {
    type: 'maintenance',
    label: 'گزارش خرابی',
    image: serviceRepairTools,
  },
  {
    type: 'cleaning',
    label: 'درخواست نظافت',
    image: serviceCleaningRequest,
  },
  {
    type: 'item',
    label: 'درخواست لوازم',
    image: serviceRoomSupplies,
  },
  {
    type: 'booth',
    label: 'درخواست غرفه',
    image: culturalStallRequest,
  },
]

export const requestFilterTabs: { value: RequestFilterValue; label: string }[] = [
  { value: 'all', label: 'همه' },
  ...requestTypeConfigs.map((config) => ({
    value: config.type,
    label: config.label,
  })),
]

export function getRequestTypeConfig(type: RequestType): RequestTypeConfig {
  const config = requestTypeConfigs.find((item) => item.type === type)
  if (!config) {
    throw new Error(`Unknown request type: ${type}`)
  }
  return config
}
