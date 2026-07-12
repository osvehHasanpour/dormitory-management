import type { SupervisorClassTabValue } from "../types/supervisorClass";
import { formatEnglishNumber } from "../utils/formatNumber";

export interface SupervisorClassTab {
  value: SupervisorClassTabValue;
  label: string;
}

export const supervisorClassTabs: SupervisorClassTab[] = [
  { value: "active", label: "کلاس‌های فعال" },
  { value: "finished", label: "کلاس‌های پایان‌یافته" },
];

// Default category sent on create (form does not expose category selection).
export const DEFAULT_CLASS_CATEGORY = "educational";

export const PERSIAN_WEEKDAYS = [
  { value: "saturday", label: "شنبه" },
  { value: "sunday", label: "یکشنبه" },
  { value: "monday", label: "دوشنبه" },
  { value: "tuesday", label: "سه‌شنبه" },
  { value: "wednesday", label: "چهارشنبه" },
  { value: "thursday", label: "پنج‌شنبه" },
  { value: "friday", label: "جمعه" },
] as const;

// Identical star rendering to the student-side ClassCard.
export function buildRatingStars(averageRating: number | null): string[] {
  const roundedValue = Math.max(0, Math.min(5, Math.round(averageRating ?? 0)));
  return Array.from({ length: 5 }, (_, index) =>
    index < roundedValue ? "★" : "☆",
  );
}

export function formatAverageRating(averageRating: number | null): string {
  return averageRating == null
    ? "بدون امتیاز"
    : `${formatEnglishNumber(averageRating)} از 5`;
}
