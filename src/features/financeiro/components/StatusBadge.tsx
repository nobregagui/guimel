import { AlertCircle, ArrowDownRight, ArrowUpRight, Ban, CheckCircle2, Clock, PieChart } from 'lucide-react'

import type { LancamentoStatus, LancamentoTipo, TituloModulo } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface StatusBadgeProps {
  status: LancamentoStatus
  modulo?: TituloModulo
}

export function StatusBadge({ status, modulo }: StatusBadgeProps) {
  const recebidoLabel = modulo === 'receber' ? 'Recebido' : 'Pago'
  const abertoLabel = 'Aberto'

  const cfg = {
    pago: { label: recebidoLabel, cls: styles.badgePago, icon: <CheckCircle2 size={10} /> },
    pendente: { label: abertoLabel, cls: styles.badgePendente, icon: <Clock size={10} /> },
    vencido: { label: 'Atrasado', cls: styles.badgeVencido, icon: <AlertCircle size={10} /> },
    parcial: { label: 'Parcial', cls: styles.badgeParcial, icon: <PieChart size={10} /> },
    cancelado: { label: 'Cancelado', cls: styles.badgeCancelado, icon: <Ban size={10} /> },
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
