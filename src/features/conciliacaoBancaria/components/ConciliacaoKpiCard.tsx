import type { ReactNode } from 'react'

import type { ConciliacaoKpiItem } from '@/features/conciliacaoBancaria/types'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ConciliacaoKpiCardProps {
  item: ConciliacaoKpiItem
  icon: ReactNode
  iconClass?: string
}

export function ConciliacaoKpiCard({ item, icon, iconClass = styles.kpiCardIconGreen }: ConciliacaoKpiCardProps) {
  return (
    <div className={styles.kpiCard} role="article" aria-label={`${item.label}: ${item.value}`}>
      <div className={styles.kpiCardTop}>
        <div>
          <p className={styles.kpiCardLabel}>{item.label}</p>
          {item.subValue ? <p className={styles.kpiCardSub}>{item.subValue}</p> : null}
        </div>
        <div className={`${styles.kpiCardIcon} ${iconClass}`}>{icon}</div>
      </div>

      <p className={styles.kpiCardValue}>{item.value}</p>

      {item.trend ? (
        <p
          className={`${styles.kpiCardTrend} ${
            item.trendPositive === true
              ? styles.kpiCardTrendPositive
              : item.trendPositive === false
                ? styles.kpiCardTrendNegative
                : ''
          }`}
        >
          {item.trend}
        </p>
      ) : null}

      {item.progress !== undefined ? (
        <div className={styles.kpiCardProgress}>
          <div
            className={styles.kpiCardProgressBar}
            style={{
              width: `${Math.min(100, Math.max(0, item.progress))}%`,
              backgroundColor: item.progressColor ?? '#16a34a',
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

interface KpiGridProps {
  children: ReactNode
}

export function KpiGrid({ children }: KpiGridProps) {
  return <div className={styles.kpiGrid}>{children}</div>
}
