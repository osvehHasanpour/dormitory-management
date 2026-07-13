import { ideaSortOptions } from "../../data/ideaItems";
import type { IdeaOrdering } from "../../types/idea";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";

interface IdeaSortMenuProps {
  activeOrdering: IdeaOrdering;
  onChange: (ordering: IdeaOrdering) => void;
}

function SortIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 7H16M4 12H13M4 17H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 7V17M18 17L15 14M18 17L21 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IdeaSortMenu({ activeOrdering, onChange }: IdeaSortMenuProps) {
  return (
    <ResponsiveDropdown
      value={activeOrdering}
      onChange={(value) => onChange(value as IdeaOrdering)}
      options={ideaSortOptions}
      placeholder="مرتب‌سازی"
      panelTitle="مرتب‌سازی ایده‌ها"
      ariaLabel="مرتب‌سازی ایده‌ها"
      variant="compact"
      renderCompactTrigger={({ isOpen }) => (
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-overlay-border bg-overlay-bg text-ink backdrop-blur-sm transition-colors active:bg-overlay-press ${
            isOpen ? "bg-overlay-bg-strong" : ""
          }`}
        >
          <SortIcon className="h-5 w-5" />
        </span>
      )}
    />
  );
}
