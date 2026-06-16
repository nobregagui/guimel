import { RobotIcon } from '@/features/dashboard/icons'

import styles from './DashboardAiInsights.module.css'

export function DashboardAiInsights() {
  return (
    <section className={styles.root} aria-label="GuiMe AI">
      <div className={styles.iconWrap}>
        <RobotIcon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>GuiMe AI</h2>
        <p className={styles.text}>
          O assistente inteligente que ajuda você a tomar decisões financeiras.
        </p>
      </div>
      <button type="button" className={styles.cta}>
        Conversar agora
      </button>
    </section>
  )
}
