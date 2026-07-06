import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "./useAuth";
import { useRoomAssignment } from "./useRoomAssignment";
import { submitItemRequest } from "../services/itemService";
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from "../types/item";
import type { ItemRequestFormValues } from "../types/item";

const itemRequestSchema = z.object({
  block: z.string().min(1, "اطلاعات بلوک یافت نشد."),
  roomNumber: z
    .string()
    .min(1, "اطلاعات اتاق یافت نشد.")
    .max(20, "شماره اتاق نمی‌تواند بیش از ۲۰ کاراکتر باشد."),
  itemId: z.string().min(1, "انتخاب کالا الزامی است."),
  quantity: z
    .number()
    .min(MIN_ITEM_QUANTITY, `تعداد باید حداقل ${MIN_ITEM_QUANTITY} باشد.`)
    .max(MAX_ITEM_QUANTITY, `تعداد نباید بیشتر از ${MAX_ITEM_QUANTITY} باشد.`),
  description: z
    .string()
    .max(1000, "توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد."),
});

interface UseItemRequestResult {
  form: ReturnType<typeof useForm<ItemRequestFormValues>>;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  profileError: string | null;
  isProfileLoading: boolean;
  submitRequest: (values: ItemRequestFormValues) => Promise<void>;
  clearMessages: () => void;
}

export function useItemRequest(): UseItemRequestResult {
  const navigate = useNavigate();
  const { tokens, isAuthenticated } = useAuth();
  const {
    blockName,
    roomNumber,
    isLoading: isProfileLoading,
    error: profileError,
  } = useRoomAssignment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ItemRequestFormValues>({
    resolver: zodResolver(itemRequestSchema),
    defaultValues: {
      block: "",
      roomNumber: "",
      itemId: "",
      quantity: MIN_ITEM_QUANTITY,
      description: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (blockName) {
      form.setValue("block", blockName, { shouldValidate: true });
    }
    if (roomNumber) {
      form.setValue("roomNumber", roomNumber, { shouldValidate: true });
    }
  }, [blockName, roomNumber, form]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const submitRequest = async (values: ItemRequestFormValues) => {
    clearMessages();

    if (!isAuthenticated || !tokens?.access) {
      setError("برای ثبت درخواست لوازم باید وارد سامانه شوید.");
      return;
    }

    if (!values.block || !values.roomNumber) {
      setError(
        "اطلاعات بلوک و اتاق شما یافت نشد. لطفاً با پشتیبانی تماس بگیرید.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await submitItemRequest(values, tokens.access);
      setSuccessMessage("درخواست لوازم با موفقیت ثبت شد.");
      form.reset({
        block: blockName ?? "",
        roomNumber: roomNumber ?? "",
        itemId: "",
        quantity: MIN_ITEM_QUANTITY,
        description: "",
      });
      window.setTimeout(() => {
        navigate("/my-requests", { replace: true });
      }, 900);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ثبت درخواست لوازم ناموفق بود. لطفاً دوباره تلاش کنید.",
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
    profileError,
    isProfileLoading,
    submitRequest,
    clearMessages,
  };
}
