import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Bell, Search, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { dashboardNotifications, globalSearchItems } from '@/features/dashboard/data'
import type { DashboardNotification, GlobalSearchItem } from '@/features/dashboard/types'
import { filterGlobalSearchItems } from '@/features/dashboard/utils/globalSearch'
import shared from '@/features/dashboard/dashboard.module.css'
import { APP_PATHS } from '@/routes/paths'
import { createBuscaNavigationState } from '@/routes/navigationState'

import styles from './DashboardHeader.module.css'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const searchListId = useId()
  const notificationsListId = useId()

  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const [busca, setBusca] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<DashboardNotification[]>(dashboardNotifications)

  const searchResults = useMemo(
    () => filterGlobalSearchItems(globalSearchItems, busca),
    [busca],
  )

  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    if (!searchOpen && !notificationsOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (searchOpen && !searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
      if (notificationsOpen && !notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [notificationsOpen, searchOpen])

  function navigateToSearchItem(item: GlobalSearchItem) {
    const query = busca.trim()
    const state = item.passBusca && query ? createBuscaNavigationState(query) : null
    navigate(item.to, state ? { state } : undefined)
    setBusca('')
    setSearchOpen(false)
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const firstResult = searchResults[0]
    if (firstResult) {
      navigateToSearchItem(firstResult)
    }
  }

  function toggleNotifications() {
    setNotificationsOpen((open) => !open)
    setSearchOpen(false)
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  function markAllNotificationsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} aria-label="Abrir menu" onClick={onMenuClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1 className={styles.greeting}>Bom dia, Alexandre 👋</h1>
          <p className={styles.subtext}>Aqui está o resumo financeiro da sua empresa.</p>
        </div>
      </div>

      <div className={styles.searchWrap} ref={searchRef}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <Search size={18} className={styles.searchIcon} aria-hidden />
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar no sistema..."
            aria-label="Buscar no sistema"
            aria-controls={searchListId}
            aria-expanded={searchOpen}
            aria-autocomplete="list"
            role="combobox"
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
          />
        </form>

        {searchOpen && searchResults.length > 0 ? (
          <ul id={searchListId} className={styles.searchResults} role="listbox">
            {searchResults.map((item) => (
              <li key={item.id} role="option">
                <button type="button" className={styles.searchResult} onClick={() => navigateToSearchItem(item)}>
                  <span className={styles.searchResultLabel}>{item.label}</span>
                  <span className={styles.searchResultDescription}>{item.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {searchOpen && busca.trim() && searchResults.length === 0 ? (
          <div className={styles.searchEmpty}>Nenhum resultado para &quot;{busca.trim()}&quot;</div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <div className={styles.actionWrap} ref={notificationsRef}>
          <button
            type="button"
            className={shared.iconBtn}
            aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações'}
            aria-expanded={notificationsOpen}
            aria-controls={notificationsListId}
            onClick={toggleNotifications}
          >
            <Bell size={18} aria-hidden />
            {unreadCount > 0 ? (
              <span className={styles.notificationBadge} aria-hidden>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <div id={notificationsListId} className={styles.notificationsPanel}>
              <div className={styles.panelHeader}>
                <p className={styles.panelTitle}>Notificações</p>
                {unreadCount > 0 ? (
                  <button type="button" className={styles.panelAction} onClick={markAllNotificationsRead}>
                    Marcar todas como lidas
                  </button>
                ) : null}
              </div>

              <ul className={styles.notificationsList}>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={`${styles.notificationItem} ${notification.read ? styles.notificationRead : ''}`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <span className={styles.notificationTitle}>{notification.title}</span>
                      <span className={styles.notificationMessage}>{notification.message}</span>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <Link to={APP_PATHS.configuracoes} className={`${shared.iconBtn} ${styles.iconLink}`} aria-label="Configurações">
          <Settings size={18} aria-hidden />
        </Link>

        <div className={styles.company}>
          <span className={styles.companyName}>Empresa</span>
          <span className={styles.companyPlan}>Plano Pro</span>
        </div>
        <div className={styles.avatar} aria-label="Usuário Alexandre">
          AM
        </div>
      </div>
    </header>
  )
}
