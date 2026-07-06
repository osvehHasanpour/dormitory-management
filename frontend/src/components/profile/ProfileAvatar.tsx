import { Camera, User } from "lucide-react";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  alt: string;
}

export function ProfileAvatar({ imageUrl, alt }: ProfileAvatarProps) {
  return (
    <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-hairline bg-surface-card shadow-elevated">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <User
            className="h-14 w-14 text-ash sm:h-16 sm:w-16"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>

      <button
        type="button"
        className="absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full glass-card text-ink transition-colors active:bg-white/95"
        aria-label="ویرایش تصویر پروفایل"
      >
        <Camera className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
