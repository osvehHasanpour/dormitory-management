import { Link } from "react-router-dom";

interface FeatureCardProps {
  label: string;
  image: string;
  route: string;
  size?: "default" | "large";
}

export function FeatureCard({
  label,
  image,
  route,
  size = "default",
}: FeatureCardProps) {
  const isLarge = size === "large";

  return (
    <Link
      to={route}
      className={`flex flex-col items-center justify-center gap-3 glass-card p-4 transition-colors active:bg-interactive-soft ${
        isLarge
          ? "min-h-[132px] rounded-lg sm:min-h-[148px] md:min-h-[168px]"
          : "min-h-[112px] sm:min-h-[120px] md:min-h-[140px]"
      }`}
    >
      <img
        src={image}
        alt=""
        className={`object-contain ${isLarge ? "h-14 w-14 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]" : "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"}`}
      />
      <span
        className={`line-clamp-2 break-words text-center text-ink ${isLarge ? "text-body-strong" : "text-body-sm-strong"}`}
      >
        {label}
      </span>
    </Link>
  );
}
