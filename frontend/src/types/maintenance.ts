export interface MaintenanceReportFormValues {
  block: string
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
  extra_description: string
  photo_url: string | null
  created_at: string
}

export const maintenanceBlocks: MaintenanceOption[] = [
  { value: 'بلوک الف', label: 'بلوک الف' },
  { value: 'بلوک ب', label: 'بلوک ب' },
  { value: 'بلوک ج', label: 'بلوک ج' },
  { value: 'بلوک د', label: 'بلوک د' },
  { value: 'بلوک ه', label: 'بلوک ه' },
]

export const maintenanceCategories: MaintenanceOption[] = [
  { value: 'bathroom', label: 'سرویس بهداشتی' },
  { value: 'bath', label: 'حمام' },
  { value: 'kitchen', label: 'آشپزخانه' },
  { value: 'room', label: 'اتاق' },
  { value: 'facilities', label: 'تأسیسات' },
]
