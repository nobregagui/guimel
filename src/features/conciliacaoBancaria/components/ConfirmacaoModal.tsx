import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export type ConfirmacaoVariante = 'danger' | 'warning' | 'info'

interface ConfirmacaoModalProps {
  open: boolean
  titulo: string
  descricao: string
  variante?: ConfirmacaoVariante
  labelConfirmar?: string
  labelCancelar?: string
  onClose: () => void
  onConfirmar: () => void
}

const VARIANTE_CONFIG: Record<
  ConfirmacaoVariante,
  { icon: React.ReactNode; btnClass: string; iconBg: string; iconColor: string }
> = {
  danger: {
    icon: <AlertTriangle size={20} />,
    btnClass: styles.btnDanger,
    iconBg: '#fef2f2',
    iconColor: '#ef4444',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    btnClass: styles.btnWarning,
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
  },
  info: {
    icon: <Info size={20} />,
    btnClass: styles.btnSuccess,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
  },
}

export function ConfirmacaoModal({
  open,
  titulo,
  descricao,
  variante = 'warning',
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  onClose,
  onConfirmar,
}: ConfirmacaoModalProps) {
  if (!open) return null

  const cfg = VARIANTE_CONFIG[variante]

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 60 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.confirmacaoBox}
        role="dialog"
        aria-modal
        aria-labelledby="confirmacao-modal-title"
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: cfg.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cfg.iconColor,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h3 id="confirmacao-modal-title" className={styles.confirmacaoTitulo}>{titulo}</h3>
          <p className={styles.confirmacaoDesc}>{descricao}</p>
        </div>

        {/* Close */}
        <button type="button" className={styles.drawerClose} onClick={onClose} style={{ alignSelf: 'flex-start' }}>
          <X size={14} />
        </button>

        {/* Actions */}
        <div className={styles.confirmacaoActions}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            {labelCancelar}
          </button>
          <button
            type="button"
            className={cfg.btnClass}
            onClick={() => {
              onConfirmar()
              onClose()
            }}
          >
            <CheckCircle2 size={13} />
            {labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
