import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { quickActionItems } from '@/features/dashboard/data'
import type { QuickActionId } from '@/features/dashboard/types'
import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardQuickActions.module.css'

function ActionIcon({ id }: { id: QuickActionId }) {
  const icons: Record<QuickActionId, ReactElement> = {
    venda: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
    cobranca: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    pagamento: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    nf: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  }

  return icons[id]
}

export function DashboardQuickActions() {
  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Atalhos rápidos">
      <h2 className={shared.cardTitle}>Atalhos Rápidos</h2>
      <ul className={styles.list}>
        {quickActionItems.map((action) => (
          <li key={action.id}>
            <Link to={action.to} className={styles.action}>
              <span className={styles.iconCircle}>
                <ActionIcon id={action.id} />
              </span>
              <span className={styles.label}>{action.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
