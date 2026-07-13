import { Building2, DoorOpen, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { FloatingThemeButton } from "../../components/profile/FloatingThemeButton";
import { ProfileHeaderCard } from "../../components/profile/ProfileHeaderCard";
import { ProfileInfoList } from "../../components/profile/ProfileInfoList";
import { Skeleton } from "../../components/ui/Skeleton";
import { useProfile } from "../../hooks/useProfile";
import { formatProfileValue, getProfileFullName } from "../../types/auth";

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, error } = useProfile();

  const profileItems = profile
    ? [
        {
          icon: IdCard,
          label: "شماره دانشجویی",
          value: formatProfileValue(profile.personnel_code),
        },
        {
          icon: Building2,
          label: "بلوک",
          value: formatProfileValue(profile.block_name),
        },
        {
          icon: DoorOpen,
          label: "اتاق",
          value: formatProfileValue(profile.room_number),
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
      </ContentContainer>

      <BottomNav activeTab="profile" />
    </PageShell>
  );
}
