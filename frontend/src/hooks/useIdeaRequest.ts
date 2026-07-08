import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./useAuth";
import { submitIdeaRequest } from "../services/ideaService";
import type { IdeaRequestFormValues } from "../types/idea";

const ideaRequestSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان ایده الزامی است.")
    .max(200, "عنوان ایده نمی‌تواند بیش از ۲۰۰ کاراکتر باشد."),
  description: z
    .string()
    .min(10, "شرح ایده باید حداقل ۱۰ کاراکتر باشد.")
    .max(1000, "شرح ایده نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد."),
});

interface UseIdeaRequestResult {
  form: ReturnType<typeof useForm<IdeaRequestFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  submitRequest: (values: IdeaRequestFormValues) => Promise<void>;
  clearMessages: () => void;
}

export function useIdeaRequest(): UseIdeaRequestResult {
  const navigate = useNavigate();
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<IdeaRequestFormValues>({
    resolver: zodResolver(ideaRequestSchema),
    defaultValues: {
      title: "",
      description: "",
    },
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

  const submitRequest = async (values: IdeaRequestFormValues) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای ثبت ایده باید وارد سامانه شوید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitIdeaRequest(values, tokens.access);
      setToastMessage("ایده شما با موفقیت ثبت شد.");
      form.reset();
      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "ثبت ایده ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    toastMessage,
    submitRequest,
    clearMessages,
  };
}
