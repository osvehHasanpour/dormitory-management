import { useMemo, useState } from 'react'

import { AnnouncementIcon } from './AnnouncementIcon'
import type { AnnouncementListItem } from '../../types/announcement'
import { formatAbsoluteDate, formatPersianDateShort } from '../../utils/formatRelativeDate'

interface AnnouncementCardProps {
  announcement: AnnouncementListItem
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const previewText = useMemo(() => {
    const normalized = announcement.content.replace(/\s+/g, ' ').trim()
    if (normalized.length <= 100) {
      return normalized
    }
    return `${normalized.slice(0, 100).trim()}...`
  }, [announcement.content])

  return (
    <article className="glass-card overflow-hidden rounded-md border border-hairline p-4 text-right shadow-elevated">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className="w-full text-right"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-card text-ink">
              <AnnouncementIcon className="h-6 w-6 text-mute" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-heading-md text-ink">{announcement.title}</span>
              <span className="mt-1 block line-clamp-2 text-body-sm text-body-text">{previewText}</span>
            </span>
          </div>

          <span className="flex shrink-0 items-center gap-2">
            <span className="text-caption-sm text-mute">
              {formatPersianDateShort(announcement.created_at)}
            </span>
            <span
              aria-hidden="true"
              className={`text-heading-lg text-mute transition-transform duration-500 ease-out ${
                isExpanded ? 'rotate-90' : '-rotate-90'
              }`}
            >
              ‹
            </span>
          </span>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="whitespace-pre-line text-body-md text-body-text">{announcement.content}</p>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-caption-md text-mute">
              <span>تاریخ انتشار: {formatAbsoluteDate(announcement.created_at)}</span>
              <span>منتشرکننده: {announcement.created_by.display_name}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
