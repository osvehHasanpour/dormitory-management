import { useEffect, useMemo, useRef } from 'react'

interface PhotoUploaderProps {
  file: File | null
  error?: string
  onChange: (file: File | null) => void
}

export function PhotoUploader({ file, error, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <section className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-body-sm-strong text-ink">افزودن عکس خرابی</h3>
          <p className="mt-1 text-body-sm text-mute">یک تصویر تا حجم ۵ مگابایت انتخاب کنید.</p>
        </div>
        {file ? (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-md bg-surface-card px-3 py-2 text-caption-sm font-semibold text-error"
          >
            حذف
          </button>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="mb-3 overflow-hidden rounded-md border border-hairline bg-surface-soft">
          <img
            src={previewUrl}
            alt="پیش‌نمایش تصویر خرابی"
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : null}

      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-stone bg-surface-soft px-4 py-5 text-center transition-colors active:bg-primary/20">
        <span className="text-body-sm-strong text-ink">
          {file ? 'تغییر عکس' : 'افزودن عکس جدید'}
        </span>
        <span className="mt-1 text-body-sm text-mute">JPG، PNG یا WEBP</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </label>

      {error ? <p className="mt-2 text-body-sm text-error">{error}</p> : null}
    </section>
  )
}
