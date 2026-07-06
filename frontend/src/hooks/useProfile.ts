import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { getProfile } from "../services/authService";
import type { ApiUserProfile } from "../types/auth";

interface UseProfileResult {
  profile: ApiUserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { tokens, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated || !tokens?.access) {
      setError("برای مشاهده پروفایل باید وارد سامانه شوید.");
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProfile(tokens.access);
      setProfile(data);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "دریافت پروفایل ناموفق بود.";
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, tokens?.access]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { profile, isLoading, error, refetch };
}
