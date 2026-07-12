import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { MaintenanceReportForm } from "../../components/maintenance/MaintenanceReportForm";

export function MaintenanceReportPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">گزارش خرابی</h1>
          <p className="mt-2 text-heading-md text-mute">ثبت درخواست خرابی</p>
        </section>

        <MaintenanceReportForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
