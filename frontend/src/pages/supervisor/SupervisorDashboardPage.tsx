import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageShell } from "../../components/layout/PageShell";
import { DashboardBanner } from "../../components/dashboard/DashboardBanner";
import { FeatureCard } from "../../components/dashboard/FeatureCard";
import { supervisorDashboardItems } from "../../data/supervisorDashboardItems";

export function SupervisorDashboardPage() {
  return (
    <PageShell>
      <DashboardBanner />

      <ContentContainer as="main" className="relative -mt-4 pb-8 pt-6 md:-mt-6 md:pt-8">
        <div className="glass-card rounded-lg p-4 shadow-elevated sm:p-6 md:mx-auto md:max-w-2xl lg:max-w-3xl">
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-6">
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
      </ContentContainer>

      <BottomNav variant="supervisor" activeTab="home" />
    </PageShell>
  );
}
