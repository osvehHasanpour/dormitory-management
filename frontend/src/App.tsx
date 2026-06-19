import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/student/DashboardPage'
import { CleaningRequestPage } from './pages/student/CleaningRequestPage'
import { MaintenanceReportPage } from './pages/student/MaintenanceReportPage'
import { BoothRequestPage } from './pages/student/BoothRequestPage'
import { RoomSuppliesRequestPage } from './pages/student/RoomSuppliesRequestPage'

function PagePlaceholder({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-soft px-4 pb-24">
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
      <Route path="/announcements" element={<PagePlaceholder title="اطلاعیه‌ها" />} />
      <Route path="/booth-request" element={<BoothRequestPage />} />
      <Route path="/class-registration" element={<PagePlaceholder title="ثبت نام کلاس" />} />
      <Route path="/ideas" element={<PagePlaceholder title="ایده‌ها و پیشنهادات" />} />
      <Route path="/complaints" element={<PagePlaceholder title="پیشنهادات و شکایات" />} />
      <Route path="/my-requests" element={<PagePlaceholder title="پیگیری درخواست" />} />
      <Route path="/profile" element={<PagePlaceholder title="پروفایل" />} />
      <Route
        path="/supervisor/dashboard"
        element={<PagePlaceholder title="داشبورد سرپرست" />}
      />
      <Route path="/admin/dashboard" element={<PagePlaceholder title="داشبورد مدیر" />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
