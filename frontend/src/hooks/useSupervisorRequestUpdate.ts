import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateSupervisorRequestStatus } from "../services/requestService";
import { useAuth } from "./useAuth";
import type {
  RequestStatus,
  RequestStatusChangePayload,
  StudentRequestDetail,
} from "../types/request";

const updateSchema = z.object({
  status: z.string().min(1, "لطفاً وضعیت جدید را انتخاب کنید."),
  supervisor_response: z.string(),
});

export type RequestUpdateFormValues = z.infer<typeof updateSchema>;

interface UseSupervisorRequestUpdateOptions {
  onSuccess: (item: StudentRequestDetail) => void;
}

interface UseSupervisorRequestUpdateResult {
  form: ReturnType<typeof useForm<RequestUpdateFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  clearMessages: () => void;
  submit: (item: StudentRequestDetail) => Promise<void>;
}

export function useSupervisorRequestUpdate({
  onSuccess,
}: UseSupervisorRequestUpdateOptions): UseSupervisorRequestUpdateResult {
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<RequestUpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { status: "", supervisor_response: "" },
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

  const submit = async (item: StudentRequestDetail) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای انجام این عملیات باید وارد سامانه شوید.");
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const { status, supervisor_response } = form.getValues();
    const trimmedResponse = supervisor_response.trim();

    if (status === "rejected" && !trimmedResponse) {
      form.setError("supervisor_response", {
        type: "manual",
        message: "در صورت رد درخواست، ذکر دلیل الزامی است.",
      });
      return;
    }

    const payload: RequestStatusChangePayload = {
      status: status as RequestStatus,
      supervisor_response: trimmedResponse,
    };

    if (status === "rejected") {
      payload.rejection_reason = trimmedResponse;
    }

    setIsSubmitting(true);

    try {
      const updated = await updateSupervisorRequestStatus(
        tokens.access,
        item.request_type,
        item.id,
        payload,
      );
      setToastMessage("وضعیت درخواست با موفقیت به‌روزرسانی شد.");
      form.reset({
        status: "",
        supervisor_response: updated.supervisor_response ?? "",
      });
      onSuccess(updated);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "به‌روزرسانی درخواست ناموفق بود. لطفاً دوباره تلاش کنید.",
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
    submit,
  };
}
