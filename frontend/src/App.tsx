import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/student/DashboardPage";
import { CleaningRequestPage } from "./pages/student/CleaningRequestPage";
import { MaintenanceReportPage } from "./pages/student/MaintenanceReportPage";
import { BoothRequestPage } from "./pages/student/BoothRequestPage";
import { ClassRegistrationPage } from "./pages/student/ClassRegistrationPage";
import { MyRequestsPage } from "./pages/student/MyRequestsPage";
import { ProfilePage } from "./pages/student/ProfilePage";
import { RoomSuppliesRequestPage } from "./pages/student/RoomSuppliesRequestPage";
import { NewIdeaPage } from "./pages/student/NewIdeaPage";
import { NewComplaintPage } from "./pages/student/NewComplaintPage";
import { IdeasComplaintsMenuPage } from "./pages/student/IdeasComplaintsMenuPage";
import { ViewIdeasPage } from "./pages/student/ViewIdeasPage";
import { AnnouncementsPage } from "./pages/student/AnnouncementsPage";
import { CreateAnnouncementPage } from "./pages/supervisor/CreateAnnouncementPage";
import { SupervisorAnnouncementsPage } from "./pages/supervisor/SupervisorAnnouncementsPage";
import { SupervisorDashboardPage } from "./pages/supervisor/SupervisorDashboardPage";
import { SupervisorIdeasComplaintsPage } from "./pages/supervisor/SupervisorIdeasComplaintsPage";
import { SupervisorRequestsPage } from "./pages/supervisor/SupervisorRequestsPage";
import { SupervisorClassesPage } from "./pages/supervisor/SupervisorClassesPage";
import { SupervisorProfilePage } from "./pages/supervisor/SupervisorProfilePage";

function PagePlaceholder({ title }: { title: string }) {
  return (
    <main className="page-gradient flex min-h-screen items-center justify-center px-4 pb-24">
      <p className="text-heading-xl text-ink">{title}</p>
    </main>
  );
}

function AuthRedirect() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <>
      <AuthRedirect />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/maintenance-request"
          element={<MaintenanceReportPage />}
        />
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
        <Route
          path="/supervisor/dashboard"
          element={<SupervisorDashboardPage />}
        />
        <Route path="/supervisor/profile" element={<SupervisorProfilePage />} />
        <Route
          path="/supervisor/announcements"
          element={<SupervisorAnnouncementsPage />}
        />
        <Route
          path="/supervisor/announcements/new"
          element={<CreateAnnouncementPage />}
        />
        <Route
          path="/supervisor/requests"
          element={<SupervisorRequestsPage />}
        />
        <Route path="/supervisor/classes" element={<SupervisorClassesPage />} />
        <Route
          path="/supervisor/ideas-complaints"
          element={<SupervisorIdeasComplaintsPage />}
        />
        <Route
          path="/admin/dashboard"
          element={<PagePlaceholder title="داشبورد مدیر" />}
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
