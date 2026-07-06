import { useCallback, useEffect, useState } from 'react'

import { feedbackFilterTabs } from '../data/supervisorFeedbackItems'
import { fetchSupervisorFeedback } from '../services/supervisorFeedbackService'
import { useAuth } from './useAuth'
import type {
  FeedbackFilterValue,
  SupervisorFeedbackItem,
} from '../types/supervisorFeedback'

interface UseSupervisorFeedbackFeedResult {
  items: SupervisorFeedbackItem[]
  isLoading: boolean
  error: string | null
  activeFilter: FeedbackFilterValue
  setActiveFilter: (filter: FeedbackFilterValue) => void
  retry: () => void
  refresh: () => void
  updateItem: (item: SupervisorFeedbackItem) => void
}

function getApiTypeForFilter(filter: FeedbackFilterValue): 'complaint' | 'suggestion' | undefined {
  const tab = feedbackFilterTabs.find((entry) => entry.value === filter)
  return tab?.apiType
}

export function useSupervisorFeedbackFeed(): UseSupervisorFeedbackFeedResult {
  const { tokens, isAuthenticated } = useAuth()
  const accessToken = tokens?.access
  const [items, setItems] = useState<SupervisorFeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FeedbackFilterValue>('all')
  const [reloadKey, setReloadKey] = useState(0)

  const loadItems = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError('برای مشاهده لیست باید وارد سامانه شوید.')
      setItems([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiType = getApiTypeForFilter(activeFilter)
      const data = await fetchSupervisorFeedback(accessToken, apiType ? { type: apiType } : undefined)
      setItems(data.results ?? [])
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'دریافت لیست ناموفق بود. لطفاً دوباره تلاش کنید.',
      )
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, activeFilter, isAuthenticated])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems()
  }, [loadItems, reloadKey])

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const refresh = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const updateItem = useCallback((item: SupervisorFeedbackItem) => {
    setItems((current) => {
      const apiType = getApiTypeForFilter(activeFilter)
      const matchesFilter =
        activeFilter === 'all' || (apiType != null && item.type === apiType)

      if (!matchesFilter) {
        return current.filter((entry) => entry.id !== item.id)
      }

      const exists = current.some((entry) => entry.id === item.id)
      if (!exists) {
        return [item, ...current]
      }

      return current.map((entry) => (entry.id === item.id ? item : entry))
    })
  }, [activeFilter])

  return {
    items,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    retry,
    refresh,
    updateItem,
  }
}
