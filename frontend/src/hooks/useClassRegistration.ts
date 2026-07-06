import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import {
  cancelClassRegistration,
  fetchActiveClasses,
  fetchMyClasses,
  fetchMyEndedClasses,
  registerClass,
  submitClassRating,
} from "../services/classService";
import type {
  ClassRatingPayload,
  ClassesTabValue,
  StudentClassItem,
} from "../types/class";

type ActionType = "register" | "cancel" | "rate";

interface PendingAction {
  type: ActionType;
  classId: number;
}

interface ClassesByTab {
  active: StudentClassItem[];
  enrolled: StudentClassItem[];
  ended: StudentClassItem[];
}

interface LoadingByTab {
  active: boolean;
  enrolled: boolean;
  ended: boolean;
}

interface ErrorByTab {
  active: string | null;
  enrolled: string | null;
  ended: string | null;
}

interface LoadedByTab {
  active: boolean;
  enrolled: boolean;
  ended: boolean;
}

interface UseClassRegistrationResult {
  activeTab: ClassesTabValue;
  setActiveTab: (tab: ClassesTabValue) => void;
  classes: StudentClassItem[];
  isLoading: boolean;
  error: string | null;
  feedbackMessage: string | null;
  retry: () => void;
  clearFeedback: () => void;
  registerInClass: (classId: number) => Promise<boolean>;
  cancelEnrollment: (classId: number) => Promise<boolean>;
  submitRatingForClass: (
    classId: number,
    payload: ClassRatingPayload,
  ) => Promise<boolean>;
  isActionPending: (type: ActionType, classId: number) => boolean;
}

const INITIAL_CLASSES: ClassesByTab = {
  active: [],
  enrolled: [],
  ended: [],
};

const INITIAL_LOADING: LoadingByTab = {
  active: false,
  enrolled: false,
  ended: false,
};

const INITIAL_ERRORS: ErrorByTab = {
  active: null,
  enrolled: null,
  ended: null,
};

const INITIAL_LOADED: LoadedByTab = {
  active: false,
  enrolled: false,
  ended: false,
};

export function useClassRegistration(): UseClassRegistrationResult {
  const { tokens, isAuthenticated } = useAuth();
  const [activeTab, setActiveTabState] = useState<ClassesTabValue>("active");
  const [classesByTab, setClassesByTab] =
    useState<ClassesByTab>(INITIAL_CLASSES);
  const [loadingByTab, setLoadingByTab] =
    useState<LoadingByTab>(INITIAL_LOADING);
  const [errorsByTab, setErrorsByTab] = useState<ErrorByTab>(INITIAL_ERRORS);
  const [loadedByTab, setLoadedByTab] = useState<LoadedByTab>(INITIAL_LOADED);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadTabData = useCallback(
    async (tab: ClassesTabValue, force = false) => {
      if (!isAuthenticated || !tokens?.access) {
        const authError = "برای مشاهده کلاس‌ها باید وارد سامانه شوید.";
        setErrorsByTab((previous) => ({ ...previous, [tab]: authError }));
        setClassesByTab((previous) => ({ ...previous, [tab]: [] }));
        setLoadingByTab((previous) => ({ ...previous, [tab]: false }));
        setLoadedByTab((previous) => ({ ...previous, [tab]: true }));
        return;
      }

      if (!force && loadedByTab[tab]) {
        return;
      }

      setLoadingByTab((previous) => ({ ...previous, [tab]: true }));
      setErrorsByTab((previous) => ({ ...previous, [tab]: null }));

      try {
        const data =
          tab === "active"
            ? await fetchActiveClasses(tokens.access)
            : tab === "enrolled"
              ? await fetchMyClasses(tokens.access)
              : await fetchMyEndedClasses(tokens.access);

        setClassesByTab((previous) => ({
          ...previous,
          [tab]: data.results ?? [],
        }));
        setLoadedByTab((previous) => ({ ...previous, [tab]: true }));
      } catch (loadError) {
        setErrorsByTab((previous) => ({
          ...previous,
          [tab]:
            loadError instanceof Error
              ? loadError.message
              : "دریافت اطلاعات کلاس‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
        }));
        setLoadedByTab((previous) => ({ ...previous, [tab]: false }));
      } finally {
        setLoadingByTab((previous) => ({ ...previous, [tab]: false }));
      }
    },
    [isAuthenticated, loadedByTab, tokens?.access],
  );

  useEffect(() => {
    void loadTabData(activeTab);
  }, [activeTab, loadTabData]);

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

  const runAction = useCallback(
    async (
      type: ActionType,
      classId: number,
      callback: () => Promise<void>,
      successMessage: string,
    ): Promise<boolean> => {
      if (!isAuthenticated || !tokens?.access) {
        setFeedbackMessage("برای انجام این عملیات باید وارد سامانه شوید.");
        return false;
      }

      if (pendingAction) {
        return false;
      }

      setPendingAction({ type, classId });
      setFeedbackMessage(null);

      try {
        await callback();
        setFeedbackMessage(successMessage);
        return true;
      } catch (actionError) {
        setFeedbackMessage(
          actionError instanceof Error
            ? actionError.message
            : "انجام عملیات ناموفق بود. لطفاً دوباره تلاش کنید.",
        );
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [isAuthenticated, pendingAction, tokens?.access],
  );

  const registerInClass = useCallback(
    async (classId: number): Promise<boolean> =>
      runAction(
        "register",
        classId,
        async () => {
          if (!tokens?.access) {
            throw new Error("برای انجام این عملیات باید وارد سامانه شوید.");
          }

          await registerClass(tokens.access, classId);
          await Promise.all([
            loadTabData("active", true),
            loadTabData("enrolled", true),
          ]);
        },
        "ثبت‌نام با موفقیت انجام شد.",
      ),
    [loadTabData, runAction, tokens?.access],
  );

  const cancelEnrollment = useCallback(
    async (classId: number): Promise<boolean> =>
      runAction(
        "cancel",
        classId,
        async () => {
          if (!tokens?.access) {
            throw new Error("برای انجام این عملیات باید وارد سامانه شوید.");
          }

          await cancelClassRegistration(tokens.access, classId);
          await Promise.all([
            loadTabData("active", true),
            loadTabData("enrolled", true),
          ]);
        },
        "ثبت‌نام کلاس با موفقیت لغو شد.",
      ),
    [loadTabData, runAction, tokens?.access],
  );

  const submitRatingForClass = useCallback(
    async (classId: number, payload: ClassRatingPayload): Promise<boolean> =>
      runAction(
        "rate",
        classId,
        async () => {
          if (!tokens?.access) {
            throw new Error("برای انجام این عملیات باید وارد سامانه شوید.");
          }

          await submitClassRating(tokens.access, classId, payload);
          await loadTabData("ended", true);
        },
        "امتیاز شما با موفقیت ثبت شد.",
      ),
    [loadTabData, runAction, tokens?.access],
  );

  const retry = useCallback(() => {
    void loadTabData(activeTab, true);
  }, [activeTab, loadTabData]);

  const setActiveTab = useCallback((tab: ClassesTabValue) => {
    setActiveTabState(tab);
  }, []);

  const isActionPending = useCallback(
    (type: ActionType, classId: number) =>
      pendingAction?.type === type && pendingAction.classId === classId,
    [pendingAction],
  );

  const classes = useMemo(
    () => classesByTab[activeTab],
    [activeTab, classesByTab],
  );

  return {
    activeTab,
    setActiveTab,
    classes,
    isLoading: loadingByTab[activeTab],
    error: errorsByTab[activeTab],
    feedbackMessage,
    retry,
    clearFeedback: () => setFeedbackMessage(null),
    registerInClass,
    cancelEnrollment,
    submitRatingForClass,
    isActionPending,
  };
}
