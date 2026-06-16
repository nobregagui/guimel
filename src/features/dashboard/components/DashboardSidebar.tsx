import { NavLink, useLocation } from 'react-router-dom'

import { Logo, LOGO_CONTAINER_HEIGHT, LOGO_IMAGE_HEIGHT } from '@/components/ui'
import { sidebarNavItems } from '@/features/dashboard/data'
import { NavIcon } from '@/features/dashboard/icons'
import type { SidebarNavItem } from '@/features/dashboard/types'

import styles from './DashboardSidebar.module.css'

function isNavItemActive(item: SidebarNavItem, pathname: string): boolean {
  if (item.id === 'dashboard') {
    return pathname === '/' || pathname === '/dashboard'
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

interface DashboardSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const { pathname } = useLocation()

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        data-melgui-sidebar
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : '',
          mobileOpen ? styles.mobileOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.top}>
          <NavLink to="/dashboard" className={styles.logoLink} onClick={onCloseMobile}>
            <Logo
              className={styles.sidebarLogo}
              imgHeight={collapsed ? LOGO_CONTAINER_HEIGHT : LOGO_IMAGE_HEIGHT}
              markOnly={collapsed}
            />
          </NavLink>
          <button
            type="button"
            className={styles.collapseBtn}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={onToggleCollapsed}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              aria-current={isNavItemActive(item, pathname) ? 'page' : undefined}
              className={
                isNavItemActive(item, pathname)
                  ? `${styles.navItem} ${styles.navItemActive}`
                  : styles.navItem
              }
              title={collapsed ? item.label : undefined}
              onClick={onCloseMobile}
            >
              <span className={styles.navIcon}>
                <NavIcon icon={item.icon} size={20} />
              </span>
              {!collapsed ? <span className={styles.navLabel}>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className={styles.aiCard}>
          <p className={styles.aiCardTitle}>MelGui AI</p>
          {!collapsed ? (
            <>
              <p className={styles.aiCardText}>Conciliação bancária inteligente</p>
              <button type="button" className={styles.aiCardBtn}>
                Conhecer
              </button>
            </>
          ) : null}
        </div>
      </aside>
    </>
  )
}
