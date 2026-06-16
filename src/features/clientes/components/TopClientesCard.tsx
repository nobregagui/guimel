import { ClienteAvatar } from '@/features/clientes/components/ClienteAvatar'
import { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
import type { Cliente } from '@/features/clientes/types'
import { formatBRL } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface TopClientesCardProps {
  clientes: Cliente[]
  title?: string
  hint?: string
  onClienteClick?: (cliente: Cliente) => void
}

export function TopClientesCard({
  clientes,
  title = 'Top clientes',
  hint = 'Por volume de vendas',
  onClienteClick,
}: TopClientesCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.categoryHint}>{hint}</span>
      </div>

      {clientes.length === 0 ? (
        <p className={styles.emptyState}>Nenhum cliente encontrado.</p>
      ) : (
        <div className={styles.topClientesList}>
          {clientes.map((cliente, index) => {
            const itemContent = (
              <>
                <span className={styles.topClienteRank}>{index + 1}</span>
                <ClienteAvatar nome={cliente.nome} size="sm" />
                <div className={styles.topClienteInfo}>
                  <p className={styles.cellDescricao}>{cliente.nome}</p>
                  <p className={styles.cellSubDesc}>
                    {cliente.quantidadePedidos} pedidos · {cliente.cidade}/{cliente.estado}
                  </p>
                </div>
                <div className={styles.topClienteRight}>
                  <span className={styles.cellValorPos}>{formatBRL(cliente.totalVendas)}</span>
                  <ClienteStatusBadge status={cliente.status} />
                </div>
              </>
            )

            if (onClienteClick) {
              return (
                <button
                  key={cliente.id}
                  type="button"
                  className={`${styles.topClienteItem} ${styles.topClienteItemBtn}`}
                  onClick={() => onClienteClick(cliente)}
                >
                  {itemContent}
                </button>
              )
            }

            return (
              <div key={cliente.id} className={styles.topClienteItem}>
                {itemContent}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
