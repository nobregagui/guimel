import shared from '@/features/dashboard/dashboard.module.css'

import styles from './DashboardHealthScore.module.css'

const SCORE = 92
const ARC_RADIUS = 48
const CIRCUMFERENCE = Math.PI * ARC_RADIUS
const strokeOffset = CIRCUMFERENCE - (SCORE / 100) * CIRCUMFERENCE

export function DashboardHealthScore() {
  return (
    <section className={[shared.card, styles.root].join(' ')} aria-label="Saúde financeira">
      <h2 className={shared.cardTitle}>Saúde Financeira</h2>

      <div className={styles.gaugeWrap}>
        <svg className={styles.gauge} viewBox="0 0 120 72" role="img" aria-label={`Score ${SCORE}, status Excelente`}>
          <defs>
            <linearGradient id="healthGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="55%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="url(#healthGaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            className={styles.gaugeArc}
          />
        </svg>
        <span className={styles.score}>{SCORE}</span>
      </div>

      <span className={styles.status}>Excelente</span>
    </section>
  )
}
