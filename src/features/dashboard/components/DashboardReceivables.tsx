import { Link } from 'react-router-dom'

import { Loading } from '@/components/ui/Loading'
import { receivableItems } from '@/features/dashboard/data'
import { useDashboardReceivablesQuery } from '@/features/dashboard/hooks/useDashboard'
import shared from '@/features/dashboard/dashboard.module.css'
import { APP_PATHS } from '@/routes/paths'
import { createFinanceiroNavigationState } from '@/routes/navigationState'
import { formatCurrency } from '@/utils'

import styles from './DashboardReceivables.module.css'

export function DashboardReceivables() {
  const receivablesQuery = useDashboardReceivablesQuery()
  const items = receivablesQuery.data ?? receivableItems

  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Contas a receber">
      <div className={styles.header}>
        <h2 className={shared.cardTitle}>Contas a Receber</h2>
        <Link
          to={APP_PATHS.financeiro}
          state={createFinanceiroNavigationState('a-receber')}
          className={shared.btnLink}
        >
          Ver todas
        </Link>
      </div>

      {receivablesQuery.isLoading && !receivablesQuery.data ? (
        <Loading label="Carregando recebíveis..." layout="centered" size="md" />
      ) : items.length === 0 ? (
        <p className={styles.empty}>Nenhum título a receber no momento.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.itemIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div className={styles.itemBody}>
                <span className={styles.client}>{item.client}</span>
                <span className={styles.due}>Venc. {item.dueDate}</span>
              </div>
              <span className={styles.amount}>{formatCurrency(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
