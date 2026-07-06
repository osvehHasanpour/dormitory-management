import { useMemo, useState } from "react";

interface AnnouncementIconProps {
  className?: string;
  alt?: string;
  preferredSrc?: string | null;
}

const FALLBACK_ICON_SOURCES = [
  "/media/announcement-megaphone.png",
  "/media/megaphone.png",
];

export function AnnouncementIcon({
  className = "h-10 w-10",
  alt = "آیکون اطلاعیه",
  preferredSrc = null,
}: AnnouncementIconProps) {
  const sources = useMemo(() => {
    const orderedSources = [preferredSrc, ...FALLBACK_ICON_SOURCES].filter(
      (source): source is string => Boolean(source && source.trim()),
    );
    return Array.from(new Set(orderedSources));
  }, [preferredSrc]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  if (sources.length > 0 && activeSourceIndex < sources.length) {
    return (
      <img
        src={sources[activeSourceIndex]}
        alt={alt}
        className={className}
        onError={() => setActiveSourceIndex((value) => value + 1)}
      />
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-label={alt} role="img">
      <path
        d="M4.5 11.2L14.4 6.8C15 6.5 15.7 7 15.7 7.7V16.3C15.7 17 15 17.5 14.4 17.2L4.5 12.8C3.8 12.5 3.8 11.5 4.5 11.2Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.7 10.1H17.2C19 10.1 20.5 11.6 20.5 13.4V10.6C20.5 12.4 19 13.9 17.2 13.9H15.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.3 13.9L8.8 18.2C9.1 19.1 10.1 19.5 10.9 19.1C11.6 18.8 11.9 18 11.6 17.3L10.4 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
