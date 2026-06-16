import { Building2, User } from 'lucide-react'

import type { ClienteTipo } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

export function ClienteTipoBadge({ tipo }: { tipo: ClienteTipo }) {
  if (tipo === 'pj') {
    return (
      <span className={`${styles.badge} ${styles.badgePj}`}>
        <Building2 size={10} /> PJ
      </span>
    )
  }

  return (
    <span className={`${styles.badge} ${styles.badgePf}`}>
      <User size={10} /> PF
    </span>
  )
}
