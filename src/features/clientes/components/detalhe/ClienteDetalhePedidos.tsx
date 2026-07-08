import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/clientes/components/DataTable'
import type { ClientePedido, TableColumn } from '@/features/clientes/types'
import { formatBRL } from '@/features/clientes/utils'
import { Loading } from '@/components/ui/Loading'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

interface ClienteDetalhePedidosProps {
  pedidos: ClientePedido[]
  isLoading?: boolean
}

function PedidoStatusBadge({ status }: { status: ClientePedido['status'] }) {
  const cfg = {
    concluido: { label: 'Concluído', cls: styles.pedidoConcluido },
    pendente: { label: 'Pendente', cls: styles.pedidoPendente },
    cancelado: { label: 'Cancelado', cls: styles.pedidoCancelado },
  }[status]

  return <span className={`${styles.pedidoBadge} ${cfg.cls}`}>{cfg.label}</span>
}

export function ClienteDetalhePedidos({ pedidos, isLoading = false }: ClienteDetalhePedidosProps) {
  const columns: TableColumn<ClientePedido>[] = [
    {
      key: 'numero',
      header: 'Pedido',
      render: (row) => (
        <>
          <p className={styles.cellDescricao}>{row.numero}</p>
          <p className={styles.cellSubDesc}>{row.data}</p>
        </>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      headerClassName: styles.thRight,
      render: (row) => <span className={styles.cellValorPos}>{formatBRL(row.valor)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      headerClassName: styles.thCenter,
      cellClassName: styles.cellStatusCenter,
      render: (row) => <PedidoStatusBadge status={row.status} />,
    },
  ]

  return (
    <TableSection
      toolbar={
        <TableToolbar
          title="Histórico de pedidos"
          subtitle={
            isLoading
              ? 'Carregando pedidos...'
              : `${pedidos.length} ${pedidos.length === 1 ? 'registro' : 'registros'}`
          }
        />
      }
      footer={
        <TableFooter
          info={isLoading ? 'Carregando pedidos...' : `Mostrando ${pedidos.length} pedidos`}
          actionLabel="Ver todas as vendas"
        />
      }
    >
      {isLoading ? (
        <Loading label="Carregando pedidos..." layout="centered" size="md" />
      ) : (
        <DataTable
          columns={columns}
          data={pedidos}
          getRowKey={(row) => row.id}
          emptyMessage="Este cliente ainda não possui pedidos registrados."
        />
      )}
    </TableSection>
  )
}
