import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  markFeedbackReviewed,
  rejectFeedback,
  respondToFeedback,
  reviewIdea,
} from "../services/supervisorFeedbackService";
import { useAuth } from "./useAuth";
import type {
  FeedbackResponseFormValues,
  FeedbackStatusAction,
  SupervisorFeedbackItem,
} from "../types/supervisorFeedback";

const responseSchema = z.object({
  response_text: z.string(),
});

interface UseSupervisorFeedbackResponseOptions {
  onSuccess: (item: SupervisorFeedbackItem) => void;
}

interface UseSupervisorFeedbackResponseResult {
  form: ReturnType<typeof useForm<FeedbackResponseFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  clearMessages: () => void;
  applyStatusAction: (
    item: SupervisorFeedbackItem,
    action: FeedbackStatusAction,
  ) => Promise<void>;
  approveIdea: (item: SupervisorFeedbackItem) => Promise<void>;
  rejectIdea: (item: SupervisorFeedbackItem) => Promise<void>;
}

export function useSupervisorFeedbackResponse({
  onSuccess,
}: UseSupervisorFeedbackResponseOptions): UseSupervisorFeedbackResponseResult {
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<FeedbackResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: { response_text: "" },
    mode: "onTouched",
  });

  const clearMessages = () => {
    setToastMessage(null);
  };

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  const ensureAuth = (): string | null => {
    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای انجام این عملیات باید وارد سامانه شوید.");
      return null;
    }
    return tokens.access;
  };

  const validateResponseText = (
    action: FeedbackStatusAction,
    text: string,
  ): boolean => {
    if (action === "reviewed") {
      return true;
    }

    if (!text.trim()) {
      setToastMessage(
        action === "rejected"
          ? "در صورت رد، ذکر دلیل الزامی است."
          : "متن پاسخ الزامی است.",
      );
      return false;
    }

    return true;
  };

  const applyStatusAction = async (
    item: SupervisorFeedbackItem,
    action: FeedbackStatusAction,
  ) => {
    clearMessages();

    const accessToken = ensureAuth();
    if (!accessToken) {
      return;
    }

    const responseText = form.getValues("response_text");

    if (!validateResponseText(action, responseText)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let updated: SupervisorFeedbackItem;

      if (action === "reviewed") {
        updated = await markFeedbackReviewed(accessToken, item.id);
        setToastMessage("وضعیت به «در حال بررسی» تغییر یافت.");
      } else if (action === "answered") {
        updated = await respondToFeedback(accessToken, item.id, responseText);
        setToastMessage("پاسخ با موفقیت ثبت شد.");
      } else {
        updated = await rejectFeedback(accessToken, item.id, responseText);
        setToastMessage("مورد با موفقیت رد شد.");
      }

      form.reset({ response_text: updated.response_text || "" });
      onSuccess(updated);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "عملیات ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveIdea = async (item: SupervisorFeedbackItem) => {
    clearMessages();

    const accessToken = ensureAuth();
    if (!accessToken) {
      return;
    }

    const responseText = form.getValues("response_text");
    setIsSubmitting(true);

    try {
      const updated = await reviewIdea(
        accessToken,
        item.id,
        "approve",
        responseText,
      );
      setToastMessage("ایده با موفقیت تأیید شد.");
      form.reset({ response_text: updated.response_text || "" });
      onSuccess(updated);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "تأیید ایده ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectIdea = async (item: SupervisorFeedbackItem) => {
    clearMessages();

    const accessToken = ensureAuth();
    if (!accessToken) {
      return;
    }

    const responseText = form.getValues("response_text");
    if (!responseText.trim()) {
      setToastMessage("در صورت رد ایده، ذکر دلیل الزامی است.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await reviewIdea(
        accessToken,
        item.id,
        "reject",
        responseText,
      );
      setToastMessage("ایده با موفقیت رد شد.");
      form.reset({ response_text: updated.response_text || "" });
      onSuccess(updated);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "رد ایده ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    toastMessage,
    clearMessages,
    applyStatusAction,
    approveIdea,
    rejectIdea,
  };
}
