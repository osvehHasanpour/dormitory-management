import { useNavigate } from "react-router-dom";

import { AnnouncementForm } from "../../components/announcement/AnnouncementForm";
import { BottomNav } from "../../components/layout/BottomNav";

export function CreateAnnouncementPage() {
  const navigate = useNavigate();

  return (
    <div className="page-gradient min-h-screen pb-32">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">ثبت اطلاعیه جدید</h1>
        </section>

        <AnnouncementForm />
      </main>

      <BottomNav variant="supervisor" activeTab="home" />
    </div>
  );
}
