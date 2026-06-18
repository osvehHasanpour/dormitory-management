import { useProfile } from '../../hooks/useProfile'
import { ProfileInfoRow } from './ProfileInfoRow'
import { ProfileSkeleton } from './ProfileSkeleton'

export function ProfilePanel() {
  const { fields, isLoading, error, retry } = useProfile()

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-md border border-error/20 bg-error-pale px-4 py-4 text-body-sm text-error"
      >
        <p>{error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-3 rounded-md bg-secondary-bg px-4 py-2 text-button-sm text-on-secondary transition-colors hover:bg-secondary-pressed"
        >
          تلاش مجدد
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <ProfileInfoRow key={field.id} label={field.label} value={field.value} />
      ))}
    </div>
  )
}
