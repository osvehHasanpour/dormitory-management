/** Gregorian calendar helpers for the custom date picker (no external deps). */

export const WEEKDAY_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

export interface CalendarCell {
  date: Date;
  day: number;
  inCurrentMonth: boolean;
}

export function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date | null | undefined): boolean {
  if (!b) {
    return false;
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Saturday-first index (ش=0 … ج=6) for RTL week row */
export function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Gregorian labels — used only inside the date picker UI */
export function formatGregorianMonthYearLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, 1));
}

/** Jalali display — used only after the user confirms a selection */
export function formatJalaliDateTimeLabel(datetimeLocal: string): string {
  const date = parseDatetimeLocal(datetimeLocal);
  if (!date) {
    return "";
  }

  const dateLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  const timeLabel = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${dateLabel}، ساعت ${timeLabel}`;
}

export function toDatetimeLocalValue(isoOrDate: string | Date): string {
  const date =
    typeof isoOrDate === "string" ? parseDatetimeLocal(isoOrDate) : isoOrDate;

  if (!date) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDatetimeLocal(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function combineDateAndTime(
  date: Date,
  hour: number,
  minute: number,
): Date {
  const next = dateOnly(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export function buildGregorianCalendarGrid(
  viewYear: number,
  viewMonth: number,
): CalendarCell[] {
  const firstOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const startOffset = getWeekdayIndex(firstOfMonth);
  const monthLength = getDaysInMonth(viewYear, viewMonth);

  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
  const prevMonthLength = getDaysInMonth(prevYear, prevMonth);

  const cells: CalendarCell[] = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthLength - i;
    cells.push({
      date: new Date(prevYear, prevMonth - 1, day),
      day,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= monthLength; day += 1) {
    cells.push({
      date: new Date(viewYear, viewMonth - 1, day),
      day,
      inCurrentMonth: true,
    });
  }

  let nextDay = 1;
  const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
  const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;

  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(nextYear, nextMonth - 1, nextDay),
      day: nextDay,
      inCurrentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}
