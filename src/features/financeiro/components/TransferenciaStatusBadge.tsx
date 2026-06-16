import { Ban, CalendarClock, CheckCircle2 } from 'lucide-react'

import type { TransferenciaStatus } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

export function TransferenciaStatusBadge({ status }: { status: TransferenciaStatus }) {
  const cfg = {
    concluida: { label: 'Concluída', cls: styles.badgePago, icon: <CheckCircle2 size={10} /> },
    agendada: { label: 'Agendada', cls: styles.badgePendente, icon: <CalendarClock size={10} /> },
    cancelada: { label: 'Cancelada', cls: styles.badgeVencido, icon: <Ban size={10} /> },
  }[status]

  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
