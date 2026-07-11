import { render, screen, waitFor } from "@testing-library/react";

import { AnnouncementsPage } from "../../pages/student/AnnouncementsPage";
import { TestProviders } from "../../test/testProviders";
import type { AuthContextValue } from "../../context/authContext";
import type { AnnouncementListItem } from "../../types/announcement";

const mockFetchAnnouncements = jest.fn();

jest.mock("../../services/announcementService", () => ({
  fetchAnnouncements: (...args: unknown[]) => mockFetchAnnouncements(...args),
}));

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

const sampleAnnouncement: AnnouncementListItem = {
  id: 1,
  title: "اطلاعیه مهم",
  content: "جلسه عمومی فردا برگزار می‌شود.",
  is_active: true,
  created_at: "2026-07-01T10:00:00Z",
  created_by: {
    id: 2,
    personnel_code: "900000001",
    first_name: "سرپرست",
    last_name: "سامانه",
    display_name: "سرپرست سامانه",
  },
};

describe("Announcements – Scenario 2: View Announcements", () => {
  beforeEach(() => {
    mockFetchAnnouncements.mockReset();
  });

  it("displays available announcements for the student", async () => {
    mockFetchAnnouncements.mockResolvedValue({ results: [sampleAnnouncement] });

    render(
      <TestProviders
        auth={createStudentAuth()}
        initialEntries={["/announcements"]}
      >
        <AnnouncementsPage />
      </TestProviders>,
    );

    expect(screen.getByText("لیست اطلاعیه‌ها")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("اطلاعیه مهم")).toBeInTheDocument();
    });

    expect(
      screen.getAllByText("جلسه عمومی فردا برگزار می‌شود.").length,
    ).toBeGreaterThan(0);
    expect(mockFetchAnnouncements).toHaveBeenCalledWith("access-token");
  });
});
