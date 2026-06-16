import type { ReactNode } from 'react'
import { Building2, Banknote, Star } from 'lucide-react'

import type { ContaBancaria } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

export function ContaIcon({ banco }: { banco: ContaBancaria['banco'] }) {
  const cfg: Record<ContaBancaria['banco'], { cls: string; icon: ReactNode }> = {
    itau: { cls: styles.contaIconItau, icon: <Building2 size={14} /> },
    bradesco: { cls: styles.contaIconBradesco, icon: <Building2 size={14} /> },
    nubank: { cls: styles.contaIconNubank, icon: <Star size={14} /> },
    caixa: { cls: styles.contaIconCaixa, icon: <Banknote size={14} /> },
  }

  const { cls, icon } = cfg[banco]
  return <div className={`${styles.contaIcon} ${cls}`}>{icon}</div>
}
