import { BottomNav } from '../../components/layout/BottomNav'
import { DashboardBanner } from '../../components/dashboard/DashboardBanner'
import { FeatureCard } from '../../components/dashboard/FeatureCard'
import { supervisorDashboardItems } from '../../data/supervisorDashboardItems'

export function SupervisorDashboardPage() {
  return (
    <div className="page-gradient min-h-screen pb-24">
      <DashboardBanner />

      <main className="relative -mt-4 px-4 pb-8 pt-6 sm:px-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="glass-card rounded-lg p-4 shadow-elevated sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              {supervisorDashboardItems.map((item) => (
                <FeatureCard
                  key={item.id}
                  label={item.label}
                  image={item.image}
                  route={item.route}
                  size="large"
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav variant="supervisor" activeTab="home" />
    </div>
  )
}
