import { useCreateAnnouncement } from '../../hooks/useCreateAnnouncement'
import { Toast } from '../ui/Toast'

const inputClassName =
  'h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

const cardClassName = 'rounded-md border border-hairline bg-canvas p-4 shadow-elevated'

export function AnnouncementForm() {
  const { form, isSubmitting, toastMessage, submitAnnouncement, clearMessages } =
    useCreateAnnouncement()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <>
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(submitAnnouncement)}>
        <label className={cardClassName}>
          <span className="mb-3 block text-body-sm-strong text-ink">عنوان اطلاعیه</span>
          <input
            type="text"
            autoComplete="off"
            placeholder="مثال: تعمیرات آب گرم"
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
          <span className="mb-3 block text-body-sm-strong text-ink">متن اطلاعیه</span>
          <textarea
            rows={6}
            placeholder="متن کامل اطلاعیه را وارد کنید..."
            className="min-h-36 w-full resize-y rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
            {...register('content', {
              onChange: clearMessages,
            })}
          />
          {errors.content?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.content.message}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash"
        >
          {isSubmitting ? 'در حال ارسال...' : 'ارسال اطلاعیه'}
        </button>
      </form>

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </>
  )
}
