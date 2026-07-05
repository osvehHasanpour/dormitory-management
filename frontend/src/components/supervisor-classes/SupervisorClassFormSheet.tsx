import { useEffect } from 'react'

import {
  EMPTY_CLASS_FORM,
  classItemToFormValues,
  useSupervisorClassForm,
} from '../../hooks/useSupervisorClassForm'
import { PERSIAN_WEEKDAYS } from '../../data/supervisorClassItems'
import type { SupervisorClassItem } from '../../types/supervisorClass'
import { formatPersianTime } from '../../utils/formatClassSchedule'
import { BottomSheet } from '../ui/BottomSheet'
import { Toast } from '../ui/Toast'

interface SupervisorClassFormSheetProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialClass: SupervisorClassItem | null
  onClose: () => void
  onSuccess: (item: SupervisorClassItem, mode: 'create' | 'edit') => void
}

const fieldClassName =
  'w-full rounded-md border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

export function SupervisorClassFormSheet({
  isOpen,
  mode,
  initialClass,
  onClose,
  onSuccess,
}: SupervisorClassFormSheetProps) {
  const { form, isSubmitting, toastMessage, clearMessages, submit } = useSupervisorClassForm({
    onSuccess,
  })
  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = form

  useEffect(() => {
    if (!isOpen) {
      return
    }

    clearMessages()
    reset(
      mode === 'edit' && initialClass
        ? classItemToFormValues(initialClass)
        : EMPTY_CLASS_FORM,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialClass])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'ویرایش کلاس' : 'ثبت کلاس جدید'}
      subtitle={mode === 'edit' ? initialClass?.title ?? null : 'اطلاعات کلاس را وارد کنید'}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit({ mode, classId: initialClass?.id })
        }}
      >
        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">عنوان کلاس</span>
          <input
            type="text"
            placeholder="عنوان کلاس را وارد کنید"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('title', { onChange: clearMessages })}
          />
          {errors.title?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.title.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">شناسه مدرس</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="شناسه کاربری مدرس"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('teacher_id', { onChange: clearMessages })}
          />
          {errors.teacher_id?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.teacher_id.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">تاریخ شروع</span>
          <input
            type="datetime-local"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('start_datetime', { onChange: clearMessages })}
          />
          {errors.start_datetime?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.start_datetime.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">تاریخ پایان</span>
          <input
            type="datetime-local"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('end_datetime', { onChange: clearMessages })}
          />
          {errors.end_datetime?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.end_datetime.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">روز برگزاری</span>
          <select
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('day_of_week', { onChange: clearMessages })}
          >
            <option value="">انتخاب روز</option>
            {PERSIAN_WEEKDAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          {errors.day_of_week?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.day_of_week.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">زمان شروع کلاس</span>
          <input
            type="time"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('start_time', { onChange: clearMessages })}
          />
          {watch('start_time') ? (
            <p className="mt-1 text-caption-md text-mute">
              {formatPersianTime(watch('start_time'))}
            </p>
          ) : null}
          {errors.start_time?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.start_time.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">زمان پایان کلاس</span>
          <input
            type="time"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('end_time', { onChange: clearMessages })}
          />
          {watch('end_time') ? (
            <p className="mt-1 text-caption-md text-mute">
              {formatPersianTime(watch('end_time'))}
            </p>
          ) : null}
          {errors.end_time?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.end_time.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">مکان برگزاری</span>
          <input
            type="text"
            placeholder="مکان برگزاری (اختیاری)"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('location', { onChange: clearMessages })}
          />
          {errors.location?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.location.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-body-sm-strong text-ink">ظرفیت</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="ظرفیت کلاس"
            className={fieldClassName}
            disabled={isSubmitting}
            {...register('capacity', { onChange: clearMessages })}
          />
          {errors.capacity?.message ? (
            <p className="mt-2 text-body-sm text-error">{errors.capacity.message}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'در حال ثبت...' : mode === 'edit' ? 'ذخیره تغییرات' : 'ثبت کلاس'}
        </button>
      </form>

      {toastMessage ? <Toast message={toastMessage} /> : null}
    </BottomSheet>
  )
}
