import { ChevronDown, Clock3 } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";

import { formatPersianTime } from "../../utils/formatClassSchedule";
import { FloatingPanel } from "./FloatingPanel";
import { ScrollTimeColumn } from "./ScrollTimeColumn";
import { selectTriggerClassName } from "./formStyles";

interface ResponsiveTimePickerProps {
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

function parseTimeValue(value: string): { hour: number; minute: number } {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: 9, minute: 0 };
  }

  return { hour, minute };
}

export function ResponsiveTimePicker({
  value,
  onChange,
  onBlur,
  disabled = false,
  id,
  placeholder = "انتخاب ساعت",
  className = "",
  elevated = false,
}: ResponsiveTimePickerProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const parsed = parseTimeValue(value);
  const [draftHour, setDraftHour] = useState(parsed.hour);
  const [draftMinute, setDraftMinute] = useState(parsed.minute);

  const displayLabel = value ? formatPersianTime(value) : placeholder;

  const syncDraftFromValue = useCallback(() => {
    const next = parseTimeValue(value);
    setDraftHour(next.hour);
    setDraftMinute(next.minute);
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
    onChange(`${pad(draftHour)}:${pad(draftMinute)}`);
    close();
  };

  const hourOptions = useMemo(
    () =>
      HOURS.map((hour) => ({
        value: String(hour),
        label: pad(hour),
      })),
    [],
  );

  const minuteOptions = useMemo(
    () =>
      MINUTES.map((minute) => ({
        value: String(minute),
        label: pad(minute),
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
        <Clock3
          className="h-4 w-4 shrink-0 text-primary-deep"
          aria-hidden="true"
        />
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
        title="انتخاب ساعت"
        contentClassName="px-4 py-3"
        elevated={elevated}
      >
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

        <button
          type="button"
          onClick={applySelection}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed active:bg-primary-pressed"
        >
          تأیید
        </button>
      </FloatingPanel>
    </div>
  );
}
