import { useCallback, useState } from 'react'
import { Controller } from 'react-hook-form'

import { BlockFloorSelector } from './BlockFloorSelector'
import { useCleaningRequest } from '../../hooks/useCleaningRequest'
import type { Block, Floor } from '../../types/cleaning'
import { cleaningLines, cleaningSpaceTypes } from '../../types/cleaning'

export function CleaningRequestForm() {
  const {
    form,
    isSubmitting,
    error,
    successMessage,
    submitRequest,
    clearMessages,
    resetCascadeFromBlock,
  } = useCleaningRequest()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)

  const handleBlockSelect = useCallback((block: Block | null) => {
    setSelectedBlock(block)
  }, [])

  const handleFloorSelect = useCallback((floor: Floor | null) => {
    setSelectedFloor(floor)
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedBlock || !selectedFloor) {
      return
    }

    await submitRequest(values, {
      blockName: selectedBlock.name,
      floorLabel: selectedFloor.label,
    })
  })

  const selectClassName =
    'h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30'

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
      <Controller
        control={control}
        name="floorId"
        render={({ field: floorField }) => (
          <Controller
            control={control}
            name="blockId"
            render={({ field: blockField }) => (
              <BlockFloorSelector
                blockId={blockField.value}
                floorId={floorField.value}
                blockError={errors.blockId?.message}
                floorError={errors.floorId?.message}
                onBlockChange={(value) => {
                  clearMessages()
                  blockField.onChange(value)
                  resetCascadeFromBlock()
                }}
                onFloorChange={(value) => {
                  clearMessages()
                  floorField.onChange(value)
                }}
                onBlockBlur={blockField.onBlur}
                onFloorBlur={floorField.onBlur}
                onBlockSelect={handleBlockSelect}
                onFloorSelect={handleFloorSelect}
              />
            )}
          />
        )}
      />

      <Controller
        control={control}
        name="line"
        render={({ field }) => (
          <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
            <span className="mb-3 block text-body-sm-strong text-ink">انتخاب لاین</span>
            <select
              value={field.value}
              onChange={(event) => {
                clearMessages()
                field.onChange(event.target.value)
              }}
              onBlur={field.onBlur}
              className={selectClassName}
            >
              <option value="">همه لاین‌ها</option>
              {cleaningLines.map((line) => (
                <option key={line.value} value={line.value}>
                  {line.label}
                </option>
              ))}
            </select>
            {errors.line?.message ? (
              <p className="mt-2 text-body-sm text-error">{errors.line.message}</p>
            ) : null}
          </label>
        )}
      />

      <Controller
        control={control}
        name="spaceType"
        render={({ field }) => (
          <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
            <span className="mb-3 block text-body-sm-strong text-ink">انتخاب فضا</span>
            <select
              value={field.value}
              onChange={(event) => {
                clearMessages()
                field.onChange(event.target.value)
              }}
              onBlur={field.onBlur}
              className={selectClassName}
            >
              <option value="">انتخاب فضای مورد نظر</option>
              {cleaningSpaceTypes.map((space) => (
                <option key={space.value} value={space.value}>
                  {space.label}
                </option>
              ))}
            </select>
            {errors.spaceType?.message ? (
              <p className="mt-2 text-body-sm text-error">{errors.spaceType.message}</p>
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
        {isSubmitting ? 'در حال ثبت...' : 'ارسال درخواست نظافت'}
      </button>
    </form>
  )
}
