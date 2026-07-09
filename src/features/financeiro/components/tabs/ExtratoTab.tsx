import { useCallback, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Link2,
  Link2Off,
  List,
  Wallet,
} from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { usePermissions } from '@/hooks/usePermissions'
import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { TableFooter, TableSection } from '@/features/financeiro/components/DataTable'
import {
  ExtratoTableFiltersButton,
  ExtratoTableFiltersPanel,
} from '@/features/financeiro/components/ExtratoTableFilters'
import { ExtratoResumoCard } from '@/features/financeiro/components/ExtratoResumoCard'
import type { ActionMenuItem } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroActionMenu } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroBulkBar } from '@/features/financeiro/components/FinanceiroBulkBar'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { SelectableDataTable, FinanceiroTableToolbar } from '@/features/financeiro/components/SelectableDataTable'
import { EXTRATO_CATEGORIAS } from '@/features/financeiro/data/extrato'
import { EMPTY_EXTRATO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { FinanceiroQueryFeedback } from '@/features/financeiro/components/FinanceiroQueryFeedback'
import {
  useConciliarExtratoMutation,
  useContasBancariasQuery,
  useDeleteExtratoMutation,
  useDesconciliarExtratoMutation,
  useExtratoQuery,
} from '@/features/financeiro/hooks/useFinanceiro'
import type { ExtratoContaFiltro, ExtratoMovimento, ExtratoTableFiltros, Periodo, TableColumn } from '@/features/financeiro/types'
import { exportExtratoCsv } from '@/features/financeiro/utils/exportFinanceiro'
import {
  buildExtratoResumo,
  countActiveExtratoTableFiltros,
  formatBRL,
  getExtratoBaseMovimentos,
  getExtratoTableMovimentos,
  getPeriodoLabel,
  hasActiveExtratoTableFiltros,
  sumExtratoPorTipo,
} from '@/features/financeiro/utils'
import { canReconcileConciliacao, canWriteExtrato } from '@/utils/financePermissions'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ExtratoTabProps {
  periodo: Periodo
  contaId: ExtratoContaFiltro
  onContaChange: (contaId: ExtratoContaFiltro) => void
  onNovo?: () => void
}

function ExtratoTipoBadge({ tipo }: { tipo: ExtratoMovimento['tipo'] }) {
  if (tipo === 'entrada') {
    return (
      <span className={`${styles.badge} ${styles.badgeReceber}`}>
        <ArrowDownLeft size={10} /> Entrada
      </span>
    )
  }

  return (
    <span className={`${styles.badge} ${styles.badgePagar}`}>
      <ArrowUpRight size={10} /> Saída
    </span>
  )
}

export function ExtratoTab({ periodo, contaId, onContaChange, onNovo }: ExtratoTabProps) {
  const { showToast } = useToast()
  const { userPermissions, isReadOnly } = usePermissions()

  const extratoParams = useMemo(
    () => ({
      contaId: contaId === 'todas' ? undefined : contaId,
      periodo,
    }),
    [contaId, periodo],
  )

  const { data: movimentos = [], isLoading, isError, refetch } = useExtratoQuery(extratoParams)
  const { data: contasBancarias = [] } = useContasBancariasQuery()
  const conciliarMutation = useConciliarExtratoMutation()
  const desconciliarMutation = useDesconciliarExtratoMutation()
  const deleteMutation = useDeleteExtratoMutation()

  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ExtratoTableFiltros>(EMPTY_EXTRATO_TABLE_FILTROS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const showContaFilter = contaId === 'todas'

  const contaSelecionada = useMemo(
    () => contasBancarias.find((c) => c.id === contaId),
    [contasBancarias, contaId],
  )

  const movimentosBase = useMemo(
    () => getExtratoBaseMovimentos(movimentos, contaId, periodo),
    [movimentos, contaId, periodo],
  )

  const movimentosFiltrados = useMemo(
    () => getExtratoTableMovimentos(movimentos, tableFiltros, contaId, periodo),
    [movimentos, tableFiltros, contaId, periodo],
  )

  const activeTableFilters = countActiveExtratoTableFiltros(tableFiltros, showContaFilter)

  const resumo = useMemo(() => {
    const saldoAtual =
      contaId === 'todas'
        ? contasBancarias.reduce((acc, c) => acc + c.saldo, 0)
        : (contaSelecionada?.saldo ?? 0)

    return buildExtratoResumo(movimentosBase, saldoAtual)
  }, [contaId, contasBancarias, contaSelecionada, movimentosBase])

  const totalEntradas = useMemo(() => sumExtratoPorTipo(movimentosBase, 'entrada'), [movimentosBase])
  const totalSaidas = useMemo(() => sumExtratoPorTipo(movimentosBase, 'saida'), [movimentosBase])

  const contaLabel =
    contaId === 'todas' ? 'Consolidado' : (contaSelecionada?.nome ?? 'Conta selecionada')

  const handleExport = useCallback(() => {
    exportExtratoCsv(movimentosFiltrados, contasBancarias)
    showToast({ message: 'Exportação CSV iniciada.', variant: 'success' })
  }, [contasBancarias, movimentosFiltrados, showToast])

  const buildMenuItems = useCallback(
    (mov: ExtratoMovimento) => {
      const canReconcile = canReconcileConciliacao(userPermissions) && !isReadOnly
      const canWrite = canWriteExtrato(userPermissions) && !isReadOnly
      const podeExcluir = mov.manual && !mov.conciliado

      const items: ActionMenuItem[] = [
        {
          id: 'ver',
          label: 'Visualizar movimentação',
          onClick: () => showToast({ message: `${mov.descricao} — ${formatBRL(mov.valor)}`, variant: 'info' }),
        },
      ]

      if (canReconcile) {
        items.push({
          id: 'conciliar',
          label: mov.conciliado ? 'Desconciliar' : 'Conciliar',
          onClick: () => {
            if (mov.conciliado) desconciliarMutation.mutate([mov.id])
            else conciliarMutation.mutate([mov.id])
          },
        })
      }

      if (canWrite) {
        items.push({
          id: 'editar',
          label: 'Editar lançamento',
          onClick: () => showToast({ message: 'Edição disponível para lançamentos manuais.', variant: 'info' }),
          disabled: !mov.manual,
        })
        items.push({
          id: 'excluir',
          label: 'Excluir lançamento',
          onClick: () => setConfirmDeleteId(mov.id),
          disabled: !podeExcluir,
          title: mov.conciliado ? 'Não é possível excluir lançamento já conciliado' : undefined,
          danger: true,
        })
      }

      items.push({ id: 'imprimir', label: 'Imprimir', onClick: () => window.print(), future: true })

      return items
    },
    [conciliarMutation, desconciliarMutation, isReadOnly, showToast, userPermissions],
  )

  const columns = useMemo<TableColumn<ExtratoMovimento>[]>(() => {
    const base: TableColumn<ExtratoMovimento>[] = [
      {
        key: 'data',
        header: 'Data',
        render: (row) => <span className={styles.cellVencimento}>{row.data}</span>,
      },
      {
        key: 'descricao',
        header: 'Descrição',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>
              {row.descricao}
              {row.conciliado ? <span className={`${styles.badge} ${styles.badgePago}`} style={{ marginLeft: 8 }}>Conciliado</span> : null}
            </p>
            <p className={styles.cellSubDesc}>{row.detalhe}</p>
          </>
        ),
      },
    ]

    if (contaId === 'todas') {
      base.push({
        key: 'conta',
        header: 'Conta',
        render: (row) => {
          const conta = contasBancarias.find((c) => c.id === row.contaId)
          if (!conta) return '—'
          return (
            <span className={styles.extratoContaCell}>
              <ContaIcon banco={conta.banco} />
              {conta.nome}
            </span>
          )
        },
      })
    }

    base.push(
      {
        key: 'categoria',
        header: 'Categoria',
        cellClassName: styles.cellCategoria,
        render: (row) => row.categoria,
      },
      {
        key: 'tipo',
        header: 'Tipo',
        render: (row) => <ExtratoTipoBadge tipo={row.tipo} />,
      },
      {
        key: 'valor',
        header: 'Valor',
        align: 'right',
        headerClassName: styles.thRight,
        render: (row) => (
          <span className={row.tipo === 'entrada' ? styles.cellValorPos : styles.cellValorNeg}>
            {row.tipo === 'entrada' ? '+' : '−'} {formatBRL(row.valor)}
          </span>
        ),
      },
    )

    if (contaId !== 'todas') {
      base.push({
        key: 'saldo',
        header: 'Saldo',
        align: 'right',
        headerClassName: styles.thRight,
        render: (row) => <span className={styles.extratoSaldoCell}>{formatBRL(row.saldoApos)}</span>,
      })
    }

    base.push({
      key: 'actions',
      header: '',
      headerClassName: styles.thNarrow,
      render: (row) => <FinanceiroActionMenu items={buildMenuItems(row)} />,
    })

    return base
  }, [buildMenuItems, contaId, contasBancarias])

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_EXTRATO_TABLE_FILTROS)
  }

  const selectedArray = [...selectedIds]

  return (
    <FinanceiroQueryFeedback isLoading={isLoading} isError={isError} onRetry={() => void refetch()}>
    <>
      <KpiGrid>
        <FinanceiroKpiCard
          label="Saldo atual"
          value={formatBRL(resumo.saldoAtual)}
          trend={contaLabel}
          trendPositive
          progress={65}
          progressColor="#16a34a"
          icon={<Wallet size={13} />}
          colorClass={styles.colorGreen}
        />
        <FinanceiroKpiCard
          label="Entradas"
          value={formatBRL(totalEntradas)}
          trend={`${movimentosBase.filter((m) => m.tipo === 'entrada').length} movimentações`}
          trendPositive
          progress={58}
          progressColor="#16a34a"
          icon={<ArrowDownLeft size={13} />}
          colorClass={styles.colorGreen}
        />
        <FinanceiroKpiCard
          label="Saídas"
          value={formatBRL(totalSaidas)}
          trend={`${movimentosBase.filter((m) => m.tipo === 'saida').length} movimentações`}
          progress={44}
          progressColor="#e24b4a"
          icon={<ArrowUpRight size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="Movimentações"
          value={String(resumo.quantidade)}
          trend={`Período: ${getPeriodoLabel(periodo)}`}
          trendPositive
          progress={72}
          progressColor="#f97316"
          icon={<List size={13} />}
          colorClass={styles.colorOrange}
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
        <ExtratoResumoCard resumo={resumo} contaLabel={contaLabel} />

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Contas vinculadas</h3>
            <span className={styles.categoryHint}>{contasBancarias.length} contas</span>
          </div>
          <div className={styles.contaList}>
            {contasBancarias.map((conta) => (
              <button
                key={conta.id}
                type="button"
                className={`${styles.extratoContaBtn} ${contaId === conta.id ? styles.extratoContaBtnActive : ''}`}
                onClick={() => onContaChange(conta.id)}
              >
                <div className={styles.contaItemLeft}>
                  <ContaIcon banco={conta.banco} />
                  {conta.nome}
                </div>
                <span className={styles.contaSaldo}>{formatBRL(conta.saldo)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <TableSection
        toolbar={
          <FinanceiroTableToolbar
            title="Extrato bancário"
            subtitle={
              hasActiveExtratoTableFiltros(tableFiltros, showContaFilter)
                ? `${movimentosFiltrados.length} de ${movimentosBase.length} lançamentos — ${getPeriodoLabel(periodo)}`
                : `${movimentosFiltrados.length} lançamentos — ${getPeriodoLabel(periodo)}`
            }
            bulkBar={
              <FinanceiroBulkBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  onClick={() => {
                    conciliarMutation.mutate(selectedArray, { onSuccess: () => setSelectedIds(new Set()) })
                  }}
                >
                  <Link2 size={14} /> Conciliar
                </button>
                <button
                  type="button"
                  className={styles.bulkBtn}
                  onClick={() => {
                    desconciliarMutation.mutate(selectedArray, { onSuccess: () => setSelectedIds(new Set()) })
                  }}
                >
                  <Link2Off size={14} /> Desconciliar
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
                    <button type="button" className={styles.btnSecondary} onClick={() => showToast({ message: 'Importação OFX/CSV via backend.', variant: 'info' })}>Importar</button>
                    <button type="button" className={styles.btnPrimary} onClick={onNovo}>+ Novo lançamento</button>
                    <ExtratoTableFiltersButton
                      open={filtrosOpen}
                      activeCount={activeTableFilters}
                      onToggle={() => setFiltrosOpen((current) => !current)}
                    />
                  </div>
                </div>
                {filtrosOpen ? (
                  <ExtratoTableFiltersPanel
                    filtros={tableFiltros}
                    activeCount={activeTableFilters}
                    categorias={EXTRATO_CATEGORIAS}
                    contas={contasBancarias}
                    showContaFilter={showContaFilter}
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
              hasActiveExtratoTableFiltros(tableFiltros, showContaFilter)
                ? `Mostrando ${movimentosFiltrados.length} de ${movimentosBase.length} movimentações`
                : `Mostrando ${movimentosFiltrados.length} movimentações`
            }
            actionLabel="Conciliar selecionadas"
            onAction={() => {
              if (selectedIds.size === 0) {
                showToast({ message: 'Selecione movimentações para conciliar.', variant: 'info' })
                return
              }
              conciliarMutation.mutate(selectedArray, { onSuccess: () => setSelectedIds(new Set()) })
            }}
          />
        }
      >
        <SelectableDataTable
          columns={columns}
          data={movimentosFiltrados}
          getRowKey={(row) => row.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Nenhuma movimentação encontrada para os filtros selecionados."
        />
      </TableSection>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Excluir lançamento"
        description="Somente lançamentos manuais podem ser excluídos. O saldo da conta será recalculado."
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
