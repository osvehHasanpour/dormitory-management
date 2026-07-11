import complaintHero from "@media/complaint.png";
import { useNavigate } from "react-router-dom";

import { ComplaintRequestForm } from "../../components/complaint/ComplaintRequestForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function NewComplaintPage() {
  const navigate = useNavigate();

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-page-title text-ink">ثبت شکایت جدید</h1>
          <img
            src={complaintHero}
            alt="تصویر ثبت شکایت جدید"
            className="mt-5 h-24 w-24 rounded-full border border-hairline bg-canvas object-cover p-1 shadow-elevated sm:h-28 sm:w-28"
          />
          <p className="mt-4 max-w-sm break-words px-2 text-body-md text-mute">
            ما همیشه آماده شنیدن صدای شما هستیم.
          </p>
        </section>

        <ComplaintRequestForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
