import { dashboardKpiItems } from '@/features/dashboard/data'
import shared from '@/features/dashboard/dashboard.module.css'
import { MiniSparkline } from '@/features/dashboard/icons'
import { formatCurrency } from '@/utils'

import styles from './DashboardKpis.module.css'

const sparklines: Record<string, number[]> = {
  faturamento: [0.35, 0.42, 0.48, 0.45, 0.55, 0.62, 0.58, 0.72, 0.68, 0.8],
  receber: [0.5, 0.48, 0.52, 0.55, 0.53, 0.58, 0.6, 0.57, 0.62, 0.65],
  pagar: [0.7, 0.65, 0.68, 0.6, 0.58, 0.55, 0.52, 0.5, 0.48, 0.45],
  saldo: [0.4, 0.45, 0.42, 0.5, 0.48, 0.55, 0.52, 0.6, 0.58, 0.65],
}

export function DashboardKpis() {
  return (
    <section className={styles.grid} aria-label="Indicadores principais">
      {dashboardKpiItems.map((kpi, index) => {
        const isPrimary = index === 0
        const isPositive = kpi.change >= 0

        return (
          <article
            key={kpi.id}
            className={[styles.card, isPrimary ? styles.cardPrimary : ''].filter(Boolean).join(' ')}
          >
            <div className={styles.cardTop}>
              <p className={isPrimary ? styles.labelLight : styles.label}>{kpi.label}</p>
              <span className={isPositive ? (isPrimary ? styles.changeLight : shared.changeUp) : shared.changeDown}>
                {kpi.changeLabel}
              </span>
            </div>
            <p className={isPrimary ? styles.valueLight : styles.value}>{formatCurrency(kpi.value)}</p>
            <MiniSparkline
              className={styles.sparkline}
              points={sparklines[kpi.id] ?? sparklines.faturamento}
              color={isPrimary ? 'rgba(255,255,255,0.9)' : 'var(--primary, #16a34a)'}
            />
          </article>
        )
      })}
    </section>
  )
}
