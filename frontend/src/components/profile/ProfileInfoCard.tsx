import type { LucideIcon } from "lucide-react";

interface ProfileInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function ProfileInfoCard({
  icon: Icon,
  label,
  value,
}: ProfileInfoCardProps) {
  return (
    <div className="flex items-center gap-4 glass-card rounded-md p-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-card"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1 text-right">
        <p className="text-body-sm-strong text-mute">{label}</p>
        <p className="mt-1 break-words text-body-md text-body-text">{value}</p>
      </div>
    </div>
  );
}
