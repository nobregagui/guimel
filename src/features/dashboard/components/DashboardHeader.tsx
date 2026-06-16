import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardHeader.module.css'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
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

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar no sistema..."
          aria-label="Buscar no sistema"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={shared.iconBtnPrimary} aria-label="Criar novo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button type="button" className={shared.iconBtn} aria-label="Notificações">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <button type="button" className={shared.iconBtn} aria-label="Ajuda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
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
