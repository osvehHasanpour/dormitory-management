import type { StatusBadgeVariant } from "../../utils/requestHelpers";

interface StatusBadgeProps {
  label: string;
  variant: StatusBadgeVariant;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  pending: "bg-warning-pale text-warning",
  reviewed: "bg-info-pale text-info",
  approved: "bg-success-pale text-success-deep",
  rejected: "bg-error-pale text-error",
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center truncate rounded-full px-2.5 py-1 text-caption-md font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
