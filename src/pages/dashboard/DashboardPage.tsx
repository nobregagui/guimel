import {
  DashboardCashflow,
  DashboardFinancialSummary,
  DashboardHealthScore,
  DashboardKpis,
  DashboardQuickActions,
  DashboardReceivables,
  DashboardRecentActivities,
} from '@/features/dashboard'

import styles from './DashboardPage.module.css'

export function DashboardPage() {
  return (
    <div className={styles.content}>
      <section className={styles.kpis}>
        <DashboardKpis />
      </section>

      <section className={styles.topRow}>
        <div className={styles.cashflow}>
          <DashboardCashflow />
        </div>

        <div className={styles.quickActions}>
          <DashboardQuickActions />
        </div>
      </section>

      <section className={styles.mainBlock}>
        <div className={styles.leftStack}>
          <DashboardFinancialSummary />
          <DashboardRecentActivities />
        </div>

        <div className={styles.receivables}>
          <DashboardReceivables />
        </div>
      </section>

      <section className={styles.healthScore}>
        <DashboardHealthScore wide />
      </section>
    </div>
  )
}
