import navProfile from "@media/nav-profile.png";
import { Building2, IdCard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ProfileAvatar } from "../../components/profile/ProfileAvatar";
import { ProfileInfoList } from "../../components/profile/ProfileInfoList";
import { Skeleton } from "../../components/ui/Skeleton";
import { useProfile } from "../../hooks/useProfile";
import { formatProfileValue, getProfileFullName } from "../../types/auth";

export function SupervisorProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, error, refetch } = useProfile();

  const avatarUrl = profile?.profile_image || navProfile;

  const profileItems = profile
    ? [
        {
          icon: User,
          label: "نام و نام خانوادگی",
          value: getProfileFullName(profile),
        },
        {
          icon: IdCard,
          label: "شماره پرسنلی",
          value: formatProfileValue(profile.personnel_code),
        },
        {
          icon: Building2,
          label: "بلوک تحت نظارت",
          value: formatProfileValue(profile.block_name),
        },
      ]
    : [];

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
          <div
            role="alert"
            className="rounded-lg border border-error/20 bg-error-pale px-4 py-3 text-center text-body-sm text-error"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-md bg-secondary-bg px-4 py-2 text-button-sm text-on-secondary transition-colors hover:bg-secondary-pressed"
            >
              تلاش مجدد
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <>
            <Skeleton className="mx-auto h-28 w-28 rounded-full sm:h-32 sm:w-32" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </>
        ) : profile ? (
          <>
            <ProfileAvatar imageUrl={avatarUrl} alt="تصویر پروفایل" />
            <ProfileInfoList items={profileItems} />
          </>
        ) : null}
      </main>

      <BottomNav variant="supervisor" activeTab="profile" />
    </div>
  );
}
