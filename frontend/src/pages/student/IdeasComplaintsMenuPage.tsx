import complaintImage from '@media/complaint.png'
import ideaImage from '@media/idea.png'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'

interface OptionCardProps {
  title: string
  description: string
  image: string
  onClick: () => void
}

function OptionCard({ title, description, image, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card flex w-full items-center gap-4 rounded-lg p-5 text-right transition-colors active:bg-white/60"
    >
      <img
        src={image}
        alt=""
        className="h-16 w-16 flex-shrink-0 rounded-full border border-hairline bg-surface-soft object-cover p-1"
      />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="text-heading-md text-ink">{title}</span>
        <span className="text-body-sm text-mute">{description}</span>
      </span>
      <span aria-hidden="true" className="text-heading-lg text-mute">
        ‹
      </span>
    </button>
  )
}

export function IdeasComplaintsMenuPage() {
  const navigate = useNavigate()

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

      <main className="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6">
        <p className="mb-7 text-center text-body-md text-ink">
          لطفاً یکی از گزینه‌های زیر را انتخاب کنید
        </p>

        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          <OptionCard
            title="ثبت ایده جدید"
            description="ایده‌ها و نظرات سازنده خود را با ما به اشتراک بگذارید."
            image={ideaImage}
            onClick={() => navigate('/ideas')}
          />
          <OptionCard
            title="ثبت شکایت جدید"
            description="موضوع شکایت خود را ثبت کنید تا در سریع‌ترین زمان بررسی شود."
            image={complaintImage}
            onClick={() => navigate('/complaints')}
          />
        </div>
      </main>

      <BottomNav activeTab="home" />
    </div>
  )
}
