import { useMemo } from 'react'
import {
  ArrowLeftRight,
  Ban,
  CalendarClock,
  CheckCircle2,
  Landmark,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react'

import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FilterPills, FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximasTransferencias } from '@/features/financeiro/components/ProximasTransferencias'
import { TransferenciaRota } from '@/features/financeiro/components/TransferenciaRota'
import { TransferenciaStatusBadge } from '@/features/financeiro/components/TransferenciaStatusBadge'
import { TransferenciasResumoContas } from '@/features/financeiro/components/TransferenciasResumoContas'
import { CONTAS_BANCARIAS } from '@/features/financeiro/data/shared'
import { TRANSFERENCIAS, TRANSFERENCIAS_FILTROS } from '@/features/financeiro/data/transferencias'
import type { ExtratoContaFiltro, Periodo, TableColumn, Transferencia, TransferenciasFiltro } from '@/features/financeiro/types'
import {
  filterTransferencias,
  formatBRL,
  getPeriodoLabel,
  getProximasTransferencias,
  getTransferenciaResumoPorConta,
  sumTransferenciasPorStatus,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface TransferenciasTabProps {
  periodo: Periodo
  filtro: TransferenciasFiltro
  contaId: ExtratoContaFiltro
  onFiltroChange: (filtro: TransferenciasFiltro) => void
  onContaChange: (contaId: ExtratoContaFiltro) => void
}

export function TransferenciasTab({
  periodo,
  filtro,
  contaId,
  onFiltroChange,
  onContaChange,
}: TransferenciasTabProps) {
  const transferenciasBase = useMemo(
    () => filterTransferencias(TRANSFERENCIAS, 'todos', contaId, periodo),
    [contaId, periodo],
  )

  const transferenciasFiltradas = useMemo(
    () => filterTransferencias(TRANSFERENCIAS, filtro, contaId, periodo),
    [filtro, contaId, periodo],
  )

  const totalConcluido = useMemo(
    () => sumTransferenciasPorStatus(transferenciasBase, 'concluida'),
    [transferenciasBase],
  )
  const totalAgendado = useMemo(
    () => sumTransferenciasPorStatus(transferenciasBase, 'agendada'),
    [transferenciasBase],
  )
  const totalCancelado = useMemo(
    () => sumTransferenciasPorStatus(transferenciasBase, 'cancelada'),
    [transferenciasBase],
  )

  const resumosPorConta = useMemo(
    () => getTransferenciaResumoPorConta(
      transferenciasBase,
      CONTAS_BANCARIAS.map((c) => c.id),
    ),
    [transferenciasBase],
  )

  const proximas = useMemo(() => getProximasTransferencias(transferenciasBase), [transferenciasBase])

  const contaLabel = contaId === 'todas'
    ? 'Todas as contas'
    : (CONTAS_BANCARIAS.find((c) => c.id === contaId)?.nome ?? 'Conta selecionada')

  const columns = useMemo<TableColumn<Transferencia>[]>(
    () => [
      {
        key: 'data',
        header: 'Data',
        render: (row) => <span className={styles.cellVencimento}>{row.data}</span>,
      },
      {
        key: 'rota',
        header: 'Origem → Destino',
        render: (row) => (
          <TransferenciaRota
            origem={CONTAS_BANCARIAS.find((c) => c.id === row.contaOrigemId)}
            destino={CONTAS_BANCARIAS.find((c) => c.id === row.contaDestinoId)}
          />
        ),
      },
      {
        key: 'descricao',
        header: 'Descrição',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.descricao}</p>
            {row.observacao ? <p className={styles.cellSubDesc}>{row.observacao}</p> : null}
          </>
        ),
      },
      {
        key: 'valor',
        header: 'Valor',
        align: 'right',
        headerClassName: styles.thRight,
        render: (row) => (
          <span className={row.status === 'cancelada' ? styles.cellValorMuted : styles.cellValorNeg}>
            {formatBRL(row.valor)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        headerClassName: styles.thCenter,
        cellClassName: styles.cellStatusCenter,
        render: (row) => <TransferenciaStatusBadge status={row.status} />,
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
    [],
  )

  return (
    <>
      <KpiGrid>
        <FinanceiroKpiCard
          label="Transferido"
          value={formatBRL(totalConcluido)}
          trend={`${transferenciasBase.filter((t) => t.status === 'concluida').length} concluída(s)`}
          trendPositive
          progress={62}
          progressColor="#16a34a"
          icon={<CheckCircle2 size={13} />}
          colorClass={styles.colorGreen}
        />
        <FinanceiroKpiCard
          label="Agendado"
          value={formatBRL(totalAgendado)}
          trend={`${transferenciasBase.filter((t) => t.status === 'agendada').length} programada(s)`}
          progress={48}
          progressColor="#f97316"
          icon={<CalendarClock size={13} />}
          colorClass={styles.colorOrange}
        />
        <FinanceiroKpiCard
          label="Cancelado"
          value={formatBRL(totalCancelado)}
          trend={`${transferenciasBase.filter((t) => t.status === 'cancelada').length} cancelada(s)`}
          progress={18}
          progressColor="#e24b4a"
          icon={<Ban size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="Total movimentado"
          value={formatBRL(totalConcluido + totalAgendado)}
          trend={`Período: ${getPeriodoLabel( periodo)}`}
          trendPositive
          progress={70}
          progressColor="#16a34a"
          icon={<ArrowLeftRight size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.extratoFiltersBar}>
        <div className={styles.extratoFilterGroup}>
          <span className={styles.extratoFilterLabel}>
            <Landmark size={14} /> Conta
          </span>
          <ContaSelector contas={CONTAS_BANCARIAS} value={contaId} onChange={onContaChange} />
        </div>
        <div className={styles.extratoFilterGroup}>
          <span className={styles.extratoFilterLabel}>Status</span>
          <FilterPills options={TRANSFERENCIAS_FILTROS} value={filtro} onChange={onFiltroChange} />
        </div>
      </div>

      <div className={styles.twoCol}>
        <TransferenciasResumoContas contas={CONTAS_BANCARIAS} resumos={resumosPorConta} />
        <ProximasTransferencias transferencias={proximas} contas={CONTAS_BANCARIAS} />
      </div>

      <TableSection
        toolbar={
          <TableToolbar
            title="Histórico de transferências"
            subtitle={`${transferenciasFiltradas.length} lançamentos — ${contaLabel} — ${getPeriodoLabel( periodo)}`}
            actions={
              <button type="button" className={styles.btnSecondary}>
                <SlidersHorizontal size={12} /> Filtros avançados
              </button>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${transferenciasFiltradas.length} de ${transferenciasBase.length} transferências`}
            actionLabel="Nova transferência"
          />
        }
      >
        <DataTable
          columns={columns}
          data={transferenciasFiltradas}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma transferência encontrada para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
