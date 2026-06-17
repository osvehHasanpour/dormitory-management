import homeDashboard from '@media/home_dashboard.jpg'

export function DashboardBanner() {
  return (
    <div className="w-full overflow-hidden rounded-b-lg">
      <img
        src={homeDashboard}
        alt="داشبورد خوابگاه"
        className="block h-auto w-full object-cover"
      />
    </div>
  )
}
