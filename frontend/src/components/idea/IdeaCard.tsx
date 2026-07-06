import { useEffect, useRef, useState } from 'react'

import type { IdeaFeedItem, IdeaVoteType } from '../../types/idea'
import { formatRelativeDate } from '../../utils/formatRelativeDate'

interface IdeaCardProps {
  idea: IdeaFeedItem
  isVoting: boolean
  onVote: (ideaId: number, voteType: IdeaVoteType) => void
}

interface VoteButtonProps {
  type: IdeaVoteType
  count: number
  isActive: boolean
  isVoting: boolean
  isPopping: boolean
  onClick: () => void
}

function LikeIcon({
  className = '',
  filled = false,
}: {
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 10.5V20M7.5 10.5L11.7 3.8C12.1 3.2 13.1 3.4 13.2 4.2L13.6 7.7C13.7 8.4 14.3 9 15 9H18.4C19.8 9 20.8 10.3 20.5 11.6L19.1 17.5C18.8 19 17.5 20 16 20H5.8C4.8 20 4 19.2 4 18.2V12.3C4 11.3 4.8 10.5 5.8 10.5H7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  )
}

function DislikeIcon({
  className = '',
  filled = false,
}: {
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16.5 13.5V4M16.5 13.5L12.3 20.2C11.9 20.8 10.9 20.6 10.8 19.8L10.4 16.3C10.3 15.6 9.7 15 9 15H5.6C4.2 15 3.2 13.7 3.5 12.4L4.9 6.5C5.2 5 6.5 4 8 4H18.2C19.2 4 20 4.8 20 5.8V11.7C20 12.7 19.2 13.5 18.2 13.5H16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  )
}

function VoteButton({
  type,
  count,
  isActive,
  isVoting,
  isPopping,
  onClick,
}: VoteButtonProps) {
  const label = type === 'up' ? 'پسندیدن ایده' : 'نپسندیدن ایده'
  const Icon = type === 'up' ? LikeIcon : DislikeIcon
  const popRotation = type === 'up' ? 'rotate-12' : 'rotate-[-12deg]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isVoting}
      aria-label={label}
      aria-pressed={isActive}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-body-md text-[#2E1145] transition-colors duration-500 ${
        isActive ? 'bg-primary/30' : 'bg-transparent hover:bg-primary/15'
      } ${isVoting ? 'cursor-not-allowed opacity-60' : 'active:bg-primary/25'}`}
    >
      <Icon
        className={`h-6 w-6 transition-transform duration-500 ease-out ${
          isPopping ? `scale-125 ${popRotation}` : 'scale-100 rotate-0'
        }`}
        filled={isActive}
      />
      <span>{count.toLocaleString('fa-IR')}</span>
    </button>
  )
}

export function IdeaCard({ idea, isVoting, onVote }: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [poppingVote, setPoppingVote] = useState<IdeaVoteType | null>(null)
  const popTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (popTimeoutRef.current !== null) {
        window.clearTimeout(popTimeoutRef.current)
      }
    }
  }, [])

  const triggerVote = (voteType: IdeaVoteType) => {
    if (isVoting) {
      return
    }

    setPoppingVote(voteType)
    if (popTimeoutRef.current !== null) {
      window.clearTimeout(popTimeoutRef.current)
    }
    popTimeoutRef.current = window.setTimeout(() => {
      setPoppingVote(null)
    }, 500)

    onVote(idea.id, voteType)
  }

  const relativeDate = idea.created_at ? formatRelativeDate(idea.created_at) : ''

  return (
    <article className="glass-card overflow-hidden p-4 text-right">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="min-w-0 flex-1 text-right"
          aria-expanded={isExpanded}
        >
          <span className="block text-heading-md text-ink">{idea.title}</span>
          <span className="mt-1 block line-clamp-2 text-body-sm text-body-text">
            {idea.description}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-card text-heading-lg text-ink transition-transform duration-500 ease-out"
          aria-label={isExpanded ? 'بستن جزئیات ایده' : 'نمایش جزئیات ایده'}
        >
          <span
            aria-hidden="true"
            className={`transition-transform duration-500 ease-out ${
              isExpanded ? 'rotate-90' : '-rotate-90'
            }`}
          >
            ‹
          </span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isExpanded ? (
          <>
            <VoteButton
              type="up"
              count={idea.likes_count}
              isActive={idea.user_vote === 'up'}
              isVoting={isVoting}
              isPopping={poppingVote === 'up'}
              onClick={() => triggerVote('up')}
            />
            <VoteButton
              type="down"
              count={idea.dislikes_count}
              isActive={idea.user_vote === 'down'}
              isVoting={isVoting}
              isPopping={poppingVote === 'down'}
              onClick={() => triggerVote('down')}
            />
          </>
        ) : null}
        {relativeDate ? (
          <span className="mr-auto text-caption-sm text-mute">{relativeDate}</span>
        ) : null}
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="whitespace-pre-line text-body-md text-body-text">{idea.description}</p>
            {(idea.category_display || relativeDate) ? (
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-caption-md text-mute">
                {idea.category_display ? <span>دسته‌بندی: {idea.category_display}</span> : null}
                {relativeDate ? <span>زمان ثبت: {relativeDate}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
