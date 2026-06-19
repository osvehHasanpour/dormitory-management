import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'

import { bottomNavItems } from '../../data/dashboardItems'
import { useAuth } from '../../hooks/useAuth'
import type { BottomNavTab } from '../../types/dashboard'
import {
  LogoutConfirmDialog,
  type DialogAnchor,
} from '../profile/LogoutConfirmDialog'

interface BottomNavProps {
  activeTab?: BottomNavTab | null
}

export function BottomNav({ activeTab = null }: BottomNavProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [logoutAnchor, setLogoutAnchor] = useState<DialogAnchor | null>(null)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const openLogoutDialog = useCallback((anchor: DialogAnchor) => {
    setLogoutAnchor(anchor)
    setIsLogoutDialogOpen(true)
  }, [])

  const closeLogoutDialog = useCallback(() => {
    setIsLogoutDialogOpen(false)
    setLogoutAnchor(null)
  }, [])

  const confirmLogout = useCallback(() => {
    closeLogoutDialog()
    logout()
    navigate('/login', { replace: true })
  }, [closeLogoutDialog, logout, navigate])

  const handleTabClick = (tab: BottomNavTab, route?: string, button?: HTMLButtonElement | null) => {
    if (tab === 'exit') {
      const rect = button?.getBoundingClientRect()
      openLogoutDialog(
        rect
          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          : { x: window.innerWidth / 2, y: window.innerHeight - 40 },
      )
      return
    }

    if (route) {
      navigate(route)
    }
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg bg-surface-dark px-2 pb-[env(safe-area-inset-bottom)] pt-2"
        aria-label="ناوبری اصلی"
      >
        <ul className="mx-auto flex max-w-lg items-end justify-around">
          {bottomNavItems.map((item) => {
            const isActive = activeTab != null && item.id === activeTab

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={(event) => handleTabClick(item.id, item.route, event.currentTarget)}
                  className="flex min-w-[64px] flex-col items-center gap-1 px-2 py-1"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <img
                    src={item.image}
                    alt=""
                    className={`h-10 w-10 object-contain transition-opacity sm:h-11 sm:w-11 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  <span
                    className={`text-caption-sm leading-tight ${
                      isActive ? 'font-semibold text-primary' : 'text-on-dark/80'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        anchor={logoutAnchor}
        onConfirm={confirmLogout}
        onCancel={closeLogoutDialog}
      />
    </>
  )
}
