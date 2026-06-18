interface ProfileInfoRowProps {
  label: string
  value: string
}

export function ProfileInfoRow({ label, value }: ProfileInfoRowProps) {
  return (
    <div className="rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
      <p className="text-body-sm-strong text-mute">{label}</p>
      <p className="mt-2 text-body-md text-ink">{value}</p>
    </div>
  )
}
