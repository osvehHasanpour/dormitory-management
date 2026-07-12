import { Controller } from "react-hook-form";
import { useEffect } from "react";

import {
  EMPTY_CLASS_FORM,
  classItemToFormValues,
  useSupervisorClassForm,
} from "../../hooks/useSupervisorClassForm";
import { PERSIAN_WEEKDAYS } from "../../data/supervisorClassItems";
import type { SupervisorClassItem } from "../../types/supervisorClass";
import { formatPersianTime } from "../../utils/formatClassSchedule";
import { BottomSheet } from "../ui/BottomSheet";
import { fieldInputClassName } from "../ui/formStyles";
import { ResponsiveDatePicker } from "../ui/ResponsiveDatePicker";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";
import { ResponsiveTimePicker } from "../ui/ResponsiveTimePicker";
import { Toast } from "../ui/Toast";

interface SupervisorClassFormSheetProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialClass: SupervisorClassItem | null;
  onClose: () => void;
  onSuccess: (item: SupervisorClassItem, mode: "create" | "edit") => void;
}

export function SupervisorClassFormSheet({
  isOpen,
  mode,
  initialClass,
  onClose,
  onSuccess,
}: SupervisorClassFormSheetProps) {
  const { form, isSubmitting, toastMessage, clearMessages, submit } =
    useSupervisorClassForm({
      onSuccess,
    });
  const {
    register,
    reset,
    watch,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    clearMessages();
    reset(
      mode === "edit" && initialClass
        ? classItemToFormValues(initialClass)
        : EMPTY_CLASS_FORM,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialClass]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "ویرایش کلاس" : "ثبت کلاس جدید"}
      subtitle={
        mode === "edit"
          ? (initialClass?.title ?? null)
          : "اطلاعات کلاس را وارد کنید"
      }
    >
      <form
        className="min-w-0 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit({ mode, classId: initialClass?.id });
        }}
      >
        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">
            عنوان کلاس
          </span>
          <input
            type="text"
            placeholder="عنوان کلاس را وارد کنید"
            className={fieldInputClassName}
            disabled={isSubmitting}
            {...register("title", { onChange: clearMessages })}
          />
          {errors.title?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.title.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">
            شناسه مدرس
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="شناسه کاربری مدرس"
            className={fieldInputClassName}
            disabled={isSubmitting}
            {...register("teacher_id", { onChange: clearMessages })}
          />
          {errors.teacher_id?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.teacher_id.message}
            </p>
          ) : null}
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-body-sm-strong text-ink">
            تاریخ شروع
          </span>
          <Controller
            control={control}
            name="start_datetime"
            render={({ field }) => (
              <ResponsiveDatePicker
                value={field.value}
                onChange={(nextValue) => {
                  clearMessages();
                  field.onChange(nextValue);
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                elevated
                placeholder="انتخاب تاریخ شروع"
              />
            )}
          />
          {errors.start_datetime?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.start_datetime.message}
            </p>
          ) : null}
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-body-sm-strong text-ink">
            تاریخ پایان
          </span>
          <Controller
            control={control}
            name="end_datetime"
            render={({ field }) => (
              <ResponsiveDatePicker
                value={field.value}
                onChange={(nextValue) => {
                  clearMessages();
                  field.onChange(nextValue);
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                elevated
                placeholder="انتخاب تاریخ پایان"
              />
            )}
          />
          {errors.end_datetime?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.end_datetime.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">
            روز برگزاری
          </span>
          <Controller
            control={control}
            name="day_of_week"
            render={({ field }) => (
              <ResponsiveDropdown
                value={field.value}
                onChange={(nextValue) => {
                  clearMessages();
                  field.onChange(nextValue);
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                elevated
                options={PERSIAN_WEEKDAYS}
                placeholder="انتخاب روز"
                panelTitle="روز برگزاری"
              />
            )}
          />
          {errors.day_of_week?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.day_of_week.message}
            </p>
          ) : null}
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-body-sm-strong text-ink">
            زمان شروع کلاس
          </span>
          <Controller
            control={control}
            name="start_time"
            render={({ field }) => (
              <ResponsiveTimePicker
                value={field.value}
                onChange={(nextValue) => {
                  clearMessages();
                  field.onChange(nextValue);
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                elevated
                placeholder="انتخاب زمان شروع"
              />
            )}
          />
          {watch("start_time") ? (
            <p className="mt-1 text-caption-md text-mute">
              {formatPersianTime(watch("start_time"))}
            </p>
          ) : null}
          {errors.start_time?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.start_time.message}
            </p>
          ) : null}
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-body-sm-strong text-ink">
            زمان پایان کلاس
          </span>
          <Controller
            control={control}
            name="end_time"
            render={({ field }) => (
              <ResponsiveTimePicker
                value={field.value}
                onChange={(nextValue) => {
                  clearMessages();
                  field.onChange(nextValue);
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                elevated
                placeholder="انتخاب زمان پایان"
              />
            )}
          />
          {watch("end_time") ? (
            <p className="mt-1 text-caption-md text-mute">
              {formatPersianTime(watch("end_time"))}
            </p>
          ) : null}
          {errors.end_time?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.end_time.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">
            مکان برگزاری
          </span>
          <input
            type="text"
            placeholder="مکان برگزاری (اختیاری)"
            className={fieldInputClassName}
            disabled={isSubmitting}
            {...register("location", { onChange: clearMessages })}
          />
          {errors.location?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.location.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">ظرفیت</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="ظرفیت کلاس"
            className={fieldInputClassName}
            disabled={isSubmitting}
            {...register("capacity", { onChange: clearMessages })}
          />
          {errors.capacity?.message ? (
            <p className="mt-2 text-body-sm text-error">
              {errors.capacity.message}
            </p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "در حال ثبت..."
            : mode === "edit"
              ? "ذخیره تغییرات"
              : "ثبت کلاس"}
        </button>
      </form>

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </BottomSheet>
  );
}
