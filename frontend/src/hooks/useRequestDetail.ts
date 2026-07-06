import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { fetchRequestDetail } from "../services/requestService";
import type {
  StudentRequestDetail,
  StudentRequestListItem,
} from "../types/request";

interface UseRequestDetailResult {
  detail: StudentRequestDetail | null;
  preview: StudentRequestListItem | null;
  isLoading: boolean;
  error: string | null;
  selectedId: number | null;
  openDetail: (request: StudentRequestListItem) => void;
  closeDetail: () => void;
  retry: () => void;
}

export function useRequestDetail(): UseRequestDetailResult {
  const { tokens, isAuthenticated } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [preview, setPreview] = useState<StudentRequestListItem | null>(null);
  const [detail, setDetail] = useState<StudentRequestDetail | null>(null);
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

  const openDetail = useCallback((request: StudentRequestListItem) => {
    setSelectedId(request.id);
    setPreview(request);
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

    void fetchRequestDetail(tokens.access, selectedId)
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
              : "دریافت جزئیات درخواست ناموفق بود. لطفاً دوباره تلاش کنید.",
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
  };
}
