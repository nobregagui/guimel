import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, MoreHorizontal, SlidersHorizontal, UserPlus, Users, Wallet } from 'lucide-react'

import { ClienteNomeCell } from '@/features/clientes/components/ClienteNomeCell'
import { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
import { ClientesKpiCard, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/clientes/components/DataTable'
import { SegmentoBreakdown } from '@/features/clientes/components/SegmentoBreakdown'
import { TopClientesCard } from '@/features/clientes/components/TopClientesCard'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { Cliente, TableColumn } from '@/features/clientes/types'
import {
  countByStatus,
  countByTipo,
  countNovosNoMes,
  filterClientes,
  formatBRL,
  getClientesRecentes,
  getTicketMedio,
  getTopClientes,
  groupBySegmento,
  sumTotalVendas,
} from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface VisaoGeralTabProps {
  busca: string
}

export function VisaoGeralTab({ busca }: VisaoGeralTabProps) {
  const navigate = useNavigate()
  const clientes = useClientesStore((state) => state.clientes)
  const clientesFiltrados = useMemo(() => filterClientes(clientes, 'todos', busca), [clientes, busca])
  const segmentos = useMemo(() => groupBySegmento(clientesFiltrados), [clientesFiltrados])
  const topClientes = useMemo(() => getTopClientes(clientesFiltrados, 5), [clientesFiltrados])
  const recentes = useMemo(() => getClientesRecentes(clientesFiltrados, 5), [clientesFiltrados])

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
          onClienteClick={(cliente) => navigate(`/clientes/${cliente.id}`)}
        />
      </div>

      <TableSection
        toolbar={
          <TableToolbar
            title="Cadastros recentes"
            subtitle={`${recentes.length} últimos clientes adicionados`}
            actions={
              <button type="button" className={styles.btnSecondary}>
                <SlidersHorizontal size={12} /> Filtros
              </button>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${recentes.length} clientes recentes`}
            actionLabel="Ver todos os clientes"
          />
        }
      >
        <DataTable
          columns={columns}
          data={recentes}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhum cliente encontrado."
        />
      </TableSection>
    </>
  )
}
