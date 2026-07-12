import { useNavigate } from "react-router-dom";

import { AnnouncementForm } from "../../components/announcement/AnnouncementForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function CreateAnnouncementPage() {
  const navigate = useNavigate();

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">ثبت اطلاعیه جدید</h1>
          <p className="mt-2 text-body-sm text-mute">
            لطفاً موضوع و متن اطلاعیه را وارد کنید
          </p>
        </section>

        <AnnouncementForm />
      </ContentContainer>

      <BottomNav variant="supervisor" activeTab="home" />
    </PageShell>
  );
}
