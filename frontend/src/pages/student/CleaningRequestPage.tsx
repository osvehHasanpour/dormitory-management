import { useNavigate } from "react-router-dom";

import { CleaningRequestForm } from "../../components/cleaning/CleaningRequestForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function CleaningRequestPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">ثبت جزئیات درخواست نظافت</h1>
          <div className="mt-4">
            <h2 className="text-heading-lg text-mute">درخواست نظافت</h2>
          </div>
        </section>

        <CleaningRequestForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
