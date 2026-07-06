import { Link } from "react-router-dom";

export function RequestEmptyState() {
  return (
    <div className="flex flex-col items-center glass-card border-dashed px-6 py-12 text-center">
      <p className="text-heading-md text-ink">هنوز درخواستی ثبت نکرده‌اید</p>
      <p className="mt-2 max-w-sm text-body-sm text-body-text">
        از صفحه اصلی می‌توانید درخواست خرابی، نظافت، لوازم یا غرفه ثبت کنید.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-button-md text-on-primary transition-colors hover:bg-primary-pressed"
      >
        رفتن به صفحه اصلی
      </Link>
    </div>
  );
}
