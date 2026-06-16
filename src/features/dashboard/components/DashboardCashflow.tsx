import { useId } from 'react'

import { cashflowChartData } from '@/features/dashboard/data'
import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardCashflow.module.css'

function buildPath(points: number[], width: number, height: number, pad: number): string {
  const step = (width - pad * 2) / Math.max(points.length - 1, 1)
  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = height - pad - p * (height - pad * 2)
    return `${x},${y}`
  })
  return `M ${coords.join(' L ')}`
}

export function DashboardCashflow() {
  const chartId = useId()
  const w = 600
  const h = 200
  const pad = 16

  const entradasPath = buildPath(cashflowChartData.entradas, w, h, pad)
  const saidasPath = buildPath(cashflowChartData.saidas, w, h, pad)
  const saldoPath = buildPath(cashflowChartData.saldo, w, h, pad)

  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Fluxo de caixa">
      <div className={styles.header}>
        <h2 className={shared.cardTitle}>Fluxo de Caixa</h2>
        <button type="button" className={styles.filter}>
          Mês Atual
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dotPrimary} /> Entradas
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dotSecondary} /> Saídas
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dotMuted} /> Saldo
        </span>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role="img"
          aria-labelledby={chartId}
        >
          <title id={chartId}>Gráfico de fluxo de caixa — entradas, saídas e saldo</title>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={pad}
              y1={h - pad - ratio * (h - pad * 2)}
              x2={w - pad}
              y2={h - pad - ratio * (h - pad * 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}
          <path d={entradasPath} fill="none" stroke="var(--primary, #16a34a)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={saidasPath} fill="none" stroke="var(--secondary, #f97316)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={saldoPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  )
}
