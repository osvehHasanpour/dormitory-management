import complaintImage from "@media/complaint.png";
import ideaImage from "@media/idea.png";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";

interface OptionCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
}

function OptionCard({ title, description, image, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card flex w-full min-w-0 items-center gap-4 rounded-lg p-5 text-right transition-colors active:bg-interactive-soft"
    >
      <img
        src={image}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full border border-hairline bg-surface-soft object-cover p-1 sm:h-16 sm:w-16"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="break-words text-heading-md text-ink">{title}</span>
        <span className="break-words text-body-sm text-mute">
          {description}
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-heading-lg text-mute">
        ‹
      </span>
    </button>
  );
}

export function IdeasComplaintsMenuPage() {
  const navigate = useNavigate();

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main" className="max-w-xl">
        <p className="mb-7 text-center text-body-md text-ink">
          لطفاً یکی از گزینه‌های زیر را انتخاب کنید
        </p>

        <div className="mx-auto flex w-full flex-col gap-5">
          <OptionCard
            title="ثبت ایده جدید"
            description="ایده‌ها و نظرات سازنده خود را با ما به اشتراک بگذارید."
            image={ideaImage}
            onClick={() => navigate("/ideas")}
          />
          <OptionCard
            title="ثبت شکایت جدید"
            description="موضوع شکایت خود را ثبت کنید تا در سریع‌ترین زمان بررسی شود."
            image={complaintImage}
            onClick={() => navigate("/complaints")}
          />
        </div>
      </ContentContainer>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
