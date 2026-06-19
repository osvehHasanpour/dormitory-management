import { Camera, UserCircle } from 'lucide-react'

interface ProfileAvatarProps {
  imageUrl?: string | null
  fullName: string
}

export function ProfileAvatar({ imageUrl, fullName }: ProfileAvatarProps) {
  return (
    <div className="relative mx-auto mb-8 h-28 w-28">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-hairline bg-surface-card">
        {imageUrl ? (
          <img src={imageUrl} alt={fullName} className="h-full w-full object-cover" />
        ) : (
          <UserCircle className="h-16 w-16 text-ash" strokeWidth={1.25} aria-hidden="true" />
        )}
      </div>
      <button
        type="button"
        className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas text-ink shadow-elevated transition-colors active:bg-primary/25"
        aria-label="ویرایش تصویر پروفایل"
      >
        <Camera className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}
