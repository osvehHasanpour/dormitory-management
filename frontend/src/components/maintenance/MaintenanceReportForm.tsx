import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";

import { BlockDropdown } from "../shared/BlockDropdown";
import { ReadOnlyLocationFields } from "../shared/ReadOnlyLocationFields";
import { CategorySelector } from "./CategorySelector";
import { PhotoUploader } from "./PhotoUploader";
import { useMaintenanceReport } from "../../hooks/useMaintenanceReport";
import type { Block } from "../../services/blockService";
import { isRoomCategory } from "../../types/maintenance";

export function MaintenanceReportForm() {
  const {
    form,
    isSubmitting,
    error,
    successMessage,
    profileError,
    isProfileLoading,
    submitReport,
    clearMessages,
  } = useMaintenanceReport();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const selectedPhoto = watch("photo");
  const selectedCategory = watch("category");
  const roomNumber = watch("roomNumber");
  const showRoomField = isRoomCategory(selectedCategory);

  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const handleBlockSelect = useCallback((block: Block | null) => {
    setSelectedBlock(block);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedBlock) {
      return;
    }

    await submitReport(values, { blockName: selectedBlock.name });
  });

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
      <Controller
        control={control}
        name="blockId"
        render={({ field }) => (
          <BlockDropdown
            blockId={field.value}
            error={errors.blockId?.message}
            onChange={(value) => {
              clearMessages();
              field.onChange(value);
            }}
            onBlur={field.onBlur}
            onBlockSelect={handleBlockSelect}
          />
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <CategorySelector
            value={field.value}
            error={errors.category?.message}
            onChange={(value) => {
              clearMessages();
              field.onChange(value);
            }}
            onBlur={field.onBlur}
          />
        )}
      />

      {showRoomField ? (
        <ReadOnlyLocationFields
          showBlock={false}
          roomNumber={roomNumber}
          roomError={errors.roomNumber?.message}
          isLoading={isProfileLoading}
          loadError={profileError}
        />
      ) : null}

      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">
          توضیحات تکمیلی
        </span>
        <textarea
          rows={5}
          placeholder="جزئیات خرابی را بنویسید..."
          className="min-h-32 w-full resize-y rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
          {...register("description", {
            onChange: clearMessages,
          })}
        />
        {errors.description?.message ? (
          <p className="mt-2 text-body-sm text-error">
            {errors.description.message}
          </p>
        ) : null}
      </label>

      <PhotoUploader
        file={selectedPhoto}
        error={errors.photo?.message}
        onChange={(file) => {
          clearMessages();
          setValue("photo", file, { shouldDirty: true, shouldValidate: true });
        }}
      />

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error-pale px-4 py-3 text-body-sm text-error"
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="rounded-md border border-success-deep/20 bg-success-pale px-4 py-3 text-body-sm text-success-deep"
        >
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash"
      >
        {isSubmitting ? "در حال ثبت..." : "ثبت درخواست خرابی"}
      </button>
    </form>
  );
}
