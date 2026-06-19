export interface BoothOption {
  value: string
  label: string
}

export interface BoothRequestFormValues {
  title: string
  category: string
  tableCount: string
  description: string
}

export interface BoothRequestResponse {
  id: number
  request_type: 'booth'
  status: string
  description: string
  name: string
  category: string
  event_date: string
  approval_date: string | null
  created_at: string
}

/** Upcoming student bazaar event date (ISO YYYY-MM-DD). Update before each event. */
export const BOOTH_EVENT_DATE = (() => {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
})()

export const boothCategories: BoothOption[] = [
  { value: 'صنایع دستی و سوغات', label: 'صنایع دستی و سوغات' },
  { value: 'نوشیدنی و میان‌وعده', label: 'نوشیدنی و میان‌وعده' },
  { value: 'کتاب و لوازم‌التحریر', label: 'کتاب و لوازم‌التحریر' },
  { value: 'گل و گیاه', label: 'گل و گیاه' },
  { value: 'عکاسی و چاپ', label: 'عکاسی و چاپ' },
  { value: 'بازی فکری', label: 'بازی فکری' },
  { value: 'پوشاک و اکسسوری', label: 'پوشاک و اکسسوری' },
  { value: 'غذاهای خانگی', label: 'غذاهای خانگی' },
]

export const tableCountOptions: BoothOption[] = [
  { value: '1', label: '۱ میز' },
  { value: '2', label: '۲ میز' },
]
