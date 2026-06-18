import { useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Ban,
  CalendarClock,
  CheckCircle2,
  Landmark,
  MoreHorizontal,
} from 'lucide-react'

import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximasTransferencias } from '@/features/financeiro/components/ProximasTransferencias'
import {
  TransferenciasTableFiltersButton,
  TransferenciasTableFiltersPanel,
} from '@/features/financeiro/components/TransferenciasTableFilters'
import { TransferenciaRota } from '@/features/financeiro/components/TransferenciaRota'
import { TransferenciaStatusBadge } from '@/features/financeiro/components/TransferenciaStatusBadge'
import { TransferenciasResumoContas } from '@/features/financeiro/components/TransferenciasResumoContas'
import { EMPTY_TRANSFERENCIAS_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type { ExtratoContaFiltro, Periodo, TableColumn, Transferencia, TransferenciasTableFiltros } from '@/features/financeiro/types'
import {
  countActiveTransferenciasTableFiltros,
  formatBRL,
  getPeriodoLabel,
  getProximasTransferencias,
  getTransferenciaResumoPorConta,
  getTransferenciasBaseItems,
  getTransferenciasTableItems,
  hasActiveTransferenciasTableFiltros,
  sumTransferenciasPorStatus,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface TransferenciasTabProps {
  periodo: Periodo
  contaId: ExtratoContaFiltro
  onContaChange: (contaId: ExtratoContaFiltro) => void
}

export function TransferenciasTab({ periodo, contaId, onContaChange }: TransferenciasTabProps) {
  const transferencias = useFinanceiroStore((s) => s.transferencias)
  const contasBancarias = useFinanceiroStore((s) => s.contasBancarias)
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<TransferenciasTableFiltros>(EMPTY_TRANSFERENCIAS_TABLE_FILTROS)

  const transferenciasBase = useMemo(
    () => getTransferenciasBaseItems(transferencias, contaId, periodo),
    [transferencias, contaId, periodo],
  )

  const transferenciasFiltradas = useMemo(
    () => getTransferenciasTableItems(transferencias, tableFiltros, contaId, periodo),
    [transferencias, tableFiltros, contaId, periodo],
  )

  const activeTableFilters = countActiveTransferenciasTableFiltros(tableFiltros)

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
      contasBancarias.map((c) => c.id),
    ),
    [transferenciasBase, contasBancarias],
  )

  const proximas = useMemo(() => getProximasTransferencias(transferenciasBase), [transferenciasBase])

  const contaLabel = contaId === 'todas'
    ? 'Todas as contas'
    : (contasBancarias.find((c) => c.id === contaId)?.nome ?? 'Conta selecionada')

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
            origem={contasBancarias.find((c) => c.id === row.contaOrigemId)}
            destino={contasBancarias.find((c) => c.id === row.contaDestinoId)}
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
    [contasBancarias],
  )

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_TRANSFERENCIAS_TABLE_FILTROS)
  }

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
          trend={`Período: ${getPeriodoLabel(periodo)}`}
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
          <ContaSelector contas={contasBancarias} value={contaId} onChange={onContaChange} />
        </div>
      </div>

      <div className={styles.twoCol}>
        <TransferenciasResumoContas contas={contasBancarias} resumos={resumosPorConta} />
        <ProximasTransferencias transferencias={proximas} contas={contasBancarias} />
      </div>

      <TableSection
        toolbar={
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Histórico de transferências"
              subtitle={
                hasActiveTransferenciasTableFiltros(tableFiltros)
                  ? `${transferenciasFiltradas.length} de ${transferenciasBase.length} lançamentos — ${contaLabel} — ${getPeriodoLabel(periodo)}`
                  : `${transferenciasFiltradas.length} lançamentos — ${contaLabel} — ${getPeriodoLabel(periodo)}`
              }
              actions={
                <TransferenciasTableFiltersButton
                  open={filtrosOpen}
                  activeCount={activeTableFilters}
                  onToggle={() => setFiltrosOpen((current) => !current)}
                />
              }
            />

            {filtrosOpen ? (
              <TransferenciasTableFiltersPanel
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
              hasActiveTransferenciasTableFiltros(tableFiltros)
                ? `Mostrando ${transferenciasFiltradas.length} de ${transferenciasBase.length} transferências`
                : `Mostrando ${transferenciasFiltradas.length} transferências`
            }
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
