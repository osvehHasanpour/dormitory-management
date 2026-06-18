export interface CleaningOption {
  value: string
  label: string
}

export interface CleaningRequestFormValues {
  blockId: string
  floorId: string
  line: string
  spaceType: string
  description: string
}

export interface Block {
  id: number
  name: string
  total_floors?: number
}

export interface Floor {
  id: number
  floor: number
  label: string
}

export interface BlocksResponse {
  results: Block[]
}

export interface FloorsResponse {
  results: Floor[]
}

export interface CleaningRequestResponse {
  id: number
  request_type: 'cleaning'
  status: string
  description: string
  location: string
  preferred_date: string
  extra_description: string
  created_at: string
}

export const cleaningLines: CleaningOption[] = [
  { value: 'line-a', label: 'لاین الف' },
  { value: 'line-b', label: 'لاین ب' },
  { value: 'line-c', label: 'لاین ج' },
  { value: 'line-d', label: 'لاین د' },
]

export const cleaningSpaceTypes: CleaningOption[] = [
  { value: 'bathroom', label: 'سرویس بهداشتی' },
  { value: 'hallway', label: 'راهرو' },
  { value: 'kitchen', label: 'آشپزخانه' },
  { value: 'lobby', label: 'لابی' },
  { value: 'study-room', label: 'اتاق مطالعه' },
  { value: 'laundry', label: 'لباسشویی' },
]
