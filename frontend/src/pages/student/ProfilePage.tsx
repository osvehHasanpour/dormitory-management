import { Building2, DoorOpen, IdCard, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { ProfileAvatar } from '../../components/profile/ProfileAvatar'
import { ProfileInfoCard } from '../../components/profile/ProfileInfoCard'
import { Skeleton } from '../../components/ui/Skeleton'
import { useProfile } from '../../hooks/useProfile'
import {
  formatProfileValue,
  getProfileFullName,
} from '../../types/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, isLoading, error } = useProfile()

  return (
    <div className="min-h-screen bg-surface-soft pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-2 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-heading-lg text-ink active:bg-primary/25 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-8 flex flex-col items-center">
          {isLoading ? (
            <Skeleton className="h-28 w-28 rounded-full sm:h-32 sm:w-32" />
          ) : (
            <ProfileAvatar
              imageUrl={profile?.profile_image}
              alt={profile ? getProfileFullName(profile) : 'پروفایل کاربر'}
            />
          )}
        </section>

        {error ? (
          <p className="mb-4 rounded-md border border-error/20 bg-error-pale px-4 py-3 text-center text-body-sm text-error">
            {error}
          </p>
        ) : null}

        <section className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
            </>
          ) : profile ? (
            <>
              <ProfileInfoCard
                icon={User}
                label="نام و نام خانوادگی"
                value={getProfileFullName(profile)}
              />
              <ProfileInfoCard
                icon={IdCard}
                label="شماره دانشجویی"
                value={formatProfileValue(profile.personnel_code)}
              />
              <ProfileInfoCard
                icon={Building2}
                label="بلوک"
                value={formatProfileValue(profile.block_name)}
              />
              <ProfileInfoCard
                icon={DoorOpen}
                label="اتاق"
                value={formatProfileValue(profile.room_number)}
              />
            </>
          ) : null}
        </section>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  )
}
