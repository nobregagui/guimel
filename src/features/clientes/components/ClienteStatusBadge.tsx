import { AlertCircle, CheckCircle2, UserX } from 'lucide-react'

import type { ClienteStatus } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

export function ClienteStatusBadge({ status }: { status: ClienteStatus }) {
  const cfg = {
    ativo: { label: 'Ativo', cls: styles.badgeAtivo, icon: <CheckCircle2 size={10} /> },
    inativo: { label: 'Inativo', cls: styles.badgeInativo, icon: <UserX size={10} /> },
    pendente: { label: 'Pendente', cls: styles.badgePendente, icon: <AlertCircle size={10} /> },
  }[status]

  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
