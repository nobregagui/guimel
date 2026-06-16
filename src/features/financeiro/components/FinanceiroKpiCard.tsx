import type { ReactNode } from 'react'

import type { FilterOption } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FilterPillsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterPills<T extends string>({ options, value, onChange }: FilterPillsProps<T>) {
  return (
    <div className={styles.filterRow}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`${styles.filterPill} ${value === option.id ? styles.filterPillActive : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface FinanceiroKpiCardProps {
  label: string
  value: string
  trend?: string
  trendPositive?: boolean
  progress: number
  progressColor: string
  icon: ReactNode
  colorClass: string
}

export function FinanceiroKpiCard({
  label,
  value,
  trend,
  trendPositive,
  progress,
  progressColor,
  icon,
  colorClass,
}: FinanceiroKpiCardProps) {
  return (
    <div className={styles.kpiCard}>
      <div className={`${styles.kpiLabel} ${colorClass}`}>
        {icon}
        {label}
      </div>
      <p className={`${styles.kpiValue} ${colorClass}`}>{value}</p>
      {trend ? (
        <p className={`${styles.kpiTrend} ${trendPositive ? styles.trendUp : styles.trendDown}`}>{trend}</p>
      ) : null}
      <div className={styles.kpiProgressTrack}>
        <div className={styles.kpiProgressFill} style={{ width: `${progress}%`, backgroundColor: progressColor }} />
      </div>
    </div>
  )
}

interface KpiGridProps {
  children: ReactNode
}

export function KpiGrid({ children }: KpiGridProps) {
  return <div className={styles.kpiGrid}>{children}</div>
}
