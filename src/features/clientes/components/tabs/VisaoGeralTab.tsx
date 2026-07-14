import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, UserPlus, Users, Wallet } from 'lucide-react'

import { ClienteActionMenu } from '@/features/clientes/components/ClienteActionMenu'
import { ClienteNomeCell } from '@/features/clientes/components/ClienteNomeCell'
import { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
import { ClientesKpiCard, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/clientes/components/DataTable'
import {
  RecentesTableFiltersButton,
  RecentesTableFiltersPanel,
} from '@/features/clientes/components/RecentesTableFilters'
import { SegmentoBreakdown } from '@/features/clientes/components/SegmentoBreakdown'
import { TopClientesCard } from '@/features/clientes/components/TopClientesCard'
import { EMPTY_RECENTES_TABLE_FILTROS } from '@/features/clientes/data/shared'
import { useClienteTableActions } from '@/features/clientes/hooks/useClienteTableActions'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { Cliente, RecentesTableFiltros, TableColumn } from '@/features/clientes/types'
import {
  countActiveRecentesTableFiltros,
  countByStatus,
  countByTipo,
  countNovosNoMes,
  filterClientes,
  formatBRL,
  getRecentesTableClientes,
  getTicketMedio,
  getTopClientes,
  groupBySegmento,
  hasActiveRecentesTableFiltros,
  sumTotalVendas,
} from '@/features/clientes/utils'
import { APP_PATHS } from '@/routes/paths'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface VisaoGeralTabProps {
  busca: string
  onVerTodosClientes?: () => void
}

export function VisaoGeralTab({ busca, onVerTodosClientes }: VisaoGeralTabProps) {
  const navigate = useNavigate()
  const clientes = useClientesStore((state) => state.clientes)
  const { getMenuItems, actionsUi } = useClienteTableActions()
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<RecentesTableFiltros>(EMPTY_RECENTES_TABLE_FILTROS)

  const clientesFiltrados = useMemo(() => filterClientes(clientes, 'todos', busca), [clientes, busca])
  const segmentos = useMemo(() => groupBySegmento(clientesFiltrados), [clientesFiltrados])
  const topClientes = useMemo(() => getTopClientes(clientesFiltrados, 5), [clientesFiltrados])
  const recentes = useMemo(
    () => getRecentesTableClientes(clientes, tableFiltros, busca),
    [clientes, tableFiltros, busca],
  )
  const activeTableFilters = countActiveRecentesTableFiltros(tableFiltros)
  const recentesBaseCount = useMemo(
    () => getRecentesTableClientes(clientes, EMPTY_RECENTES_TABLE_FILTROS, busca).length,
    [clientes, busca],
  )

  const columns = useMemo<TableColumn<Cliente>[]>(
    () => [
      {
        key: 'cliente',
        header: 'Cliente',
        render: (row) => <ClienteNomeCell cliente={row} />,
      },
      {
        key: 'segmento',
        header: 'Segmento',
        cellClassName: styles.cellCategoria,
        render: (row) => row.segmento,
      },
      {
        key: 'cadastro',
        header: 'Cadastro',
        render: (row) => <span className={styles.cellVencimento}>{row.cadastro}</span>,
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
        render: (row) => (
          <ClienteActionMenu
            ariaLabel={`Ações de ${row.nome}`}
            items={getMenuItems(row)}
          />
        ),
      },
    ],
    [getMenuItems],
  )

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_RECENTES_TABLE_FILTROS)
  }

  return (
    <>
      <KpiGrid>
        <ClientesKpiCard
          label="Total de clientes"
          value={String(clientesFiltrados.length)}
          trend={`${countByTipo(clientesFiltrados, 'pj')} PJ · ${countByTipo(clientesFiltrados, 'pf')} PF`}
          trendPositive
          progress={72}
          progressColor="#16a34a"
          icon={<Users size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Clientes ativos"
          value={String(countByStatus(clientesFiltrados, 'ativo'))}
          trend={`${clientesFiltrados.length ? Math.round((countByStatus(clientesFiltrados, 'ativo') / clientesFiltrados.length) * 100) : 0}% da base`}
          trendPositive
          progress={65}
          progressColor="#16a34a"
          icon={<Building2 size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Novos em junho"
          value={String(countNovosNoMes(clientesFiltrados))}
          trend="Cadastros recentes"
          trendPositive
          progress={38}
          progressColor="#f97316"
          icon={<UserPlus size={13} />}
          colorClass={styles.colorOrange}
        />
        <ClientesKpiCard
          label="Receita acumulada"
          value={formatBRL(sumTotalVendas(clientesFiltrados))}
          trend={`Ticket médio ${formatBRL(getTicketMedio(clientesFiltrados))}`}
          trendPositive
          progress={58}
          progressColor="#16a34a"
          icon={<Wallet size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <SegmentoBreakdown items={segmentos} />
        <TopClientesCard
          clientes={topClientes}
          onClienteClick={(cliente) => navigate(`${APP_PATHS.clientes}/${cliente.id}`)}
        />
      </div>

      <TableSection
        toolbar={
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Cadastros recentes"
              subtitle={
                hasActiveRecentesTableFiltros(tableFiltros)
                  ? `${recentes.length} de ${recentesBaseCount} clientes recentes`
                  : `${recentes.length} últimos clientes adicionados`
              }
              actions={
                <RecentesTableFiltersButton
                  open={filtrosOpen}
                  activeCount={activeTableFilters}
                  onToggle={() => setFiltrosOpen((current) => !current)}
                />
              }
            />

            {filtrosOpen ? (
              <RecentesTableFiltersPanel
                filtros={tableFiltros}
                activeCount={activeTableFilters}
                onChange={setTableFiltros}
                onClear={handleClearTableFiltros}
                onClose={() => setFiltrosOpen(false)}
              />
            ) : null}
          </div>
        }
        footer={
          <TableFooter
            info={
              hasActiveRecentesTableFiltros(tableFiltros)
                ? `Mostrando ${recentes.length} de ${recentesBaseCount} clientes recentes`
                : `Mostrando ${recentes.length} clientes recentes`
            }
            actionLabel="Ver todos os clientes"
            onAction={onVerTodosClientes}
          />
        }
      >
        <DataTable
          columns={columns}
          data={recentes}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhum cliente encontrado para os filtros selecionados."
          onRowClick={(row) => navigate(`${APP_PATHS.clientes}/${row.id}`)}
        />
      </TableSection>

      {actionsUi}
    </>
  )
}
