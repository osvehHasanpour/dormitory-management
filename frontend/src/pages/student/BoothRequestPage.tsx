import { useNavigate } from "react-router-dom";

import { BoothRequestForm } from "../../components/booth/BoothRequestForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function BoothRequestPage() {
  const navigate = useNavigate();

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">درخواست غرفه دانشجویی</h1>
          <div className="mt-4">
            <h2 className="text-heading-lg text-mute">ثبت جزئیات غرفه</h2>
          </div>
        </section>

        <BoothRequestForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
