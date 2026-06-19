import { useCallback, useEffect, useState } from 'react'

import { useAuth } from './useAuth'
import { fetchProfile } from '../services/profileService'
import {
  mapApiProfileToStudentProfile,
  mapStudentProfileToFields,
  type ProfileInfoField,
  type StudentProfile,
} from '../types/profile'

interface UseProfileResult {
  profile: StudentProfile | null
  fields: ProfileInfoField[]
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useProfile(): UseProfileResult {
  const { tokens, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const accessToken = isAuthenticated ? tokens?.access : undefined
  const authError =
    !isAuthenticated || !accessToken ? 'برای مشاهده پروفایل باید وارد سامانه شوید.' : null

  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setProfile(null)
      setError(authError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiProfile = await fetchProfile(accessToken)
      setProfile(mapApiProfileToStudentProfile(apiProfile))
    } catch (loadError) {
      setProfile(null)
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'دریافت پروفایل ناموفق بود. لطفاً دوباره تلاش کنید.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, authError])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile, retryKey])

  const retry = () => {
    setRetryKey((key) => key + 1)
  }

  return {
    profile,
    fields: profile ? mapStudentProfileToFields(profile) : [],
    isLoading,
    error,
    retry,
  }
}
