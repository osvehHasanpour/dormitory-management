import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { fetchAnnouncements } from "../services/announcementService";
import type { AnnouncementListItem } from "../types/announcement";

interface UseAnnouncementsFeedResult {
  announcements: AnnouncementListItem[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAnnouncementsFeed(): UseAnnouncementsFeedResult {
  const { tokens, isAuthenticated } = useAuth();
  const accessToken = tokens?.access;
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadAnnouncements = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError("برای مشاهده اطلاعیه‌ها باید وارد سامانه شوید.");
      setAnnouncements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAnnouncements(accessToken);
      setAnnouncements(data.results ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت اطلاعیه‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAnnouncements();
  }, [loadAnnouncements, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  return {
    announcements,
    isLoading,
    error,
    retry,
  };
}
