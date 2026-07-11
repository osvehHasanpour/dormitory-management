interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
      <h2 className="shrink-0 text-heading-lg text-ink md:text-heading-xl">
        {title}
      </h2>
      <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
    </div>
  );
}
