import { useCallback, useEffect, useState } from 'react'

import { useAuth } from './useAuth'
import { fetchIdeas, voteIdea } from '../services/ideaService'
import type { IdeaFeedItem, IdeaOrdering, IdeaVoteType } from '../types/idea'

interface UseIdeasFeedResult {
  ideas: IdeaFeedItem[]
  isLoading: boolean
  error: string | null
  ordering: IdeaOrdering
  setOrdering: (ordering: IdeaOrdering) => void
  votingIds: Set<number>
  retry: () => void
  vote: (ideaId: number, voteType: IdeaVoteType) => Promise<void>
}

export function useIdeasFeed(): UseIdeasFeedResult {
  const { tokens, isAuthenticated } = useAuth()
  const accessToken = tokens?.access
  const [ideas, setIdeas] = useState<IdeaFeedItem[]>([])
  const [ordering, setOrdering] = useState<IdeaOrdering>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingIds, setVotingIds] = useState<Set<number>>(() => new Set())
  const [reloadKey, setReloadKey] = useState(0)

  const loadIdeas = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError('برای مشاهده ایده‌ها باید وارد سامانه شوید.')
      setIdeas([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchIdeas(accessToken, ordering)
      setIdeas(data.results ?? [])
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'دریافت ایده‌ها ناموفق بود. لطفاً دوباره تلاش کنید.',
      )
      setIdeas([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, isAuthenticated, ordering])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIdeas()
  }, [loadIdeas, reloadKey])

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const vote = useCallback(
    async (ideaId: number, voteType: IdeaVoteType) => {
      if (!isAuthenticated || !accessToken) {
        setError('برای ثبت رأی باید وارد سامانه شوید.')
        return
      }

      if (votingIds.has(ideaId)) {
        return
      }

      setError(null)
      setVotingIds((current) => {
        const next = new Set(current)
        next.add(ideaId)
        return next
      })

      try {
        const updatedIdea = await voteIdea(ideaId, voteType, accessToken)
        setIdeas((current) =>
          current.map((idea) => (idea.id === updatedIdea.id ? { ...idea, ...updatedIdea } : idea)),
        )
      } catch (voteError) {
        setError(
          voteError instanceof Error
            ? voteError.message
            : 'ثبت رأی ناموفق بود. لطفاً دوباره تلاش کنید.',
        )
      } finally {
        setVotingIds((current) => {
          const next = new Set(current)
          next.delete(ideaId)
          return next
        })
      }
    },
    [accessToken, isAuthenticated, votingIds],
  )

  return {
    ideas,
    isLoading,
    error,
    ordering,
    setOrdering,
    votingIds,
    retry,
    vote,
  }
}
