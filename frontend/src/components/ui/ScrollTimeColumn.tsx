interface ScrollTimeColumnProps {
  label: string;
  value: number;
  options: Array<{ value: number; label: string }>;
  onChange: (value: number) => void;
}

export function ScrollTimeColumn({
  label,
  value,
  options,
  onChange,
}: ScrollTimeColumnProps) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-caption-md text-mute">{label}</p>
      <div
        role="listbox"
        aria-label={label}
        className="max-h-44 overflow-y-auto overscroll-contain rounded-lg border border-hairline/60 bg-surface-soft p-1.5"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onChange(option.value)}
              className={`flex min-h-12 w-full items-center justify-center rounded-lg text-body-md transition-colors ${
                isSelected
                  ? "bg-primary-deep font-bold text-on-primary shadow-sm"
                  : "text-body-text hover:bg-primary/10 active:bg-primary/15"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
