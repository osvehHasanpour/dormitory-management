import { useNavigate } from "react-router-dom";

import { ItemRequestForm } from "../../components/item/ItemRequestForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function RoomSuppliesRequestPage() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">ثبت جزئیات درخواست لوازم</h1>
          <div className="mt-4">
            <h2 className="text-heading-lg text-mute">درخواست لوازم اتاق</h2>
          </div>
        </section>

        <ItemRequestForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
