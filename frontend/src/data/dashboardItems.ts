import culturalAnnouncements from '@media/cultural-announcements.jpg'
import culturalClassRegistration from '@media/cultural-class-registration.jpg'
import culturalStallRequest from '@media/cultural-stall-request.jpg'
import ideasProposals from '@media/ideas-proposals.jpg'
import navExit from '@media/nav-exit.png'
import navHome from '@media/nav-home.png'
import navProfile from '@media/nav-profile.png'
import navReport from '@media/nav-report.png'
import serviceCleaningRequest from '@media/service-cleaning-request.jpg'
import serviceRepairTools from '@media/service-repair-tools.jpg'
import serviceRoomSupplies from '@media/service-room-supplies.jpg'
import suggestionsFeedback from '@media/suggestions-feedback.jpg'

import type { BottomNavItem, DashboardSection } from '../types/dashboard'

export const serviceSection: DashboardSection = {
  id: 'services',
  title: 'خدمات',
  items: [
    {
      id: 'repair',
      label: 'گزارش خرابی',
      image: serviceRepairTools,
      route: '/maintenance-request',
    },
    {
      id: 'cleaning',
      label: 'درخواست نظافت',
      image: serviceCleaningRequest,
      route: '/cleaning-request',
    },
    {
      id: 'supplies',
      label: 'درخواست لوازم اتاق',
      image: serviceRoomSupplies,
      route: '/item-request',
    },
  ],
}

export const culturalSection: DashboardSection = {
  id: 'cultural',
  title: 'فرهنگی',
  items: [
    {
      id: 'announcements',
      label: 'اطلاعیه‌ها',
      image: culturalAnnouncements,
      route: '/announcements',
    },
    {
      id: 'booth',
      label: 'درخواست غرفه',
      image: culturalStallRequest,
      route: '/booth-request',
    },
    {
      id: 'class-registration',
      label: 'ثبت نام کلاس',
      image: culturalClassRegistration,
      route: '/class-registration',
    },
    {
      id: 'ideas',
      label: 'ایده‌ها و پیشنهادات',
      image: ideasProposals,
      route: '/view-ideas',
    },
    {
      id: 'complaints',
      label: 'پیشنهادات و شکایات',
      image: suggestionsFeedback,
      route: '/ideas-complaints',
    },
  ],
}

export const bottomNavItems: BottomNavItem[] = [
  { id: 'exit', label: 'خروج', image: navExit },
  { id: 'requests', label: 'پیگیری درخواست', image: navReport, route: '/my-requests' },
  { id: 'profile', label: 'پروفایل', image: navProfile, route: '/profile' },
  { id: 'home', label: 'خانه', image: navHome, route: '/dashboard' },
]
