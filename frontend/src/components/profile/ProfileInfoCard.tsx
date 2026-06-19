import type { LucideIcon } from 'lucide-react'

interface ProfileInfoCardProps {
  label: string
  value: string
  icon: LucideIcon
}

export function ProfileInfoCard({ label, value, icon: Icon }: ProfileInfoCardProps) {
  return (
    <div className="flex flex-row-reverse items-center gap-4 rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-card"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-body-sm-strong text-mute">{label}</p>
        <p className="mt-1 text-body-md text-ink">{value}</p>
      </div>
    </div>
  )
}
