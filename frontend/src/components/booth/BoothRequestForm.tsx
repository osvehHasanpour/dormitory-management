import { Controller } from 'react-hook-form'

import { useBoothRequest } from '../../hooks/useBoothRequest'
import { boothCategories, tableCountOptions } from '../../types/booth'

const selectClassName =
  'h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

export function BoothRequestForm() {
  const { form, isSubmitting, error, successMessage, submitRequest, clearMessages } =
    useBoothRequest()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(submitRequest)}>
      <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
        <span className="mb-3 block text-body-sm-strong text-ink">عنوان غرفه</span>
        <input
          type="text"
          autoComplete="off"
          placeholder="عنوان غرفه را وارد کنید"
          className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
          {...register('title', {
            onChange: clearMessages,
          })}
        />
        {errors.title?.message ? (
          <p className="mt-2 text-body-sm text-error">{errors.title.message}</p>
        ) : null}
      </label>

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
            <span className="mb-3 block text-body-sm-strong text-ink">دسته‌بندی محصولات</span>
            <select
              value={field.value}
              onChange={(event) => {
                clearMessages()
                field.onChange(event.target.value)
              }}
              onBlur={field.onBlur}
              className={selectClassName}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {boothCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category?.message ? (
              <p className="mt-2 text-body-sm text-error">{errors.category.message}</p>
            ) : null}
          </label>
        )}
      />

      <Controller
        control={control}
        name="tableCount"
        render={({ field }) => (
          <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
            <span className="mb-3 block text-body-sm-strong text-ink">تعداد میز</span>
            <select
              value={field.value}
              onChange={(event) => {
                clearMessages()
                field.onChange(event.target.value)
              }}
              onBlur={field.onBlur}
              className={selectClassName}
            >
              <option value="">انتخاب تعداد میز</option>
              {tableCountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.tableCount?.message ? (
              <p className="mt-2 text-body-sm text-error">{errors.tableCount.message}</p>
            ) : null}
          </label>
        )}
      />

      <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
        <span className="mb-3 block text-body-sm-strong text-ink">توضیحات تکمیلی (اختیاری)</span>
        <textarea
          rows={5}
          placeholder="در صورت نیاز، توضیحات بیشتری بنویسید..."
          className="min-h-32 w-full resize-y rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
          {...register('description', {
            onChange: clearMessages,
          })}
        />
        {errors.description?.message ? (
          <p className="mt-2 text-body-sm text-error">{errors.description.message}</p>
        ) : null}
      </label>

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
        {isSubmitting ? 'در حال ثبت...' : 'ثبت درخواست غرفه'}
      </button>
    </form>
  )
}
