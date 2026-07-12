export const formLabelClassName =
  "mb-2 block text-body-sm-strong text-ink break-words";

export const formErrorClassName = "mt-2 text-body-sm text-error break-words";

export const selectTriggerClassName =
  "flex h-12 min-h-12 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-stone bg-canvas px-4 text-body-md text-ink shadow-[0_2px_8px_rgba(46,17,69,0.04)] outline-none transition-[border-color,box-shadow,transform] focus-visible:border-2 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-ash";

export const fieldInputClassName =
  "w-full min-w-0 max-w-full rounded-lg border border-stone bg-canvas px-4 py-3 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30";

/** Shared option row inside dropdown / picker panels */
export const panelOptionClassName = (isSelected: boolean, isDisabled = false) =>
  `flex min-h-12 w-full items-center justify-between gap-3 px-5 py-3 text-right text-body-md transition-colors ${
    isDisabled
      ? "cursor-not-allowed text-ash"
      : isSelected
        ? "bg-primary-ultra-light font-bold text-ink"
        : "text-body-text hover:bg-primary/10 active:bg-primary/15"
  }`;
