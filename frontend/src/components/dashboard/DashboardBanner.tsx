import homeDashboard from "@media/home_dashboard.jpg";

export function DashboardBanner() {
  return (
    <div className="w-full max-h-48 overflow-hidden sm:max-h-56 md:max-h-64 lg:max-h-none">
      <img
        src={homeDashboard}
        alt="داشبورد خوابگاه"
        className="block h-auto w-full object-cover"
      />
    </div>
  );
}
