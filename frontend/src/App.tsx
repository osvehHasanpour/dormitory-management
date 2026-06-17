import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginPage } from './pages/auth/LoginPage'

function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-soft px-4">
      <p className="text-heading-xl text-ink">{title}</p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPlaceholder title="داشبورد دانشجو" />} />
      <Route
        path="/supervisor/dashboard"
        element={<DashboardPlaceholder title="داشبورد سرپرست" />}
      />
      <Route path="/admin/dashboard" element={<DashboardPlaceholder title="داشبورد مدیر" />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
