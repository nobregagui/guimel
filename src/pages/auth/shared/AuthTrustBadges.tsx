import {
  BankIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
} from '@/pages/auth/shared/authIcons'
import styles from '@/pages/auth/Login/LoginPage.module.css'

export function AuthTrustBadges() {
  return (
    <div className={styles.trustBadges}>
      <div className={styles.trustBadge}>
        <ShieldIcon />
        <div>
          <div className={styles.trustBadgeTitle}>SSL</div>
          <div className={styles.trustBadgeSub}>Secured</div>
        </div>
      </div>
      <div className={styles.trustBadge}>
        <CheckCircleIcon />
        <div>
          <div className={styles.trustBadgeTitle}>LGPD</div>
          <div className={styles.trustBadgeSub}>Compliant</div>
        </div>
      </div>
      <div className={styles.trustBadge}>
        <BankIcon />
        <div>
          <div className={styles.trustBadgeTitle}>Bank-grade</div>
          <div className={styles.trustBadgeSub}>Security</div>
        </div>
      </div>
      <div className={styles.trustBadge}>
        <ClockIcon />
        <div>
          <div className={styles.trustBadgeTitle}>99,9%</div>
          <div className={styles.trustBadgeSub}>Uptime</div>
        </div>
      </div>
    </div>
  )
}
