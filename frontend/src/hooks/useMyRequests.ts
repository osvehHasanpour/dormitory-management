import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import { fetchMyRequests } from "../services/requestService";
import type {
  RequestFilterValue,
  StudentRequestListItem,
} from "../types/request";
import { sortRequestsOpenFirst } from "../utils/requestHelpers";

interface UseMyRequestsResult {
  requests: StudentRequestListItem[];
  isLoading: boolean;
  error: string | null;
  activeFilter: RequestFilterValue;
  setActiveFilter: (filter: RequestFilterValue) => void;
  retry: () => void;
}

export function useMyRequests(): UseMyRequestsResult {
  const { tokens, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<StudentRequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RequestFilterValue>("all");
  const [reloadKey, setReloadKey] = useState(0);

  const loadRequests = useCallback(async () => {
    if (!isAuthenticated || !tokens?.access) {
      setError("برای مشاهده درخواست‌ها باید وارد سامانه شوید.");
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestType = activeFilter === "all" ? undefined : activeFilter;
      const data = await fetchMyRequests(tokens.access, requestType);
      setRequests(sortRequestsOpenFirst(data.results ?? []));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت درخواست‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, isAuthenticated, tokens?.access]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const sortedRequests = useMemo(
    () => sortRequestsOpenFirst(requests),
    [requests],
  );

  return {
    requests: sortedRequests,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    retry,
  };
}
