import { useCallback, useEffect, useState } from "react";

import { fetchSupervisorRequestsGraphql } from "../services/supervisorRequestGraphqlService";
import { supervisorRequestTabs } from "../data/supervisorRequestItems";
import { useAuth } from "./useAuth";
import type { RequestType, StudentRequestDetail } from "../types/request";

interface UseSupervisorRequestsFeedResult {
  items: StudentRequestDetail[];
  isLoading: boolean;
  error: string | null;
  activeType: RequestType;
  setActiveType: (type: RequestType) => void;
  retry: () => void;
  updateItem: (item: StudentRequestDetail) => void;
}

const DEFAULT_TYPE = supervisorRequestTabs[0].value;

export function useSupervisorRequestsFeed(): UseSupervisorRequestsFeedResult {
  const { tokens, isAuthenticated } = useAuth();
  const accessToken = tokens?.access;
  const [items, setItems] = useState<StudentRequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<RequestType>(DEFAULT_TYPE);
  const [reloadKey, setReloadKey] = useState(0);

  const loadItems = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError("برای مشاهده درخواست‌ها باید وارد سامانه شوید.");
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSupervisorRequestsGraphql(accessToken, {
        requestType: activeType,
      });
      setItems(data.results ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت درخواست‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, activeType, isAuthenticated]);

  useEffect(() => {
    void loadItems();
  }, [loadItems, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const updateItem = useCallback((item: StudentRequestDetail) => {
    setItems((current) =>
      current.map((entry) => (entry.id === item.id ? item : entry)),
    );
  }, []);

  return {
    items,
    isLoading,
    error,
    activeType,
    setActiveType,
    retry,
    updateItem,
  };
}
