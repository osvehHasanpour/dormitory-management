import newIdeaHero from "@media/idea.png";
import { useNavigate } from "react-router-dom";

import { IdeaRequestForm } from "../../components/idea/IdeaRequestForm";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

export function NewIdeaPage() {
  const navigate = useNavigate();

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-page-title text-ink">ثبت ایده جدید</h1>
          <img
            src={newIdeaHero}
            alt="تصویر ثبت ایده جدید"
            className="mt-5 h-24 w-24 rounded-full border border-hairline bg-canvas object-cover p-1 shadow-elevated sm:h-28 sm:w-28"
          />
          <p className="mt-4 max-w-sm break-words px-2 text-body-md text-mute">
            ما منتظر ایده‌ها و نظرات سازنده شما هستیم.
          </p>
        </section>

        <IdeaRequestForm />
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
