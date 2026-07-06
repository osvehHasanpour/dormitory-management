import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./useAuth";
import { createAnnouncement } from "../services/announcementService";
import type { AnnouncementCreateFormValues } from "../types/announcement";

const announcementCreateSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان اطلاعیه الزامی است.")
    .max(200, "عنوان اطلاعیه نمی‌تواند بیش از ۲۰۰ کاراکتر باشد."),
  content: z.string().min(1, "متن اطلاعیه الزامی است."),
});

interface UseCreateAnnouncementResult {
  form: ReturnType<typeof useForm<AnnouncementCreateFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  submitAnnouncement: (values: AnnouncementCreateFormValues) => Promise<void>;
  clearMessages: () => void;
}

export function useCreateAnnouncement(): UseCreateAnnouncementResult {
  const navigate = useNavigate();
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(announcementCreateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
    mode: "onTouched",
  });

  const clearMessages = () => {
    setToastMessage(null);
  };

  const submitAnnouncement = async (values: AnnouncementCreateFormValues) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای ثبت اطلاعیه باید وارد سامانه شوید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAnnouncement(values, tokens.access);
      setToastMessage("اطلاعیه با موفقیت ثبت و ارسال شد");
      form.reset();
      window.setTimeout(() => {
        navigate("/supervisor/announcements", { replace: true });
      }, 900);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "ثبت اطلاعیه ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    toastMessage,
    submitAnnouncement,
    clearMessages,
  };
}
