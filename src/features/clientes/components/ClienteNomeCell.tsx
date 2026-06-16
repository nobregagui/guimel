import { ClienteAvatar } from '@/features/clientes/components/ClienteAvatar'
import type { Cliente } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ClienteNomeCellProps {
  cliente: Cliente
  onClick?: () => void
}

export function ClienteNomeCell({ cliente, onClick }: ClienteNomeCellProps) {
  const content = (
    <>
      <ClienteAvatar nome={cliente.nome} size="sm" />
      <div>
        <p className={styles.cellDescricao}>{cliente.nome}</p>
        <p className={styles.cellSubDesc}>{cliente.documento}</p>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={styles.clienteCellBtn} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={styles.clienteCell}>{content}</div>
}
