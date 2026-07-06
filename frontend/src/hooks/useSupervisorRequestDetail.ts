import { useCallback, useEffect, useState } from "react";

import { fetchSupervisorRequestDetail } from "../services/requestService";
import { useAuth } from "./useAuth";
import type { RequestType, StudentRequestDetail } from "../types/request";

interface UseSupervisorRequestDetailResult {
  detail: StudentRequestDetail | null;
  preview: StudentRequestDetail | null;
  isLoading: boolean;
  error: string | null;
  selectedId: number | null;
  openDetail: (item: StudentRequestDetail) => void;
  closeDetail: () => void;
  retry: () => void;
  setDetail: (item: StudentRequestDetail) => void;
}

export function useSupervisorRequestDetail(): UseSupervisorRequestDetailResult {
  const { tokens, isAuthenticated } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [preview, setPreview] = useState<StudentRequestDetail | null>(null);
  const [detail, setDetail] = useState<StudentRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setSelectedType(null);
    setPreview(null);
    setDetail(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const openDetail = useCallback((item: StudentRequestDetail) => {
    setSelectedId(item.id);
    setSelectedType(item.request_type);
    setPreview(item);
    setDetail(null);
    setError(null);
    setIsLoading(true);
  }, []);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (selectedId === null || selectedType === null) {
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

    void fetchSupervisorRequestDetail(tokens.access, selectedType, selectedId)
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
  }, [isAuthenticated, reloadKey, selectedId, selectedType, tokens?.access]);

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
