import { useCallback, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Ban,
  CalendarClock,
  CheckCircle2,
  Landmark,
} from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { TableFooter, TableSection } from '@/features/financeiro/components/DataTable'
import { FinanceiroActionMenu } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroBulkBar } from '@/features/financeiro/components/FinanceiroBulkBar'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximasTransferencias } from '@/features/financeiro/components/ProximasTransferencias'
import {
  TransferenciasTableFiltersButton,
  TransferenciasTableFiltersPanel,
} from '@/features/financeiro/components/TransferenciasTableFilters'
import { TransferenciaRota } from '@/features/financeiro/components/TransferenciaRota'
import { TransferenciaStatusBadge } from '@/features/financeiro/components/TransferenciaStatusBadge'
import { TransferenciasResumoContas } from '@/features/financeiro/components/TransferenciasResumoContas'
import { SelectableDataTable, FinanceiroTableToolbar } from '@/features/financeiro/components/SelectableDataTable'
import { EMPTY_TRANSFERENCIAS_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { FinanceiroQueryFeedback } from '@/features/financeiro/components/FinanceiroQueryFeedback'
import {
  useCancelarTransferenciaMutation,
  useConfirmarTransferenciaMutation,
  useContasBancariasQuery,
  useDeleteTransferenciaMutation,
  useDuplicateTransferenciaMutation,
  useTransferenciasQuery,
} from '@/features/financeiro/hooks/useFinanceiro'
import type { ExtratoContaFiltro, Periodo, TableColumn, Transferencia, TransferenciasTableFiltros } from '@/features/financeiro/types'
import { exportTransferenciasCsv } from '@/features/financeiro/utils/exportFinanceiro'
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
  onNovo?: () => void
}

export function TransferenciasTab({ periodo, contaId, onContaChange, onNovo }: TransferenciasTabProps) {
  const { showToast } = useToast()
  const { data: transferencias = [], isLoading, isError, refetch } = useTransferenciasQuery()
  const { data: contasBancarias = [] } = useContasBancariasQuery()
  const confirmarMutation = useConfirmarTransferenciaMutation()
  const cancelarMutation = useCancelarTransferenciaMutation()
  const deleteMutation = useDeleteTransferenciaMutation()
  const duplicateMutation = useDuplicateTransferenciaMutation()

  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<TransferenciasTableFiltros>(EMPTY_TRANSFERENCIAS_TABLE_FILTROS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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
    () => sumTransferenciasPorStatus(transferenciasBase, 'agendada') + sumTransferenciasPorStatus(transferenciasBase, 'pendente'),
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

  const handleExport = useCallback(() => {
    exportTransferenciasCsv(transferenciasFiltradas, contasBancarias)
    showToast({ message: 'Exportação CSV iniciada.', variant: 'success' })
  }, [contasBancarias, showToast, transferenciasFiltradas])

  const buildMenuItems = useCallback(
    (tr: Transferencia) => {
      const podeEditar = tr.status !== 'concluida' && tr.status !== 'cancelada'
      const podeConfirmar = tr.status === 'agendada' || tr.status === 'pendente'
      const podeCancelar = tr.status !== 'concluida' && tr.status !== 'cancelada'
      const podeExcluir = tr.status !== 'concluida'

      return [
        {
          id: 'ver',
          label: 'Visualizar',
          onClick: () => showToast({ message: `${tr.descricao} — ${formatBRL(tr.valor)}`, variant: 'info' }),
        },
        {
          id: 'editar',
          label: 'Editar',
          onClick: () => showToast({ message: 'Edição via drawer em breve.', variant: 'info' }),
          disabled: !podeEditar,
        },
        {
          id: 'confirmar',
          label: 'Confirmar',
          onClick: () => confirmarMutation.mutate(tr.id),
          disabled: !podeConfirmar,
        },
        {
          id: 'cancelar',
          label: 'Cancelar',
          onClick: () => cancelarMutation.mutate(tr.id),
          disabled: !podeCancelar,
        },
        {
          id: 'comprovante',
          label: 'Gerar comprovante',
          onClick: () => undefined,
          future: true,
        },
        {
          id: 'anexo',
          label: 'Anexar comprovante',
          onClick: () => undefined,
          future: true,
        },
        {
          id: 'duplicar',
          label: 'Duplicar',
          onClick: () => duplicateMutation.mutate(tr.id),
        },
        { id: 'imprimir', label: 'Imprimir', onClick: () => window.print(), future: true },
        {
          id: 'excluir',
          label: 'Excluir',
          onClick: () => setConfirmDeleteId(tr.id),
          disabled: !podeExcluir,
          danger: true,
        },
      ]
    },
    [cancelarMutation, confirmarMutation, duplicateMutation, showToast],
  )

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
        render: (row) => <FinanceiroActionMenu items={buildMenuItems(row)} />,
      },
    ],
    [buildMenuItems, contasBancarias],
  )

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_TRANSFERENCIAS_TABLE_FILTROS)
  }

  const selectedArray = [...selectedIds]

  return (
    <FinanceiroQueryFeedback isLoading={isLoading} isError={isError} onRetry={() => void refetch()}>
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
          trend={`${transferenciasBase.filter((t) => t.status === 'agendada' || t.status === 'pendente').length} programada(s)`}
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
          <FinanceiroTableToolbar
            title="Histórico de transferências"
            subtitle={
              hasActiveTransferenciasTableFiltros(tableFiltros)
                ? `${transferenciasFiltradas.length} de ${transferenciasBase.length} lançamentos — ${contaLabel} — ${getPeriodoLabel(periodo)}`
                : `${transferenciasFiltradas.length} lançamentos — ${contaLabel} — ${getPeriodoLabel(periodo)}`
            }
            bulkBar={
              <FinanceiroBulkBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  onClick={() => {
                    selectedArray.forEach((id) => confirmarMutation.mutate(id))
                    setSelectedIds(new Set())
                  }}
                >
                  Confirmar selecionadas
                </button>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  onClick={() => {
                    selectedArray.forEach((id) => cancelarMutation.mutate(id))
                    setSelectedIds(new Set())
                  }}
                >
                  Cancelar
                </button>
                <button type="button" className={styles.bulkBtn} onClick={handleExport}>Exportar</button>
              </FinanceiroBulkBar>
            }
            filters={
              <>
                <div className={styles.tableToolbar}>
                  <div />
                  <div className={styles.tableToolbarRight}>
                    <button type="button" className={styles.btnSecondary} onClick={handleExport}>Exportar CSV</button>
                    <button type="button" className={styles.btnPrimary} onClick={onNovo}>+ Nova transferência</button>
                    <TransferenciasTableFiltersButton
                      open={filtrosOpen}
                      activeCount={activeTableFilters}
                      onToggle={() => setFiltrosOpen((current) => !current)}
                    />
                  </div>
                </div>
                {filtrosOpen ? (
                  <TransferenciasTableFiltersPanel
                    filtros={tableFiltros}
                    activeCount={activeTableFilters}
                    onChange={setTableFiltros}
                    onClear={handleClearTableFiltros}
                    onClose={() => setFiltrosOpen(false)}
                  />
                ) : null}
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={
              hasActiveTransferenciasTableFiltros(tableFiltros)
                ? `Mostrando ${transferenciasFiltradas.length} de ${transferenciasBase.length} transferências`
                : `Mostrando ${transferenciasFiltradas.length} transferências`
            }
            actionLabel="Nova transferência"
            onAction={onNovo}
          />
        }
      >
        <SelectableDataTable
          columns={columns}
          data={transferenciasFiltradas}
          getRowKey={(row) => row.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Nenhuma transferência encontrada para os filtros selecionados."
        />
      </TableSection>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Excluir transferência"
        description="Somente transferências não concluídas podem ser excluídas."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteMutation.mutate(confirmDeleteId, { onSettled: () => setConfirmDeleteId(null) })
          }
        }}
        onClose={() => setConfirmDeleteId(null)}
      />
    </>
    </FinanceiroQueryFeedback>
  )
}
