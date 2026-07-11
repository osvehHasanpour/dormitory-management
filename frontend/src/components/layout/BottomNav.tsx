import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";

import { bottomNavItems } from "../../data/dashboardItems";
import { supervisorBottomNavItems } from "../../data/supervisorDashboardItems";
import { useAuth } from "../../hooks/useAuth";
import type { BottomNavTab } from "../../types/dashboard";
import { logoutRequest } from "../../services/authService";
import {
  LogoutConfirmDialog,
  type DialogAnchor,
} from "../profile/LogoutConfirmDialog";
import { ContentContainer } from "./ContentContainer";

interface BottomNavProps {
  activeTab?: BottomNavTab | null;
  variant?: "student" | "supervisor";
}

export function BottomNav({
  activeTab = null,
  variant = "student",
}: BottomNavProps) {
  const navigate = useNavigate();
  const { logout, tokens } = useAuth();
  const [logoutAnchor, setLogoutAnchor] = useState<DialogAnchor | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const openLogoutDialog = useCallback((anchor: DialogAnchor) => {
    setLogoutAnchor(anchor);
    setIsLogoutDialogOpen(true);
  }, []);

  const closeLogoutDialog = useCallback(() => {
    setIsLogoutDialogOpen(false);
    setLogoutAnchor(null);
  }, []);

  const confirmLogout = useCallback(async () => {
    closeLogoutDialog();
    navigate("/login", { replace: true });
    if (tokens?.refresh) {
      await logoutRequest(tokens.refresh);
    }
    logout();
  }, [closeLogoutDialog, logout, navigate, tokens?.refresh]);

  const navItems =
    variant === "supervisor" ? supervisorBottomNavItems : bottomNavItems;

  const handleTabClick = (
    tab: BottomNavTab,
    route?: string,
    button?: HTMLButtonElement | null,
  ) => {
    if (tab === "exit") {
      const rect = button?.getBoundingClientRect();
      openLogoutDialog(
        rect
          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          : { x: window.innerWidth / 2, y: window.innerHeight - 40 },
      );
      return;
    }

    if (route) {
      navigate(route);
    }
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg bg-surface-dark px-1 pb-[env(safe-area-inset-bottom)] pt-2 sm:px-2"
        aria-label="ناوبری اصلی"
      >
        <ContentContainer className="max-w-lg lg:max-w-2xl">
          <ul className="flex items-end justify-around gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const isActive = activeTab != null && item.id === activeTab;

              return (
                <li key={item.id} className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(event) =>
                      handleTabClick(item.id, item.route, event.currentTarget)
                    }
                    className="mx-auto flex min-h-11 min-w-0 max-w-[5.5rem] flex-col items-center gap-0.5 px-1 py-1 sm:gap-1 sm:px-2"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className={`h-9 w-9 object-contain transition-opacity sm:h-10 sm:w-10 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                    />
                    <span
                      className={`max-w-full truncate text-[10px] leading-tight sm:text-caption-sm ${
                        isActive
                          ? "font-semibold text-primary"
                          : "text-on-dark/80"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ContentContainer>
      </nav>

      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        anchor={logoutAnchor}
        onConfirm={confirmLogout}
        onCancel={closeLogoutDialog}
      />
    </>
  );
}
