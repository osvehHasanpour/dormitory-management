import { Building2, DoorOpen, IdCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { ProfileHeaderCard } from '../../components/profile/ProfileHeaderCard'
import { ProfileInfoList } from '../../components/profile/ProfileInfoList'
import { Skeleton } from '../../components/ui/Skeleton'
import { useProfile } from '../../hooks/useProfile'
import {
  formatProfileValue,
  getProfileFullName,
} from '../../types/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, isLoading, error } = useProfile()

  const profileItems = profile
    ? [
        { icon: IdCard, label: 'شماره دانشجویی', value: formatProfileValue(profile.personnel_code) },
        { icon: Building2, label: 'بلوک', value: formatProfileValue(profile.block_name) },
        { icon: DoorOpen, label: 'اتاق', value: formatProfileValue(profile.room_number) },
      ]
    : []

  return (
    <div className="page-gradient min-h-screen pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
        <h1 className="text-heading-lg text-ink">پروفایل</h1>
      </header>

      <main className="mx-auto w-full max-w-lg space-y-4 px-4 sm:px-6">
        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-pale px-4 py-3 text-center text-body-sm text-error">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <>
            <Skeleton className="h-[88px] w-full rounded-lg" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </>
        ) : profile ? (
          <>
            <ProfileHeaderCard
              name={getProfileFullName(profile)}
              subtitle={formatProfileValue(profile.personnel_code)}
              imageUrl={profile.profile_image}
            />
            <ProfileInfoList items={profileItems} />
          </>
        ) : null}
      </main>

      <BottomNav activeTab="profile" />
    </div>
  )
}
