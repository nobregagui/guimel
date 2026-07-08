import { Loading } from '@/components/ui/Loading'
import { recentActivityItems } from '@/features/dashboard/data'
import { useDashboardActivitiesQuery } from '@/features/dashboard/hooks/useDashboard'
import shared from '@/features/dashboard/dashboard.module.css'
import { formatCurrency } from '@/utils'

import styles from './DashboardRecentActivities.module.css'

const activityColors: Record<string, string> = {
  sale: 'var(--primary, #16a34a)',
  payable: '#ef4444',
  payment: 'var(--secondary, #f97316)',
  invoice: '#6366f1',
}

export function DashboardRecentActivities() {
  const activitiesQuery = useDashboardActivitiesQuery()
  const items = activitiesQuery.data ?? recentActivityItems

  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Atividades recentes">
      <h2 className={shared.cardTitle}>Atividades Recentes</h2>

      {activitiesQuery.isLoading && !activitiesQuery.data ? (
        <Loading label="Carregando atividades..." layout="centered" size="md" />
      ) : items.length === 0 ? (
        <p className={styles.empty}>Nenhuma atividade recente.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span
                className={styles.dot}
                style={{ background: activityColors[item.type] ?? 'var(--primary)' }}
                aria-hidden
              />
              <div className={styles.body}>
                <span className={styles.description}>{item.description}</span>
                <span className={styles.time}>{item.time}</span>
              </div>
              <span className={[styles.amount, item.amount < 0 ? styles.amountNegative : ''].filter(Boolean).join(' ')}>
                {formatCurrency(Math.abs(item.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
