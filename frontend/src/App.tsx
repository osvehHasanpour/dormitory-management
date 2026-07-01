import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/student/DashboardPage'
import { CleaningRequestPage } from './pages/student/CleaningRequestPage'
import { MaintenanceReportPage } from './pages/student/MaintenanceReportPage'
import { BoothRequestPage } from './pages/student/BoothRequestPage'
import { ClassRegistrationPage } from './pages/student/ClassRegistrationPage'
import { MyRequestsPage } from './pages/student/MyRequestsPage'
import { ProfilePage } from './pages/student/ProfilePage'
import { RoomSuppliesRequestPage } from './pages/student/RoomSuppliesRequestPage'
import { NewIdeaPage } from './pages/student/NewIdeaPage'
import { NewComplaintPage } from './pages/student/NewComplaintPage'
import { IdeasComplaintsMenuPage } from './pages/student/IdeasComplaintsMenuPage'
import { ViewIdeasPage } from './pages/student/ViewIdeasPage'
import { AnnouncementsPage } from './pages/student/AnnouncementsPage'
import { SupervisorDashboardPage } from './pages/supervisor/SupervisorDashboardPage'
import { SupervisorProfilePage } from './pages/supervisor/SupervisorProfilePage'

function PagePlaceholder({ title }: { title: string }) {
  return (
    <main className="page-gradient flex min-h-screen items-center justify-center px-4 pb-24">
      <p className="text-heading-xl text-ink">{title}</p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/maintenance-request" element={<MaintenanceReportPage />} />
      <Route path="/cleaning-request" element={<CleaningRequestPage />} />
      <Route path="/item-request" element={<RoomSuppliesRequestPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/booth-request" element={<BoothRequestPage />} />
      <Route path="/class-registration" element={<ClassRegistrationPage />} />
      <Route path="/ideas-complaints" element={<IdeasComplaintsMenuPage />} />
      <Route path="/view-ideas" element={<ViewIdeasPage />} />
      <Route path="/ideas" element={<NewIdeaPage />} />
      <Route path="/complaints" element={<NewComplaintPage />} />
      <Route path="/my-requests" element={<MyRequestsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
      <Route path="/supervisor/profile" element={<SupervisorProfilePage />} />
      <Route
        path="/supervisor/announcements"
        element={<PagePlaceholder title="اطلاعیه‌های خوابگاه" />}
      />
      <Route
        path="/supervisor/requests"
        element={<PagePlaceholder title="پیگیری درخواست‌ها" />}
      />
      <Route
        path="/supervisor/classes"
        element={<PagePlaceholder title="مدیریت کلاس‌ها" />}
      />
      <Route
        path="/supervisor/ideas-complaints"
        element={<PagePlaceholder title="ایده‌ها و شکایات" />}
      />
      <Route path="/admin/dashboard" element={<PagePlaceholder title="داشبورد مدیر" />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
