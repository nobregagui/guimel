import { Loading } from '@/components/ui/Loading'
import { financialSummaryItems } from '@/features/dashboard/data'
import { useDashboardFinancialSummaryQuery } from '@/features/dashboard/hooks/useDashboard'
import shared from '@/features/dashboard/dashboard.module.css'
import { MiniSparkline } from '@/features/dashboard/icons'
import { formatCurrency } from '@/utils'

import styles from './DashboardFinancialSummary.module.css'

const miniCharts: Record<string, number[]> = {
  entradas: [0.4, 0.5, 0.48, 0.58, 0.55, 0.65, 0.7],
  saidas: [0.55, 0.5, 0.52, 0.48, 0.5, 0.45, 0.42],
  resultado: [0.3, 0.35, 0.38, 0.42, 0.45, 0.5, 0.55],
  margem: [0.32, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39],
}

export function DashboardFinancialSummary() {
  const summaryQuery = useDashboardFinancialSummaryQuery()
  const items = summaryQuery.data ?? financialSummaryItems

  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Resumo financeiro">
      <h2 className={shared.cardTitle}>Resumo Financeiro</h2>

      {summaryQuery.isLoading && !summaryQuery.data ? (
        <Loading label="Carregando resumo..." layout="centered" size="md" />
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.miniCard}>
              <p className={styles.label}>{item.label}</p>
              <p className={styles.value}>
                {item.isPercent
                  ? `${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                  : formatCurrency(item.value)}
              </p>
              <MiniSparkline
                className={styles.sparkline}
                points={miniCharts[item.id] ?? miniCharts.entradas}
                color={item.id === 'saidas' ? 'var(--secondary, #f97316)' : 'var(--primary, #16a34a)'}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
