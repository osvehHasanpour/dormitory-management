const persianTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function parseTimeToDate(time: string): Date | null {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatPersianTime(time: string | null | undefined): string {
  if (!time) {
    return "—";
  }

  const date = parseTimeToDate(time);
  if (!date) {
    return "—";
  }

  return persianTimeFormatter.format(date);
}

export function formatClassSchedule(
  dayOfWeekDisplay: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  const day = dayOfWeekDisplay?.trim();
  const start = formatPersianTime(startTime);
  const end = formatPersianTime(endTime);

  if (!day && start === "—" && end === "—") {
    return "—";
  }

  if (day && start !== "—" && end !== "—") {
    return `${day}، ${start} تا ${end}`;
  }

  if (day) {
    return day;
  }

  if (start !== "—" && end !== "—") {
    return `${start} تا ${end}`;
  }

  return start !== "—" ? start : end;
}

export function toTimeInputValue(time: string | null | undefined): string {
  if (!time) {
    return "";
  }

  const parts = time.split(":");
  if (parts.length < 2) {
    return "";
  }

  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
}
