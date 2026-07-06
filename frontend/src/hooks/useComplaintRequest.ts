import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./useAuth";
import { submitComplaintRequest } from "../services/complaintService";
import type { ComplaintRequestFormValues } from "../types/complaint";

const complaintRequestSchema = z.object({
  category: z.string().min(1, "انتخاب دسته‌بندی موضوع الزامی است."),
  title: z
    .string()
    .min(1, "عنوان شکایت الزامی است.")
    .max(200, "عنوان شکایت نمی‌تواند بیش از ۲۰۰ کاراکتر باشد."),
  description: z
    .string()
    .min(10, "شرح شکایت باید حداقل ۱۰ کاراکتر باشد.")
    .max(1000, "شرح شکایت نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد."),
});

interface UseComplaintRequestResult {
  form: ReturnType<typeof useForm<ComplaintRequestFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  submitRequest: (values: ComplaintRequestFormValues) => Promise<void>;
  clearMessages: () => void;
}

export function useComplaintRequest(): UseComplaintRequestResult {
  const navigate = useNavigate();
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<ComplaintRequestFormValues>({
    resolver: zodResolver(complaintRequestSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
    },
    mode: "onTouched",
  });

  const clearMessages = () => {
    setToastMessage(null);
  };

  const submitRequest = async (values: ComplaintRequestFormValues) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای ثبت شکایت باید وارد سامانه شوید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitComplaintRequest(values, tokens.access);
      setToastMessage("شکایت شما با موفقیت ثبت شد.");
      form.reset();
      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "ثبت شکایت ناموفق بود. لطفاً دوباره تلاش کنید.",
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
