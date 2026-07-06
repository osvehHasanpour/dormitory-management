interface SupervisorRequestEmptyStateProps {
  filterLabel: string;
}

export function SupervisorRequestEmptyState({
  filterLabel,
}: SupervisorRequestEmptyStateProps) {
  return (
    <div className="flex flex-col items-center glass-card border-dashed px-6 py-12 text-center">
      <p className="text-heading-md text-ink">درخواستی یافت نشد</p>
      <p className="mt-2 max-w-sm text-body-sm text-body-text">
        در بخش «{filterLabel}» هنوز درخواستی ثبت نشده است.
      </p>
    </div>
  );
}
