import { Ban, CalendarClock, CheckCircle2, Clock, XCircle } from 'lucide-react'

import type { TransferenciaStatus } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const STATUS_CONFIG: Record<TransferenciaStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  concluida: { label: 'Concluída', cls: styles.badgePago, icon: <CheckCircle2 size={10} /> },
  agendada: { label: 'Agendada', cls: styles.badgePendente, icon: <CalendarClock size={10} /> },
  pendente: { label: 'Pendente', cls: styles.badgePendente, icon: <Clock size={10} /> },
  cancelada: { label: 'Cancelada', cls: styles.badgeVencido, icon: <Ban size={10} /> },
  falhou: { label: 'Falhou', cls: styles.badgeVencido, icon: <XCircle size={10} /> },
}

export function TransferenciaStatusBadge({ status }: { status: TransferenciaStatus }) {
  const cfg = STATUS_CONFIG[status]

  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
