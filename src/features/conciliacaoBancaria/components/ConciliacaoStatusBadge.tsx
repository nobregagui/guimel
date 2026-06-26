import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  EyeOff,
  Sparkles,
} from 'lucide-react'

import type {
  ErpLancStatus,
  ErpLancTipo,
  ExtratoItemStatus,
  ExtratoMovTipo,
  ExtratoOrigemTipo,
} from '@/features/conciliacaoBancaria/types'
import { ORIGEM_LABEL } from '@/features/conciliacaoBancaria/utils'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

// ─── Extrato item status badge ────────────────────────────────────────────────
const EXTRATO_STATUS_CONFIG: Record<
  ExtratoItemStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  pendente: { label: 'Pendente', cls: styles.badgePendente, icon: <Clock size={10} /> },
  conciliado: { label: 'Conciliado', cls: styles.badgeConciliado, icon: <CheckCircle2 size={10} /> },
  ignorado: { label: 'Ignorado', cls: styles.badgeIgnorado, icon: <EyeOff size={10} /> },
  sugerido: { label: 'Sugerido', cls: styles.badgeSugerido, icon: <Sparkles size={10} /> },
}

export function ExtratoStatusBadge({ status }: { status: ExtratoItemStatus }) {
  const cfg = EXTRATO_STATUS_CONFIG[status]
  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── ERP lancamento status badge ──────────────────────────────────────────────
const ERP_STATUS_CONFIG: Record<
  ErpLancStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  pendente: { label: 'Pendente', cls: styles.badgePendente, icon: <Clock size={10} /> },
  conciliado: { label: 'Conciliado', cls: styles.badgeConciliado, icon: <CheckCircle2 size={10} /> },
  pago: { label: 'Pago', cls: styles.badgeConciliado, icon: <CheckCircle2 size={10} /> },
}

export function ErpStatusBadge({ status }: { status: ErpLancStatus }) {
  const cfg = ERP_STATUS_CONFIG[status]
  return (
    <span className={`${styles.badge} ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── ERP tipo badge ───────────────────────────────────────────────────────────
export function ErpTipoBadge({ tipo }: { tipo: ErpLancTipo }) {
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

// ─── Extrato movimento tipo badge ─────────────────────────────────────────────
export function ExtratoMovTipoBadge({ tipo }: { tipo: ExtratoMovTipo }) {
  if (tipo === 'credito') {
    return (
      <span className={`${styles.badge} ${styles.badgeCredito}`}>
        <ArrowDownRight size={10} /> Crédito
      </span>
    )
  }
  return (
    <span className={`${styles.badge} ${styles.badgeDebito}`}>
      <ArrowUpRight size={10} /> Débito
    </span>
  )
}

// ─── Origem chip ──────────────────────────────────────────────────────────────
const ORIGEM_CHIP_CLASS: Record<ExtratoOrigemTipo, string> = {
  pix: styles.badgePix,
  ted: styles.badgeTed,
  doc: styles.badgeTed,
  boleto: styles.badgeBoleto,
  cartao: styles.badgePurple ?? styles.badgeOutros,
  tarifa: styles.badgeTarifa,
  iof: styles.badgeTarifa,
  juros: styles.badgeTarifa,
  transferencia: styles.badgeTed,
  aplicacao: styles.badgeBoleto,
  resgate: styles.badgePix,
  cheque: styles.badgeOutros,
  outros: styles.badgeOutros,
}

export function OrigemChip({ origem }: { origem: ExtratoOrigemTipo }) {
  const cls = ORIGEM_CHIP_CLASS[origem] ?? styles.badgeOutros
  return <span className={`${styles.origemChip} ${cls}`}>{ORIGEM_LABEL[origem]}</span>
}
