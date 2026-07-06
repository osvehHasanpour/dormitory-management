import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./useAuth";
import { submitCleaningRequest } from "../services/cleaningService";
import type { CleaningRequestFormValues } from "../types/cleaning";

const cleaningRequestSchema = z.object({
  blockId: z.string().min(1, "انتخاب بلوک الزامی است."),
  floorId: z.string().min(1, "انتخاب طبقه الزامی است."),
  line: z.string().min(1, "انتخاب لاین الزامی است."),
  spaceType: z.string().min(1, "انتخاب فضا الزامی است."),
  description: z
    .string()
    .min(1, "توضیحات الزامی است.")
    .max(1000, "توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد."),
});

interface CleaningSubmitContext {
  blockName: string;
  floorLabel: string;
}

interface UseCleaningRequestResult {
  form: ReturnType<typeof useForm<CleaningRequestFormValues>>;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  submitRequest: (
    values: CleaningRequestFormValues,
    context: CleaningSubmitContext,
  ) => Promise<void>;
  clearMessages: () => void;
  resetCascadeFromBlock: () => void;
}

export function useCleaningRequest(): UseCleaningRequestResult {
  const navigate = useNavigate();
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CleaningRequestFormValues>({
    resolver: zodResolver(cleaningRequestSchema),
    defaultValues: {
      blockId: "",
      floorId: "",
      line: "",
      spaceType: "",
      description: "",
    },
    mode: "onTouched",
  });

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const resetCascadeFromBlock = () => {
    form.setValue("floorId", "");
    form.setValue("line", "");
    form.setValue("spaceType", "");
  };

  const submitRequest = async (
    values: CleaningRequestFormValues,
    context: CleaningSubmitContext,
  ) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setError("برای ثبت درخواست نظافت باید وارد سامانه شوید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCleaningRequest(
        values,
        tokens.access,
        context.blockName,
        context.floorLabel,
      );
      setSuccessMessage("درخواست نظافت با موفقیت ثبت شد.");
      form.reset();
      window.setTimeout(() => {
        navigate("/my-requests", { replace: true });
      }, 900);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ثبت درخواست نظافت ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    successMessage,
    submitRequest,
    clearMessages,
    resetCascadeFromBlock,
  };
}
