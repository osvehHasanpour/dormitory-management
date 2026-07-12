import navProfile from "@media/nav-profile.png";
import { Building2, IdCard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { FloatingThemeButton } from "../../components/profile/FloatingThemeButton";
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
    <PageShell>
      <PageHeader
        title="پروفایل"
        onBack={() => navigate(-1)}
        leftAction={<FloatingThemeButton />}
      />

      <ContentContainer as="main" className="space-y-4 md:max-w-xl">
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
      </ContentContainer>

      <BottomNav variant="supervisor" activeTab="profile" />
    </PageShell>
  );
}
