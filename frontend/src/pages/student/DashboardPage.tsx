import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageShell } from "../../components/layout/PageShell";
import { DashboardBanner } from "../../components/dashboard/DashboardBanner";
import { FeatureCard } from "../../components/dashboard/FeatureCard";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { culturalSection, serviceSection } from "../../data/dashboardItems";

export function DashboardPage() {
  const culturalFirstRow = culturalSection.items.slice(0, 3);
  const culturalSecondRow = culturalSection.items.slice(3);

  return (
    <PageShell>
      <DashboardBanner />

      <ContentContainer
        as="main"
        className="relative -mt-4 pb-8 pt-6 md:-mt-6 md:pt-8"
      >
        <section className="section-gap">
          <SectionHeader title={serviceSection.title} />
          <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-6">
            {serviceSection.items.map((item) => (
              <FeatureCard
                key={item.id}
                label={item.label}
                image={item.image}
                route={item.route}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title={culturalSection.title} />
          <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-6">
            {culturalFirstRow.map((item) => (
              <FeatureCard
                key={item.id}
                label={item.label}
                image={item.image}
                route={item.route}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:mx-auto md:mt-6 md:max-w-[66%] md:grid-cols-2 md:gap-6">
            {culturalSecondRow.map((item) => (
              <FeatureCard
                key={item.id}
                label={item.label}
                image={item.image}
                route={item.route}
              />
            ))}
          </div>
        </section>
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
