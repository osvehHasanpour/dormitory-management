import culturalAnnouncements from "@media/cultural-announcements.jpg";
import culturalClassRegistration from "@media/cultural-class-registration.jpg";
import navExit from "@media/nav-exit.png";
import navHome from "@media/nav-home.png";
import navProfile from "@media/nav-profile.png";
import reportIcon from "@media/report.jpg";
import suggestionsFeedback from "@media/suggestions-feedback.jpg";

import type { BottomNavItem, DashboardItem } from "../types/dashboard";

export const supervisorDashboardItems: DashboardItem[] = [
  {
    id: "announcements",
    label: "اطلاعیه‌ها",
    image: culturalAnnouncements,
    route: "/supervisor/announcements",
  },
  {
    id: "requests",
    label: "پیگیری درخواست‌ها",
    image: reportIcon,
    route: "/supervisor/requests",
  },
  {
    id: "classes",
    label: "مدیریت کلاس‌ها",
    image: culturalClassRegistration,
    route: "/supervisor/classes",
  },
  {
    id: "ideas-complaints",
    label: "ایده‌ها و شکایات",
    image: suggestionsFeedback,
    route: "/supervisor/ideas-complaints",
  },
];

export const supervisorBottomNavItems: BottomNavItem[] = [
  { id: "exit", label: "خروج", image: navExit },
  {
    id: "profile",
    label: "پروفایل",
    image: navProfile,
    route: "/supervisor/profile",
  },
  { id: "home", label: "خانه", image: navHome, route: "/supervisor/dashboard" },
];
