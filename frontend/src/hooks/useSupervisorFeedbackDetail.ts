import { useCallback, useEffect, useState } from "react";

import { fetchSupervisorFeedbackDetail } from "../services/supervisorFeedbackService";
import { useAuth } from "./useAuth";
import type { SupervisorFeedbackItem } from "../types/supervisorFeedback";

interface UseSupervisorFeedbackDetailResult {
  detail: SupervisorFeedbackItem | null;
  preview: SupervisorFeedbackItem | null;
  isLoading: boolean;
  error: string | null;
  selectedId: number | null;
  openDetail: (item: SupervisorFeedbackItem) => void;
  closeDetail: () => void;
  retry: () => void;
  setDetail: (item: SupervisorFeedbackItem) => void;
}

export function useSupervisorFeedbackDetail(): UseSupervisorFeedbackDetailResult {
  const { tokens, isAuthenticated } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [preview, setPreview] = useState<SupervisorFeedbackItem | null>(null);
  const [detail, setDetail] = useState<SupervisorFeedbackItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setPreview(null);
    setDetail(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const openDetail = useCallback((item: SupervisorFeedbackItem) => {
    setSelectedId(item.id);
    setPreview(item);
    setDetail(null);
    setError(null);
    setIsLoading(true);
  }, []);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      return undefined;
    }

    if (!isAuthenticated || !tokens?.access) {
      setError("برای مشاهده جزئیات باید وارد سامانه شوید.");
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetchSupervisorFeedbackDetail(tokens.access, selectedId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "دریافت جزئیات ناموفق بود. لطفاً دوباره تلاش کنید.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reloadKey, selectedId, tokens?.access]);

  return {
    detail,
    preview,
    isLoading,
    error,
    selectedId,
    openDetail,
    closeDetail,
    retry,
    setDetail,
  };
}
