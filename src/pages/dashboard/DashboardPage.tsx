import {
  DashboardAiInsights,
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

      <section className={styles.cashflow}>
        <DashboardCashflow />
      </section>

      <section className={styles.quickActions}>
        <DashboardQuickActions />
      </section>

      <section className={styles.financialSummary}>
        <DashboardFinancialSummary />
      </section>

      <section className={styles.receivables}>
        <DashboardReceivables />
      </section>

      <section className={styles.activities}>
        <DashboardRecentActivities />
      </section>

      <section className={styles.aiInsights}>
        <DashboardAiInsights />
      </section>

      <section className={styles.healthScore}>
        <DashboardHealthScore />
      </section>
    </div>
  )
}
