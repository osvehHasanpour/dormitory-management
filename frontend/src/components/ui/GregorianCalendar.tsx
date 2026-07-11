import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  WEEKDAY_SHORT,
  buildGregorianCalendarGrid,
  dateOnly,
  formatGregorianMonthYearLabel,
  isSameDay,
} from "../../utils/datePickerUtils";

interface GregorianCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function GregorianCalendar({
  selectedDate,
  onSelect,
}: GregorianCalendarProps) {
  const normalizedSelected = dateOnly(selectedDate);
  const selectedYear = normalizedSelected.getFullYear();
  const selectedMonth = normalizedSelected.getMonth() + 1;
  const selectedDay = normalizedSelected.getDate();

  const [viewYear, setViewYear] = useState(selectedYear);
  const [viewMonth, setViewMonth] = useState(selectedMonth);

  // Sync view only when the selected date actually changes — not on every render
  useEffect(() => {
    setViewYear(selectedYear);
    setViewMonth(selectedMonth);
  }, [selectedYear, selectedMonth, selectedDay]);

  const cells = useMemo(
    () => buildGregorianCalendarGrid(viewYear, viewMonth),
    [viewMonth, viewYear],
  );

  const today = dateOnly(new Date());

  const goToPreviousMonth = () => {
    if (viewMonth === 1) {
      setViewYear((year) => year - 1);
      setViewMonth(12);
      return;
    }

    setViewMonth((month) => month - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((year) => year + 1);
      setViewMonth(1);
      return;
    }

    setViewMonth((month) => month + 1);
  };

  return (
    <div className="px-3 py-2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="ماه بعد"
          onClick={goToNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-mute transition-colors hover:bg-primary/10 active:bg-primary/15"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="text-body-sm-strong text-ink">
          {formatGregorianMonthYearLabel(viewYear, viewMonth)}
        </p>

        <button
          type="button"
          aria-label="ماه قبل"
          onClick={goToPreviousMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-mute transition-colors hover:bg-primary/10 active:bg-primary/15"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_SHORT.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-caption-md text-mute"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const isSelected = isSameDay(cell.date, normalizedSelected);
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={`${cell.date.toISOString()}-${index}`}
              type="button"
              onClick={() => onSelect(dateOnly(cell.date))}
              className={`flex h-10 min-h-10 items-center justify-center rounded-full text-body-sm transition-colors ${
                isSelected
                  ? "bg-primary-deep font-bold text-on-primary"
                  : !cell.inCurrentMonth
                    ? "text-ash hover:bg-primary/10 active:bg-primary/15"
                    : isToday
                      ? "bg-primary/20 font-semibold text-ink hover:bg-primary/25"
                      : "text-body-text hover:bg-primary/10 active:bg-primary/15"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
