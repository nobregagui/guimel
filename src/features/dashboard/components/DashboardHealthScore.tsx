import { useId } from 'react'

import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardHealthScore.module.css'

const SCORE = 92
const STATUS = 'Excelente'

const RADIUS = 50
const CENTER_X = 70
const CENTER_Y = 62
const ARC_LENGTH = Math.PI * RADIUS

const TRACK_PATH = `M ${CENTER_X - RADIUS} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + RADIUS} ${CENTER_Y}`

const PROGRESS_OFFSET = ARC_LENGTH - (SCORE / 100) * ARC_LENGTH

const HEALTH_METRICS = [
  { id: 'liquidez', label: 'Liquidez', value: 'Alta' },
  { id: 'margem', label: 'Margem', value: '12,4%' },
  { id: 'inadimplencia', label: 'Inadimplência', value: 'Baixa' },
] as const

type DashboardHealthScoreProps = {
  wide?: boolean
}

export function DashboardHealthScore({ wide = false }: DashboardHealthScoreProps) {
  const gradientId = useId()

  return (
    <section
      className={[shared.card, styles.root, wide ? styles.wide : ''].filter(Boolean).join(' ')}
      aria-label="Saúde financeira"
    >
      <h2 className={shared.cardTitle}>Saúde Financeira</h2>

      <div className={styles.body}>
        <div className={styles.info}>
          <p className={styles.description}>
            Indicadores consolidados de liquidez, margem e inadimplência. Sua operação mantém
            equilíbrio entre entradas e compromissos no curto prazo.
          </p>

          <ul className={styles.metrics} aria-label="Indicadores de saúde financeira">
            {HEALTH_METRICS.map((metric) => (
              <li key={metric.id} className={styles.metric}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.metricValue}>{metric.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.gaugeSection}>
          <div className={styles.gaugeWrap}>
            <svg
              className={styles.gauge}
              viewBox="0 0 140 76"
              role="img"
              aria-label={`Score ${SCORE}, status ${STATUS}`}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="60%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>

              <path
                d={TRACK_PATH}
                fill="none"
                stroke="#eef2f6"
                strokeWidth="9"
                strokeLinecap="round"
              />

              <path
                d={TRACK_PATH}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={ARC_LENGTH}
                strokeDashoffset={PROGRESS_OFFSET}
                className={styles.gaugeProgress}
              />
            </svg>

            <div className={styles.scoreBlock}>
              <span className={styles.scoreValue}>{SCORE}</span>
              <span className={styles.scoreMax}>/100</span>
            </div>
          </div>

          <span className={styles.status}>{STATUS}</span>
        </div>
      </div>
    </section>
  )
}
