interface ReadOnlyLocationFieldsProps {
  blockName?: string
  roomNumber?: string
  showBlock?: boolean
  showRoom?: boolean
  blockError?: string
  roomError?: string
  isLoading?: boolean
  loadError?: string | null
}

export function ReadOnlyLocationFields({
  blockName = '',
  roomNumber = '',
  showBlock = true,
  showRoom = true,
  blockError,
  roomError,
  isLoading = false,
  loadError = null,
}: ReadOnlyLocationFieldsProps) {
  const readOnlyClassName =
    'h-11 w-full rounded-md border border-stone bg-surface-soft px-4 text-body-md text-ink outline-none disabled:cursor-not-allowed disabled:text-body'

  return (
    <>
      {showBlock ? (
      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">بلوک</span>
        {isLoading ? (
          <p className="text-body-sm text-mute">در حال بارگذاری اطلاعات اتاق...</p>
        ) : loadError ? (
          <p className="text-body-sm text-error">{loadError}</p>
        ) : (
          <input
            type="text"
            value={blockName}
            readOnly
            disabled
            className={readOnlyClassName}
          />
        )}
        {blockError ? <p className="mt-2 text-body-sm text-error">{blockError}</p> : null}
      </label>
      ) : null}

      {showRoom ? (
      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">شماره اتاق</span>
        {isLoading ? (
          <p className="text-body-sm text-mute">در حال بارگذاری اطلاعات اتاق...</p>
        ) : loadError ? (
          <p className="text-body-sm text-error">{loadError}</p>
        ) : (
          <input
            type="text"
            value={roomNumber}
            readOnly
            disabled
            className={readOnlyClassName}
          />
        )}
        {roomError ? <p className="mt-2 text-body-sm text-error">{roomError}</p> : null}
      </label>
      ) : null}
    </>
  )
}
