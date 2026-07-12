import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AnnouncementForm } from "../../components/announcement/AnnouncementForm";
import { TestProviders } from "../../test/testProviders";
import type { AuthContextValue } from "../../context/authContext";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCreateAnnouncement = jest.fn();

jest.mock("../../services/announcementService", () => ({
  createAnnouncement: (...args: unknown[]) => mockCreateAnnouncement(...args),
}));

function createSupervisorAuth(): AuthContextValue {
  return {
    user: {
      id: 2,
      personnel_code: "900000001",
      first_name: "Super",
      last_name: "Visor",
      role: "supervisor",
      full_name: "Super Visor",
      is_active: true,
    },
    tokens: { access: "access-token", refresh: "refresh-token" },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  };
}

describe("Announcements – Scenario 1: Create an Announcement", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreateAnnouncement.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates an announcement and shows a success message", async () => {
    mockCreateAnnouncement.mockResolvedValue({
      id: 1,
      title: "تعمیرات آب گرم",
      content: "آب گرم فردا قطع است.",
    });

    render(
      <TestProviders auth={createSupervisorAuth()}>
        <AnnouncementForm />
      </TestProviders>,
    );

    fireEvent.change(screen.getByPlaceholderText("مثال: تعمیرات آب گرم"), {
      target: { value: "تعمیرات آب گرم" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("متن کامل اطلاعیه را وارد کنید..."),
      { target: { value: "آب گرم فردا قطع است." } },
    );
    fireEvent.click(screen.getByRole("button", { name: "ارسال اطلاعیه" }));

    await waitFor(() => {
      expect(mockCreateAnnouncement).toHaveBeenCalledWith(
        { title: "تعمیرات آب گرم", content: "آب گرم فردا قطع است." },
        "access-token",
      );
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "اطلاعیه با موفقیت ثبت و ارسال شد",
    );

    jest.advanceTimersByTime(900);

    expect(mockNavigate).toHaveBeenCalledWith("/supervisor/announcements", {
      replace: true,
    });
  });
});
