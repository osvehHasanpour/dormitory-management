import { Controller } from 'react-hook-form'

import { useComplaintRequest } from '../../hooks/useComplaintRequest'
import { complaintCategoryOptions } from '../../types/complaint'
import { Toast } from '../ui/Toast'

const inputClassName =
  'h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

const cardClassName = 'rounded-md border border-hairline bg-canvas p-4 shadow-elevated'

export function ComplaintRequestForm() {
  const { form, isSubmitting, toastMessage, submitRequest, clearMessages } = useComplaintRequest()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <>
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(submitRequest)}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <label className={cardClassName}>
              <span className="mb-3 block text-body-sm-strong text-ink">دسته‌بندی موضوع</span>
              <select
                value={field.value}
                onChange={(event) => {
                  clearMessages()
                  field.onChange(event.target.value)
                }}
                onBlur={field.onBlur}
                className={inputClassName}
              >
                <option value="">انتخاب دسته‌بندی موضوع</option>
                {complaintCategoryOptions.map((category) => (
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

        <label className={cardClassName}>
          <span className="mb-3 block text-body-sm-strong text-ink">عنوان شکایت</span>
          <input
            type="text"
            autoComplete="off"
            placeholder="عنوان شکایت را وارد کنید"
            className={inputClassName}
            {...register('title', {
              onChange: clearMessages,
            })}
          />
          {errors.title?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.title.message}</p>
          ) : null}
        </label>

        <label className={cardClassName}>
          <span className="mb-3 block text-body-sm-strong text-ink">شرح کامل موضوع</span>
          <textarea
            rows={6}
            placeholder="جزئیات شکایت خود را بنویسید..."
            className="min-h-36 w-full resize-y rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
            {...register('description', {
              onChange: clearMessages,
            })}
          />
          {errors.description?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.description.message}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت'}
        </button>
      </form>

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </>
  )
}
