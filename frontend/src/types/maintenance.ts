export interface MaintenanceReportFormValues {
  blockId: string
  roomNumber: string
  category: string
  description: string
  photo: File | null
}

export interface MaintenanceOption {
  value: string
  label: string
}

export interface MaintenanceReportResponse {
  id: number
  request_type: 'maintenance'
  status: string
  description: string
  location: string
  category: string
  photo_url: string | null
  created_at: string
}

export const ROOM_CATEGORY = 'room'

export function isRoomCategory(category: string): boolean {
  return category === ROOM_CATEGORY
}

export const maintenanceCategories: MaintenanceOption[] = [
  { value: 'bathroom', label: 'سرویس بهداشتی' },
  { value: 'bath', label: 'حمام' },
  { value: 'kitchen', label: 'آشپزخانه' },
  { value: ROOM_CATEGORY, label: 'اتاق' },
  { value: 'facilities', label: 'تأسیسات' },
]

export function getMaintenanceCategoryLabel(value: string): string {
  return maintenanceCategories.find((category) => category.value === value)?.label ?? value
}
