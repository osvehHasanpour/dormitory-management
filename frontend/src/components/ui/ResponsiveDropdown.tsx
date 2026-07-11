import { ChevronDown, Check } from "lucide-react";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FloatingPanel } from "./FloatingPanel";
import { selectTriggerClassName, panelOptionClassName } from "./formStyles";

export interface ResponsiveDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ResponsiveDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly ResponsiveDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  panelTitle?: string;
  /** Raise z-index when opened inside BottomSheet */
  elevated?: boolean;
  variant?: "field" | "compact";
  renderCompactTrigger?: (props: {
    isOpen: boolean;
    selectedLabel: string;
  }) => ReactNode;
}

export function ResponsiveDropdown({
  value,
  onChange,
  onBlur,
  options,
  placeholder = "انتخاب کنید",
  disabled = false,
  id,
  ariaLabel,
  className = "",
  panelTitle,
  elevated = false,
  variant = "field",
  renderCompactTrigger,
}: ResponsiveDropdownProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;
  const hasValue = Boolean(selectedOption);

  const close = useCallback(() => {
    setIsOpen(false);
    onBlur?.();
  }, [onBlur]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    close();
  };

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    setIsOpen((open) => !open);
  };

  const listboxId = `${triggerId}-listbox`;

  return (
    <div className={`relative min-w-0 ${className}`}>
      {variant === "compact" && renderCompactTrigger ? (
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          disabled={disabled}
          aria-label={ariaLabel ?? placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={handleToggle}
        >
          {renderCompactTrigger({ isOpen, selectedLabel: displayLabel })}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          disabled={disabled}
          aria-label={ariaLabel ?? placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={handleToggle}
          className={`${selectTriggerClassName} text-right ${
            !hasValue ? "text-ash" : ""
          }`}
        >
          <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-mute transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      )}

      <FloatingPanel
        isOpen={isOpen}
        onClose={close}
        triggerRef={triggerRef}
        title={panelTitle ?? placeholder}
        contentClassName="py-1"
        elevated={elevated}
      >
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="max-h-[min(60vh,320px)] overflow-y-auto overscroll-contain"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={panelOptionClassName(isSelected, option.disabled)}
                >
                  <span className="min-w-0 flex-1">{option.label}</span>
                  {isSelected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-primary-deep"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </FloatingPanel>
    </div>
  );
}
