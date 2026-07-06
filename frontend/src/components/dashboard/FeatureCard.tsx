import { Link } from 'react-router-dom'

interface FeatureCardProps {
  label: string
  image: string
  route: string
  size?: 'default' | 'large'
}

export function FeatureCard({ label, image, route, size = 'default' }: FeatureCardProps) {
  const isLarge = size === 'large'

  return (
    <Link
      to={route}
      className={`flex flex-col items-center justify-center gap-3 glass-card p-4 transition-colors active:bg-white/55 ${
        isLarge
          ? 'min-h-[148px] rounded-lg sm:min-h-[168px]'
          : 'min-h-[120px] sm:min-h-[140px]'
      }`}
    >
      <img
        src={image}
        alt=""
        className={`object-contain ${isLarge ? 'h-16 w-16 sm:h-[72px] sm:w-[72px]' : 'h-14 w-14 sm:h-16 sm:w-16'}`}
      />
      <span
        className={`text-center text-ink ${isLarge ? 'text-body-strong' : 'text-body-sm-strong'}`}
      >
        {label}
      </span>
    </Link>
  )
}
