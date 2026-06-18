const SKELETON_ROWS = 4

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="در حال بارگذاری پروفایل">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-md border border-hairline bg-canvas p-4 shadow-elevated"
        >
          <div className="h-4 w-28 rounded-md bg-surface-card" />
          <div className="mt-3 h-5 w-40 rounded-md bg-surface-card" />
        </div>
      ))}
    </div>
  )
}
