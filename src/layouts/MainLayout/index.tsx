import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { DashboardHeader, DashboardSidebar } from '@/features/dashboard'

import styles from './MainLayout.module.css'

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const openMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(true)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')

    const handleChange = () => {
      if (media.matches) {
        setSidebarCollapsed(false)
      }
    }

    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className={styles.root}>
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      <div
        className={[styles.shell, sidebarCollapsed ? styles.shellCollapsed : ''].filter(Boolean).join(' ')}
      >
        <DashboardHeader onMenuClick={openMobileSidebar} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
