interface SupervisorClassEmptyStateProps {
  filterLabel: string;
}

export function SupervisorClassEmptyState({
  filterLabel,
}: SupervisorClassEmptyStateProps) {
  return (
    <div className="flex flex-col items-center glass-card border-dashed px-6 py-12 text-center">
      <p className="text-heading-md text-ink">کلاسی یافت نشد</p>
      <p className="mt-2 max-w-sm text-body-sm text-body-text">
        در بخش «{filterLabel}» هنوز کلاسی ثبت نشده است. با دکمه «ثبت کلاس جدید»
        می‌توانید کلاس اضافه کنید.
      </p>
    </div>
  );
}
