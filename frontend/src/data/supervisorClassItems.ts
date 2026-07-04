import type { SupervisorClassTabValue } from '../types/supervisorClass'

export interface SupervisorClassTab {
  value: SupervisorClassTabValue
  label: string
}

export const supervisorClassTabs: SupervisorClassTab[] = [
  { value: 'active', label: 'کلاس‌های فعال' },
  { value: 'all', label: 'همه کلاس‌ها' },
]

// Default category sent on create (form does not expose category selection).
export const DEFAULT_CLASS_CATEGORY = 'educational'

// Identical star rendering to the student-side ClassCard.
export function buildRatingStars(averageRating: number | null): string[] {
  const roundedValue = Math.max(0, Math.min(5, Math.round(averageRating ?? 0)))
  return Array.from({ length: 5 }, (_, index) => (index < roundedValue ? '★' : '☆'))
}

export function formatAverageRating(averageRating: number | null): string {
  return averageRating == null ? 'بدون امتیاز' : `${averageRating.toFixed(1)} از ۵`
}
