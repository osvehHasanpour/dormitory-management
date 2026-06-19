import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '../ui/ConfirmDialog'
import { bottomNavItems } from '../../data/dashboardItems'
import { useAuth } from '../../hooks/useAuth'
import type { BottomNavTab } from '../../types/dashboard'

interface BottomNavProps {
  activeTab: BottomNavTab
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [dialogOrigin, setDialogOrigin] = useState({ x: window.innerWidth / 2, y: window.innerHeight })
  const exitButtonRef = useRef<HTMLButtonElement>(null)

  const openLogoutDialog = () => {
    const button = exitButtonRef.current
    if (button) {
      const rect = button.getBoundingClientRect()
      setDialogOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
    setLogoutDialogOpen(true)
  }

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const handleTabClick = (tab: BottomNavTab, route?: string) => {
    if (tab === 'exit') {
      openLogoutDialog()
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
            const isActive = item.id === activeTab
            const isExit = item.id === 'exit'

            return (
              <li key={item.id}>
                <button
                  ref={isExit ? exitButtonRef : undefined}
                  type="button"
                  onClick={() => handleTabClick(item.id, item.route)}
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

      <ConfirmDialog
        open={logoutDialogOpen}
        title="خروج از حساب"
        message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خارج شوید؟"
        confirmLabel="بله، خروج"
        cancelLabel="خیر"
        originX={dialogOrigin.x}
        originY={dialogOrigin.y}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  )
}
