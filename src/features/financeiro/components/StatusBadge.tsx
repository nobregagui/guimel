import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react'

import type { LancamentoStatus, LancamentoTipo } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

export function StatusBadge({ status }: { status: LancamentoStatus }) {
  const cfg = {
    pago: { label: 'Pago', cls: styles.badgePago, icon: <CheckCircle2 size={10} /> },
    pendente: { label: 'Pendente', cls: styles.badgePendente, icon: <Clock size={10} /> },
    vencido: { label: 'Vencido', cls: styles.badgeVencido, icon: <AlertCircle size={10} /> },
  }[status]

  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

export function TipoBadge({ tipo }: { tipo: LancamentoTipo }) {
  if (tipo === 'receber') {
    return (
      <span className={`${styles.badge} ${styles.badgeReceber}`}>
        <ArrowDownRight size={10} /> Receber
      </span>
    )
  }

  return (
    <span className={`${styles.badge} ${styles.badgePagar}`}>
      <ArrowUpRight size={10} /> Pagar
    </span>
  )
}
