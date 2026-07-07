import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  createSupervisorClass,
  updateSupervisorClass,
} from "../services/supervisorClassService";
import { DEFAULT_CLASS_CATEGORY } from "../data/supervisorClassItems";
import { useAuth } from "./useAuth";
import type { SupervisorClassItem } from "../types/supervisorClass";
import { toTimeInputValue } from "../utils/formatClassSchedule";

const isPositiveInteger = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1;
};

const formSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان کلاس الزامی است."),
    teacher_id: z
      .string()
      .trim()
      .min(1, "شناسه مدرس الزامی است.")
      .refine(isPositiveInteger, "شناسه مدرس باید یک عدد معتبر باشد."),
    location: z.string(),
    capacity: z
      .string()
      .trim()
      .min(1, "ظرفیت الزامی است.")
      .refine(isPositiveInteger, "ظرفیت باید حداقل ۱ نفر باشد."),
    start_datetime: z.string().min(1, "تاریخ شروع الزامی است."),
    end_datetime: z.string().min(1, "تاریخ پایان الزامی است."),
    day_of_week: z.string().min(1, "روز برگزاری الزامی است."),
    start_time: z.string().min(1, "زمان شروع کلاس الزامی است."),
    end_time: z.string().min(1, "زمان پایان کلاس الزامی است."),
  })
  .refine(
    (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
    {
      path: ["end_datetime"],
      message: "زمان پایان باید بعد از زمان شروع باشد.",
    },
  )
  .refine((data) => data.end_time > data.start_time, {
    path: ["end_time"],
    message: "زمان پایان کلاس باید بعد از زمان شروع باشد.",
  });

export type ClassFormValues = z.infer<typeof formSchema>;

export const EMPTY_CLASS_FORM: ClassFormValues = {
  title: "",
  teacher_id: "",
  location: "",
  capacity: "",
  start_datetime: "",
  end_datetime: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
};

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function classItemToFormValues(
  item: SupervisorClassItem,
): ClassFormValues {
  return {
    title: item.title,
    teacher_id: item.teacher ? String(item.teacher.id) : "",
    location: item.location ?? "",
    capacity: String(item.capacity),
    start_datetime: toDatetimeLocalValue(item.start_datetime),
    end_datetime: toDatetimeLocalValue(item.end_datetime),
    day_of_week: item.day_of_week ?? "",
    start_time: toTimeInputValue(item.start_time),
    end_time: toTimeInputValue(item.end_time),
  };
}

interface SubmitParams {
  mode: "create" | "edit";
  classId?: number;
}

interface UseSupervisorClassFormOptions {
  onSuccess: (item: SupervisorClassItem, mode: "create" | "edit") => void;
}

interface UseSupervisorClassFormResult {
  form: ReturnType<typeof useForm<ClassFormValues>>;
  isSubmitting: boolean;
  toastMessage: string | null;
  clearMessages: () => void;
  submit: (params: SubmitParams) => Promise<void>;
}

export function useSupervisorClassForm({
  onSuccess,
}: UseSupervisorClassFormOptions): UseSupervisorClassFormResult {
  const { tokens, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_CLASS_FORM,
    mode: "onTouched",
  });

  const clearMessages = () => {
    setToastMessage(null);
  };

  const submit = async ({ mode, classId }: SubmitParams) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setToastMessage("برای انجام این عملیات باید وارد سامانه شوید.");
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const values = form.getValues();
    const basePayload = {
      title: values.title.trim(),
      teacher_id: Number(values.teacher_id),
      capacity: Number(values.capacity),
      location: values.location.trim(),
      start_datetime: new Date(values.start_datetime).toISOString(),
      end_datetime: new Date(values.end_datetime).toISOString(),
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    };

    setIsSubmitting(true);

    try {
      let updated: SupervisorClassItem;

      if (mode === "edit" && classId != null) {
        updated = await updateSupervisorClass(
          tokens.access,
          classId,
          basePayload,
        );
      } else {
        updated = await createSupervisorClass(tokens.access, {
          ...basePayload,
          category: DEFAULT_CLASS_CATEGORY,
        });
      }

      onSuccess(updated, mode);
    } catch (submitError) {
      setToastMessage(
        submitError instanceof Error
          ? submitError.message
          : "ثبت اطلاعات کلاس ناموفق بود. لطفاً دوباره تلاش کنید.",
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
