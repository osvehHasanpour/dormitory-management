import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import { fetchMyComplaints } from "../services/complaintService";
import type { MyComplaintListItem } from "../types/complaint";

interface UseMyComplaintsResult {
  complaints: MyComplaintListItem[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

function sortComplaintsNewestFirst(
  complaints: MyComplaintListItem[],
): MyComplaintListItem[] {
  return [...complaints].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );
}

export function useMyComplaints(): UseMyComplaintsResult {
  const { tokens, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<MyComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadComplaints = useCallback(async () => {
    if (!isAuthenticated || !tokens?.access) {
      setError("برای مشاهده شکایات باید وارد سامانه شوید.");
      setComplaints([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMyComplaints(tokens.access);
      setComplaints(sortComplaintsNewestFirst(data.results ?? []));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت شکایات ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, tokens?.access]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const sortedComplaints = useMemo(
    () => sortComplaintsNewestFirst(complaints),
    [complaints],
  );

  return {
    complaints: sortedComplaints,
    isLoading,
    error,
    retry,
  };
}
