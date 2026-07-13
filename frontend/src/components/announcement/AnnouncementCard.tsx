import { useMemo } from "react";

import type { AnnouncementListItem } from "../../types/announcement";
import {
  formatAbsoluteDate,
  formatPersianDateShort,
} from "../../utils/formatRelativeDate";

interface AnnouncementCardProps {
  announcement: AnnouncementListItem;
  isExpanded: boolean;
  anyExpanded: boolean;
  onToggle: () => void;
}

function SpeakerFilledIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M11.3 5.5C11.8 5.1 12.6 5.5 12.6 6.2V17.8C12.6 18.5 11.8 18.9 11.3 18.5L8.4 16.2H5.7C4.8 16.2 4 15.5 4 14.5V9.5C4 8.5 4.8 7.8 5.7 7.8H8.4L11.3 5.5Z"
        fill="currentColor"
      />
      <path
        d="M16 8.3C17.2 9.2 18 10.6 18 12C18 13.4 17.2 14.8 16 15.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.1 6.1C19.9 7.6 21 9.7 21 12C21 14.3 19.9 16.4 18.1 17.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7 10L12 15L17 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnnouncementCard({
  announcement,
  isExpanded,
  anyExpanded,
  onToggle,
}: AnnouncementCardProps) {
  const previewText = useMemo(() => {
    const normalized = announcement.content.replace(/\s+/g, " ").trim();
    if (normalized.length <= 100) {
      return normalized;
    }
    return `${normalized.slice(0, 100).trim()}...`;
  }, [announcement.content]);

  const articleClassName = [
    "glass-card flex w-full flex-col overflow-hidden rounded-md border border-hairline p-4 text-right shadow-elevated",
    isExpanded ? "self-start" : "",
    !isExpanded && anyExpanded ? "self-start min-h-[9.5rem]" : "",
    !isExpanded && !anyExpanded ? "h-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClassName}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full shrink-0 text-right"
      >
        <div className="flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-card text-ink">
              <SpeakerFilledIcon className="h-7 w-7 text-ink" />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block break-words text-heading-md text-ink ${
                  isExpanded ? "" : "line-clamp-2"
                }`}
              >
                {announcement.title}
              </span>
              <span className="mt-1 block line-clamp-2 break-words text-body-sm text-body-text">
                {previewText}
              </span>
            </span>
          </div>

          <span className="flex shrink-0 items-center justify-between gap-2 min-[480px]:flex-col min-[480px]:items-end">
            <span className="text-caption-sm text-mute">
              {formatPersianDateShort(announcement.created_at)}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 text-mute transition-transform duration-500 ease-out ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </span>
        </div>
      </button>

      {!isExpanded && !anyExpanded ? (
        <div className="min-h-0 flex-1" aria-hidden="true" />
      ) : null}

      <div
        className={`grid shrink-0 transition-[grid-template-rows] duration-500 ease-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="whitespace-pre-line text-body-md text-body-text">
              {announcement.content}
            </p>
            <p className="mt-4 text-caption-md text-mute">
              تاریخ انتشار: {formatAbsoluteDate(announcement.created_at)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
