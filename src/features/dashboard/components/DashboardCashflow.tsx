import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { CASHFLOW_PERIOD_OPTIONS, cashflowChartByPeriod } from '@/features/dashboard/data'
import type { CashflowPeriod, CashflowSeriesKey } from '@/features/dashboard/types'
import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardCashflow.module.css'

const DEFAULT_VISIBLE: Record<CashflowSeriesKey, boolean> = {
  entradas: true,
  saidas: true,
  saldo: true,
}

function buildPath(points: number[], width: number, height: number, pad: number): string {
  if (points.length === 0) return ''
  const step = (width - pad * 2) / Math.max(points.length - 1, 1)
  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = height - pad - p * (height - pad * 2)
    return `${x},${y}`
  })
  return `M ${coords.join(' L ')}`
}

function getPeriodLabel(period: CashflowPeriod): string {
  return CASHFLOW_PERIOD_OPTIONS.find((option) => option.id === period)?.label ?? 'Mês atual'
}

export function DashboardCashflow() {
  const chartId = useId()
  const filterRef = useRef<HTMLDivElement>(null)
  const w = 600
  const h = 200
  const pad = 16

  const [period, setPeriod] = useState<CashflowPeriod>('mes')
  const [filterOpen, setFilterOpen] = useState(false)
  const [visible, setVisible] = useState(DEFAULT_VISIBLE)

  const series = cashflowChartByPeriod[period]

  const entradasPath = useMemo(
    () => buildPath(series.entradas, w, h, pad),
    [series.entradas],
  )
  const saidasPath = useMemo(
    () => buildPath(series.saidas, w, h, pad),
    [series.saidas],
  )
  const saldoPath = useMemo(
    () => buildPath(series.saldo, w, h, pad),
    [series.saldo],
  )

  useEffect(() => {
    if (!filterOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setFilterOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [filterOpen])

  function handlePeriodChange(next: CashflowPeriod) {
    setPeriod(next)
    setFilterOpen(false)
  }

  function toggleSeries(key: CashflowSeriesKey) {
    setVisible((current) => {
      const activeCount = Object.values(current).filter(Boolean).length
      if (current[key] && activeCount === 1) return current
      return { ...current, [key]: !current[key] }
    })
  }

  const labelStep = series.labels.length > 1 ? (w - pad * 2) / (series.labels.length - 1) : 0

  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Fluxo de caixa">
      <div className={styles.header}>
        <h2 className={shared.cardTitle}>Fluxo de Caixa</h2>
        <div className={styles.filterWrap} ref={filterRef}>
          <button
            type="button"
            className={`${styles.filter} ${filterOpen ? styles.filterOpen : ''}`}
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            aria-controls={`${chartId}-period-menu`}
            onClick={() => setFilterOpen((open) => !open)}
          >
            {getPeriodLabel(period)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {filterOpen ? (
            <ul id={`${chartId}-period-menu`} className={styles.filterMenu} role="listbox" aria-label="Período do gráfico">
              {CASHFLOW_PERIOD_OPTIONS.map((option) => (
                <li key={option.id} role="option" aria-selected={period === option.id}>
                  <button
                    type="button"
                    className={`${styles.filterOption} ${period === option.id ? styles.filterOptionActive : ''}`}
                    onClick={() => handlePeriodChange(option.id)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className={styles.legend} role="group" aria-label="Séries do gráfico">
        <button
          type="button"
          className={`${styles.legendItem} ${visible.entradas ? styles.legendItemActive : styles.legendItemMuted}`}
          aria-pressed={visible.entradas}
          onClick={() => toggleSeries('entradas')}
        >
          <span className={styles.dotPrimary} /> Entradas
        </button>
        <button
          type="button"
          className={`${styles.legendItem} ${visible.saidas ? styles.legendItemActive : styles.legendItemMuted}`}
          aria-pressed={visible.saidas}
          onClick={() => toggleSeries('saidas')}
        >
          <span className={styles.dotSecondary} /> Saídas
        </button>
        <button
          type="button"
          className={`${styles.legendItem} ${visible.saldo ? styles.legendItemActive : styles.legendItemMuted}`}
          aria-pressed={visible.saldo}
          onClick={() => toggleSeries('saldo')}
        >
          <span className={styles.dotMuted} /> Saldo
        </button>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role="img"
          aria-labelledby={chartId}
        >
          <title id={chartId}>
            Gráfico de fluxo de caixa — {getPeriodLabel(period)} — entradas, saídas e saldo
          </title>
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
          {visible.entradas ? (
            <path d={entradasPath} fill="none" stroke="var(--primary, #16a34a)" strokeWidth="2.5" strokeLinecap="round" />
          ) : null}
          {visible.saidas ? (
            <path d={saidasPath} fill="none" stroke="var(--secondary, #f97316)" strokeWidth="2.5" strokeLinecap="round" />
          ) : null}
          {visible.saldo ? (
            <path d={saldoPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
          ) : null}
          {series.labels.map((label, index) => {
            const x = pad + index * labelStep
            const showLabel = index === 0 || index === series.labels.length - 1 || index % 2 === 0
            if (!showLabel) return null
            return (
              <text
                key={`${label}-${index}`}
                x={x}
                y={h - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="inherit"
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
