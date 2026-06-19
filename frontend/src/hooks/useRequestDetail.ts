import { useCallback, useEffect, useState } from 'react'

import { useAuth } from './useAuth'
import { fetchRequestDetail } from '../services/requestService'
import type { StudentRequestDetail } from '../types/request'

interface UseRequestDetailResult {
  detail: StudentRequestDetail | null
  isLoading: boolean
  error: string | null
  selectedId: number | null
  openDetail: (requestId: number) => void
  closeDetail: () => void
  retry: () => void
}

export function useRequestDetail(): UseRequestDetailResult {
  const { tokens, isAuthenticated } = useAuth()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<StudentRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const closeDetail = useCallback(() => {
    setSelectedId(null)
    setDetail(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const openDetail = useCallback((requestId: number) => {
    setSelectedId(requestId)
    setDetail(null)
    setError(null)
  }, [])

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (selectedId === null) {
      return undefined
    }

    if (!isAuthenticated || !tokens?.access) {
      setError('برای مشاهده جزئیات باید وارد سامانه شوید.')
      return undefined
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    void fetchRequestDetail(tokens.access, selectedId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data)
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'دریافت جزئیات درخواست ناموفق بود. لطفاً دوباره تلاش کنید.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, reloadKey, selectedId, tokens?.access])

  return {
    detail,
    isLoading,
    error,
    selectedId,
    openDetail,
    closeDetail,
    retry,
  }
}
