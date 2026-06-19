import { Controller } from 'react-hook-form'

import { ReadOnlyLocationFields } from '../shared/ReadOnlyLocationFields'
import { ItemSelector } from './ItemSelector'
import { useItemRequest } from '../../hooks/useItemRequest'
import { MIN_ITEM_QUANTITY } from '../../types/item'

export function ItemRequestForm() {
  const {
    form,
    isSubmitting,
    error,
    successMessage,
    profileError,
    isProfileLoading,
    submitRequest,
    clearMessages,
  } = useItemRequest()
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const blockName = watch('block')
  const roomNumber = watch('roomNumber')

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(submitRequest)}>
      <ReadOnlyLocationFields
        blockName={blockName}
        roomNumber={roomNumber}
        blockError={errors.block?.message}
        roomError={errors.roomNumber?.message}
        isLoading={isProfileLoading}
        loadError={profileError}
      />

      <Controller
        control={control}
        name="itemId"
        render={({ field: itemField }) => (
          <Controller
            control={control}
            name="quantity"
            render={({ field: quantityField }) => (
              <ItemSelector
                itemId={itemField.value}
                quantity={quantityField.value}
                itemError={errors.itemId?.message}
                quantityError={errors.quantity?.message}
                onItemChange={(itemId, maxQuantity) => {
                  clearMessages()
                  itemField.onChange(itemId)
                  quantityField.onChange(Math.min(quantityField.value, maxQuantity) || MIN_ITEM_QUANTITY)
                }}
                onQuantityChange={(quantity) => {
                  clearMessages()
                  quantityField.onChange(quantity)
                }}
                onItemBlur={itemField.onBlur}
                onQuantityBlur={quantityField.onBlur}
              />
            )}
          />
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
        disabled={isSubmitting || isProfileLoading}
        className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash"
      >
        {isSubmitting ? 'در حال ثبت...' : 'ارسال درخواست لوازم'}
      </button>
    </form>
  )
}
