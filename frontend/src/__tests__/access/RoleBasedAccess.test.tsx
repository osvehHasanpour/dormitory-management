import { render, screen } from "@testing-library/react";

import { SupervisorDashboardPage } from "../../pages/supervisor/SupervisorDashboardPage";
import { TestProviders } from "../../test/testProviders";
import type { AuthContextValue } from "../../context/authContext";

jest.mock("../../components/layout/BottomNav", () => ({
  BottomNav: () => <nav aria-label="bottom-nav-mock" />,
}));

function createStudentAuth(): AuthContextValue {
  return {
    user: {
      id: 1,
      personnel_code: "401234567",
      first_name: "Test",
      last_name: "Student",
      role: "student",
      full_name: "Test Student",
      is_active: true,
    },
    tokens: { access: "access-token", refresh: "refresh-token" },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  };
}

/**
 * component_test.md expects students to be blocked from supervisor-only pages.
 * App.tsx currently only redirects unauthenticated users, not by role.
 */
describe("Role-Based Access – Scenario 1: Unauthorized Access", () => {
  it("documents mismatch: authenticated students can access supervisor dashboard", () => {
    render(
      <TestProviders
        auth={createStudentAuth()}
        initialEntries={["/supervisor/dashboard"]}
      >
        <SupervisorDashboardPage />
      </TestProviders>,
    );

    expect(screen.getByText("اطلاعیه‌ها")).toBeInTheDocument();
    expect(screen.getByText("مدیریت کلاس‌ها")).toBeInTheDocument();
    expect(screen.queryByText(/دسترسی|مجاز نیست|Unauthorized/i)).toBeNull();
  });
});
