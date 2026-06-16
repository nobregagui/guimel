import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, MoreHorizontal, SlidersHorizontal, UserCheck, UserX, Users } from 'lucide-react'

import { ClienteNomeCell } from '@/features/clientes/components/ClienteNomeCell'
import { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
import { ClienteTipoBadge } from '@/features/clientes/components/ClienteTipoBadge'
import { ClientesKpiCard, FilterPills, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/clientes/components/DataTable'
import { CLIENTES_FILTROS, FORMA_PAGAMENTO_LABEL } from '@/features/clientes/data/shared'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { Cliente, ClienteFiltro, TableColumn } from '@/features/clientes/types'
import { countByStatus, filterClientes, formatBRL } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ListaClientesTabProps {
  filtro: ClienteFiltro
  busca: string
  onFiltroChange: (filtro: ClienteFiltro) => void
}

export function ListaClientesTab({ filtro, busca, onFiltroChange }: ListaClientesTabProps) {
  const navigate = useNavigate()
  const clientes = useClientesStore((state) => state.clientes)
  const clientesBase = useMemo(() => filterClientes(clientes, 'todos', busca), [clientes, busca])
  const clientesFiltrados = useMemo(() => filterClientes(clientes, filtro, busca), [clientes, filtro, busca])

  const columns = useMemo<TableColumn<Cliente>[]>(
    () => [
      {
        key: 'cliente',
        header: 'Cliente',
        render: (row) => (
          <ClienteNomeCell cliente={row} onClick={() => navigate(`/clientes/${row.id}`)} />
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        render: (row) => <ClienteTipoBadge tipo={row.tipo} />,
      },
      {
        key: 'contato',
        header: 'Contato',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.email}</p>
            <p className={styles.cellSubDesc}>{row.telefone}</p>
          </>
        ),
      },
      {
        key: 'local',
        header: 'Localização',
        cellClassName: styles.cellCategoria,
        render: (row) => `${row.cidade}/${row.estado}`,
      },
      {
        key: 'segmento',
        header: 'Segmento',
        cellClassName: styles.cellCategoria,
        render: (row) => row.segmento,
      },
      {
        key: 'pagamento',
        header: 'Pagamento',
        cellClassName: styles.cellCategoria,
        render: (row) => FORMA_PAGAMENTO_LABEL[row.formaPagamentoPreferida],
      },
      {
        key: 'ultimaCompra',
        header: 'Última compra',
        render: (row) => (
          <span className={styles.cellVencimento}>{row.ultimaCompra ?? '—'}</span>
        ),
      },
      {
        key: 'totalVendas',
        header: 'Total vendas',
        align: 'right',
        headerClassName: styles.thRight,
        render: (row) => (
          <span className={row.totalVendas > 0 ? styles.cellValorPos : styles.cellValorMuted}>
            {formatBRL(row.totalVendas)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        headerClassName: styles.thCenter,
        cellClassName: styles.cellStatusCenter,
        render: (row) => <ClienteStatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        headerClassName: styles.thNarrow,
        render: () => (
          <button type="button" className={styles.rowAction} aria-label="Ações">
            <MoreHorizontal size={16} />
          </button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <>
      <KpiGrid>
        <ClientesKpiCard
          label="Base total"
          value={String(clientesBase.length)}
          trend="Todos os cadastros"
          trendPositive
          progress={70}
          progressColor="#16a34a"
          icon={<Users size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Ativos"
          value={String(countByStatus(clientesBase, 'ativo'))}
          trend="Compraram recentemente"
          trendPositive
          progress={62}
          progressColor="#16a34a"
          icon={<UserCheck size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Inativos"
          value={String(countByStatus(clientesBase, 'inativo'))}
          trend="Sem movimentação"
          progress={24}
          progressColor="#9ca3af"
          icon={<UserX size={13} />}
          colorClass={styles.colorMuted}
        />
        <ClientesKpiCard
          label="Pendentes"
          value={String(countByStatus(clientesBase, 'pendente'))}
          trend="Aguardando aprovação"
          progress={18}
          progressColor="#f97316"
          icon={<AlertCircle size={13} />}
          colorClass={styles.colorOrange}
        />
      </KpiGrid>

      <TableSection
        toolbar={
          <TableToolbar
            title="Base de clientes"
            subtitle={`${clientesFiltrados.length} de ${clientesBase.length} registros`}
            actions={
              <>
                <FilterPills options={CLIENTES_FILTROS} value={filtro} onChange={onFiltroChange} />
                <button type="button" className={styles.btnSecondary}>
                  <SlidersHorizontal size={12} /> Filtros avançados
                </button>
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${clientesFiltrados.length} de ${clientesBase.length} clientes`}
            actionLabel="Importar clientes"
          />
        }
      >
        <DataTable
          columns={columns}
          data={clientesFiltrados}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhum cliente encontrado para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
