import { Calendar, ChevronDown } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";

import {
  combineDateAndTime,
  dateOnly,
  formatJalaliDateTimeLabel,
  parseDatetimeLocal,
  toDatetimeLocalValue,
} from "../../utils/datePickerUtils";
import { FloatingPanel } from "./FloatingPanel";
import { GregorianCalendar } from "./GregorianCalendar";
import { ScrollTimeColumn } from "./ScrollTimeColumn";
import { selectTriggerClassName } from "./formStyles";

interface ResponsiveDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  elevated?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function ResponsiveDatePicker({
  value,
  onChange,
  onBlur,
  disabled = false,
  id,
  placeholder = "انتخاب تاریخ و ساعت",
  className = "",
  elevated = false,
}: ResponsiveDatePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const parsedDate = parseDatetimeLocal(value);
  const [draftDate, setDraftDate] = useState<Date>(() =>
    parsedDate ? dateOnly(parsedDate) : dateOnly(new Date()),
  );
  const [draftHour, setDraftHour] = useState(() => parsedDate?.getHours() ?? 9);
  const [draftMinute, setDraftMinute] = useState(
    () => parsedDate?.getMinutes() ?? 0,
  );

  const displayLabel = value ? formatJalaliDateTimeLabel(value) : placeholder;

  const syncDraftFromValue = useCallback(() => {
    const next = parseDatetimeLocal(value);
    if (next) {
      setDraftDate(dateOnly(next));
      setDraftHour(next.getHours());
      setDraftMinute(next.getMinutes());
      return;
    }

    const now = new Date();
    setDraftDate(dateOnly(now));
    setDraftHour(now.getHours());
    setDraftMinute(now.getMinutes());
  }, [value]);

  const close = useCallback(() => {
    setIsOpen(false);
    onBlur?.();
  }, [onBlur]);

  const handleOpen = () => {
    if (disabled) {
      return;
    }

    syncDraftFromValue();
    setIsOpen(true);
  };

  const applySelection = () => {
    const next = combineDateAndTime(draftDate, draftHour, draftMinute);
    onChange(toDatetimeLocalValue(next));
    close();
  };

  const hourOptions = useMemo(
    () =>
      HOURS.map((hour) => ({
        value: String(hour),
        label: `${pad(hour)}`,
      })),
    [],
  );

  const minuteOptions = useMemo(
    () =>
      MINUTES.map((minute) => ({
        value: String(minute),
        label: `${pad(minute)}`,
      })),
    [],
  );

  return (
    <div className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-label={placeholder}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleOpen}
        className={`${selectTriggerClassName} text-right ${
          !value ? "text-ash" : ""
        }`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-primary-deep" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-mute transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <FloatingPanel
        isOpen={isOpen}
        onClose={close}
        triggerRef={triggerRef}
        title="انتخاب تاریخ و ساعت"
        contentClassName="pb-2"
        elevated={elevated}
      >
        <GregorianCalendar
          selectedDate={draftDate}
          onSelect={setDraftDate}
        />

        <div className="border-t border-hairline/40 px-4 py-3">
          <p className="mb-2 text-body-sm-strong text-ink">ساعت</p>
          <div className="grid grid-cols-2 gap-3">
            <ScrollTimeColumn
              label="ساعت"
              value={draftHour}
              options={hourOptions.map((option) => ({
                value: Number(option.value),
                label: option.label,
              }))}
              onChange={setDraftHour}
            />
            <ScrollTimeColumn
              label="دقیقه"
              value={draftMinute}
              options={minuteOptions.map((option) => ({
                value: Number(option.value),
                label: option.label,
              }))}
              onChange={setDraftMinute}
            />
          </div>
        </div>

        <div className="border-t border-hairline/40 px-4 py-3">
          <button
            type="button"
            onClick={applySelection}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed active:bg-primary-pressed"
          >
            تأیید
          </button>
        </div>
      </FloatingPanel>
    </div>
  );
}
