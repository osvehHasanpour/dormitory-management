import { render, screen, fireEvent } from "@testing-library/react";

import { LogoutConfirmDialog } from "../../components/profile/LogoutConfirmDialog";

describe("LogoutConfirmDialog", () => {
  it("does not render when closed", () => {
    render(
      <LogoutConfirmDialog
        isOpen={false}
        anchor={null}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("calls onCancel when clicking the scrim", () => {
    const onCancel = jest.fn();

    render(
      <LogoutConfirmDialog
        isOpen
        anchor={{ x: 0, y: 0 }}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "بستن" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel on Escape key", () => {
    const onCancel = jest.fn();

    render(
      <LogoutConfirmDialog
        isOpen
        anchor={{ x: 0, y: 0 }}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when user confirms", () => {
    const onConfirm = jest.fn();

    render(
      <LogoutConfirmDialog
        isOpen
        anchor={{ x: 0, y: 0 }}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "بله خروج" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
