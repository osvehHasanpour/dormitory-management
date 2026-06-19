import { Link } from 'react-router-dom'

interface FeatureCardProps {
  label: string
  image: string
  route: string
}

export function FeatureCard({ label, image, route }: FeatureCardProps) {
  return (
    <Link
      to={route}
      className="flex min-h-[120px] flex-col items-center justify-center gap-2 glass-card p-4 transition-colors active:bg-white/55 sm:min-h-[140px]"
    >
      <img src={image} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
      <span className="text-center text-body-sm-strong text-ink">{label}</span>
    </Link>
  )
}
