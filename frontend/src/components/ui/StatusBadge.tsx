import type { StatusBadgeVariant } from '../../utils/requestHelpers'

interface StatusBadgeProps {
  label: string
  variant: StatusBadgeVariant
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  pending: 'bg-warning-pale text-warning',
  approved: 'bg-success-pale text-success-deep',
  rejected: 'bg-error-pale text-error',
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption-md font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
