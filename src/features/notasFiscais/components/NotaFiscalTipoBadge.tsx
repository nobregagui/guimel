import type { TipoNota } from '@/features/notasFiscais/types'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotaFiscalTipoBadgeProps {
  tipo: TipoNota
}

export function NotaFiscalTipoBadge({ tipo }: NotaFiscalTipoBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${tipo === 'entrada' ? styles.badgeEntrada : styles.badgeSaida}`}
    >
      {tipo === 'entrada' ? '↓ Entrada' : '↑ Saída'}
    </span>
  )
}
