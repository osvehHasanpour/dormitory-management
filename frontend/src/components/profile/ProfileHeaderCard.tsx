import { Pencil, User } from "lucide-react";

interface ProfileHeaderCardProps {
  name: string;
  subtitle: string;
  imageUrl?: string | null;
}

export function ProfileHeaderCard({
  name,
  subtitle,
  imageUrl,
}: ProfileHeaderCardProps) {
  return (
    <div className="glass-card flex items-center gap-4 p-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-overlay-border-strong bg-overlay-bg">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <User
            className="h-7 w-7 text-ash"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-heading-md text-ink">{name}</p>
        <p className="mt-0.5 truncate text-body-sm text-body-text">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-overlay-border bg-overlay-bg text-ink backdrop-blur-sm transition-colors active:bg-overlay-press"
        aria-label="ویرایش پروفایل"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
