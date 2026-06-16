import { STATUS_NF_LABEL, type StatusNota } from '@/features/notasFiscais/types'
import { STATUS_DOT_COLORS } from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

const STATUS_CLASS: Record<StatusNota, string> = {
  autorizada: styles.badgeAutorizada,
  pendente: styles.badgePendente,
  cancelada: styles.badgeCancelada,
  denegada: styles.badgeDenegada,
  inutilizada: styles.badgeInutilizada,
}

interface NotaFiscalStatusBadgeProps {
  status: StatusNota
}

export function NotaFiscalStatusBadge({ status }: NotaFiscalStatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      <svg width="5" height="5" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx="3" cy="3" r="3" fill={STATUS_DOT_COLORS[status]} />
      </svg>
      {STATUS_NF_LABEL[status]}
    </span>
  )
}
