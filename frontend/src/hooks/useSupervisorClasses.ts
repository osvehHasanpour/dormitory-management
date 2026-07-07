import { useCallback, useEffect, useMemo, useState } from "react";

import {
  cancelSupervisorClass,
  fetchSupervisorClasses,
} from "../services/supervisorClassService";
import { useAuth } from "./useAuth";
import type {
  SupervisorClassItem,
  SupervisorClassTabValue,
} from "../types/supervisorClass";

interface UseSupervisorClassesResult {
  items: SupervisorClassItem[];
  isLoading: boolean;
  error: string | null;
  activeTab: SupervisorClassTabValue;
  setActiveTab: (tab: SupervisorClassTabValue) => void;
  retry: () => void;
  refresh: () => void;
  feedbackMessage: string | null;
  setFeedback: (message: string) => void;
  clearFeedback: () => void;
  cancelClass: (classId: number) => Promise<boolean>;
  cancellingId: number | null;
}

export function useSupervisorClasses(): UseSupervisorClassesResult {
  const { tokens, isAuthenticated } = useAuth();
  const accessToken = tokens?.access;
  const [allItems, setAllItems] = useState<SupervisorClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SupervisorClassTabValue>("active");
  const [reloadKey, setReloadKey] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError("برای مشاهده کلاس‌ها باید وارد سامانه شوید.");
      setAllItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSupervisorClasses(accessToken);
      setAllItems(data.results ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت کلاس‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  const items = useMemo(() => {
    const now = Date.now();

    return allItems.filter((classItem) => {
      const endTime = new Date(classItem.end_datetime).getTime();
      const hasEnded = Number.isFinite(endTime) && endTime <= now;

      return activeTab === "finished" ? hasEnded : !hasEnded;
    });
  }, [allItems, activeTab]);

  useEffect(() => {
    void loadItems();
  }, [loadItems, reloadKey]);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedbackMessage]);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const refresh = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null);
  }, []);

  const setFeedback = useCallback((message: string) => {
    setFeedbackMessage(message);
  }, []);

  const cancelClass = useCallback(
    async (classId: number): Promise<boolean> => {
      if (!isAuthenticated || !accessToken) {
        setFeedbackMessage("برای انجام این عملیات باید وارد سامانه شوید.");
        return false;
      }

      if (cancellingId !== null) {
        return false;
      }

      setCancellingId(classId);
      setFeedbackMessage(null);

      try {
        await cancelSupervisorClass(accessToken, classId);
        setFeedbackMessage("کلاس با موفقیت حذف شد.");
        setReloadKey((value) => value + 1);
        return true;
      } catch (cancelError) {
        setFeedbackMessage(
          cancelError instanceof Error
            ? cancelError.message
            : "حذف کلاس ناموفق بود. لطفاً دوباره تلاش کنید.",
        );
        return false;
      } finally {
        setCancellingId(null);
      }
    },
    [accessToken, cancellingId, isAuthenticated],
  );

  return {
    items,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    retry,
    refresh,
    feedbackMessage,
    setFeedback,
    clearFeedback,
    cancelClass,
    cancellingId,
  };
}
