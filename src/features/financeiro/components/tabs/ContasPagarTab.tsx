import { useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Wallet,
} from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { CategoryBreakdown } from '@/features/financeiro/components/CategoryBreakdown'
import {
  ContasTituloTableFiltersButton,
  ContasTituloTableFiltersPanel,
} from '@/features/financeiro/components/ContasTituloTableFilters'
import { FinanceiroActionMenu } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroBaixaModal } from '@/features/financeiro/components/FinanceiroBaixaModal'
import { FinanceiroBulkBar } from '@/features/financeiro/components/FinanceiroBulkBar'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximosTitulos } from '@/features/financeiro/components/ProximosTitulos'
import { SelectableDataTable, FinanceiroTableToolbar } from '@/features/financeiro/components/SelectableDataTable'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { TableFooter, TableSection } from '@/features/financeiro/components/DataTable'
import { TituloDetalheDrawer } from '@/features/financeiro/components/TituloDetalheDrawer'
import { CONTAS_PAGAR_CATEGORIAS } from '@/features/financeiro/data/contasPagar'
import { EMPTY_CONTAS_TITULO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { FinanceiroQueryFeedback } from '@/features/financeiro/components/FinanceiroQueryFeedback'
import {
  mapBaixaToPagarPayload,
  useBulkContasPagarMutation,
  useContasPagarQuery,
  useDeleteContaPagarMutation,
  useDuplicateContaPagarMutation,
  useEstornarPagamentoMutation,
  usePagarContaMutation,
} from '@/features/financeiro/hooks/useFinanceiro'
import type { BaixaTituloFormValues, ContaPagar, ContasTituloTableFiltros, TableColumn } from '@/features/financeiro/types'
import { exportTitulosCsv } from '@/features/financeiro/utils/exportFinanceiro'
import {
  FORMA_PAGAMENTO_LABEL,
  countActiveContasTituloTableFiltros,
  formatBRL,
  getContasTituloTableItems,
  getProximosTitulos,
  groupByCategory,
  isVencido,
  isVencimentoProximo,
  sumByStatus,
  sumEmAberto,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ContasPagarTabProps {
  onNovo?: () => void
  onEditar?: (titulo: ContaPagar) => void
}

export function ContasPagarTab({ onNovo, onEditar }: ContasPagarTabProps) {
  const { showToast } = useToast()
  const { data: contas = [], isLoading, isError, refetch } = useContasPagarQuery()
  const pagarMutation = usePagarContaMutation()
  const estornarMutation = useEstornarPagamentoMutation()
  const deleteMutation = useDeleteContaPagarMutation()
  const duplicateMutation = useDuplicateContaPagarMutation()
  const bulkMutation = useBulkContasPagarMutation()

  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ContasTituloTableFiltros>(EMPTY_CONTAS_TITULO_TABLE_FILTROS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [baixaTitulo, setBaixaTitulo] = useState<ContaPagar | null>(null)
  const [detalheTitulo, setDetalheTitulo] = useState<ContaPagar | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const contasFiltradas = useMemo(
    () => getContasTituloTableItems(contas, tableFiltros, (conta) => conta.fornecedor),
    [contas, tableFiltros],
  )
  const activeTableFilters = countActiveContasTituloTableFiltros(tableFiltros)

  const totalAberto = useMemo(() => sumEmAberto(contas), [contas])
  const totalVencido = useMemo(() => sumByStatus(contas, 'vencido'), [contas])
  const totalProximo = useMemo(
    () =>
      contas
        .filter((c) => c.status === 'pendente' && isVencimentoProximo(c.vencimentoIso))
        .reduce((acc, c) => acc + c.valor, 0),
    [contas],
  )
  const totalPago = useMemo(() => sumByStatus(contas, 'pago'), [contas])

  const handleExport = useCallback(() => {
    exportTitulosCsv(
      'pagar',
      contasFiltradas.map((c) => ({
        Fornecedor: c.fornecedor,
        Documento: c.documento,
        Categoria: c.categoria,
        Vencimento: c.vencimento,
        Valor: c.valor,
        Status: c.status,
        Forma: FORMA_PAGAMENTO_LABEL[c.formaPagamento],
      })),
    )
    showToast({ message: 'Exportação CSV iniciada.', variant: 'success' })
  }, [contasFiltradas, showToast])

  const handleBaixa = useCallback(
    (baixa: BaixaTituloFormValues) => {
      if (!baixaTitulo) return
      pagarMutation.mutate(
        { id: baixaTitulo.id, payload: mapBaixaToPagarPayload(baixa) },
        { onSuccess: () => setBaixaTitulo(null) },
      )
    },
    [baixaTitulo, pagarMutation],
  )

  const buildMenuItems = useCallback(
    (conta: ContaPagar) => {
      const podeBaixar = conta.status !== 'pago' && conta.status !== 'cancelado'
      const podeExcluir = conta.status !== 'pago' && conta.status !== 'parcial' && (conta.valorBaixado ?? 0) === 0

      return [
        { id: 'ver', label: 'Visualizar', onClick: () => setDetalheTitulo(conta) },
        { id: 'editar', label: 'Editar', onClick: () => onEditar?.(conta), disabled: !podeBaixar },
        { id: 'pagar', label: 'Pagar', onClick: () => setBaixaTitulo(conta), disabled: !podeBaixar },
        { id: 'estornar', label: 'Estornar pagamento', onClick: () => estornarMutation.mutate(conta.id), disabled: conta.status !== 'pago' && conta.status !== 'parcial' },
        { id: 'anexo', label: 'Anexar nota fiscal', onClick: () => undefined, future: true },
        { id: 'comprovante', label: 'Baixar comprovante', onClick: () => undefined, future: true },
        { id: 'duplicar', label: 'Duplicar', onClick: () => duplicateMutation.mutate(conta.id) },
        { id: 'exportar', label: 'Exportar', onClick: handleExport, future: true },
        { id: 'excluir', label: 'Excluir', onClick: () => setConfirmDeleteId(conta.id), disabled: !podeExcluir, danger: true },
      ]
    },
    [duplicateMutation, estornarMutation, handleExport, onEditar, showToast],
  )

  const columns = useMemo<TableColumn<ContaPagar>[]>(
    () => [
      {
        key: 'fornecedor',
        header: 'Fornecedor',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.fornecedor}</p>
            <p className={styles.cellSubDesc}>{row.documento}</p>
          </>
        ),
      },
      {
        key: 'categoria',
        header: 'Categoria',
        cellClassName: styles.cellCategoria,
        render: (row) => row.categoria,
      },
      {
        key: 'vencimento',
        header: 'Vencimento',
        render: (row) => {
          const vencidoVisual = isVencido(row.vencimentoIso) && row.status !== 'pago'
          return (
            <span className={`${styles.cellVencimento} ${vencidoVisual ? styles.cellVencidoRed : ''}`}>
              {row.vencimento}
            </span>
          )
        },
      },
      {
        key: 'forma',
        header: 'Forma',
        render: (row) => <span className={styles.formaPagamento}>{FORMA_PAGAMENTO_LABEL[row.formaPagamento]}</span>,
      },
      {
        key: 'valor',
        header: 'Valor',
        align: 'right',
        headerClassName: styles.thRight,
        render: (row) => <span className={styles.cellValorNeg}>− {formatBRL(row.valor)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        headerClassName: styles.thCenter,
        cellClassName: styles.cellStatusCenter,
        render: (row) => <StatusBadge status={row.status} modulo="pagar" />,
      },
      {
        key: 'actions',
        header: '',
        headerClassName: styles.thNarrow,
        render: (row) => <FinanceiroActionMenu items={buildMenuItems(row)} />,
      },
    ],
    [buildMenuItems],
  )

  return (
    <FinanceiroQueryFeedback isLoading={isLoading} isError={isError} onRetry={() => void refetch()}>
    <>
      <KpiGrid>
        <FinanceiroKpiCard label="Total em aberto" value={formatBRL(totalAberto)} trend={`${contas.filter((c) => c.status !== 'pago' && c.status !== 'cancelado').length} títulos`} progress={42} progressColor="#e24b4a" icon={<Wallet size={13} />} colorClass={styles.colorRed} />
        <FinanceiroKpiCard label="Vencidas" value={formatBRL(totalVencido)} trend={`${contas.filter((c) => c.status === 'vencido').length} em atraso`} progress={38} progressColor="#e24b4a" icon={<AlertCircle size={13} />} colorClass={styles.colorRed} />
        <FinanceiroKpiCard label="A vencer (7 dias)" value={formatBRL(totalProximo)} trend="Compromissos próximos" progress={45} progressColor="#f97316" icon={<CalendarClock size={13} />} colorClass={styles.colorOrange} />
        <FinanceiroKpiCard label="Pagas no mês" value={formatBRL(totalPago)} trend={`${contas.filter((c) => c.status === 'pago').length} pagamento(s)`} trendPositive progress={60} progressColor="#16a34a" icon={<CheckCircle2 size={13} />} colorClass={styles.colorGreen} />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown items={groupByCategory(contas)} title="Despesas por categoria" hint="Em aberto" />
        <ProximosTitulos titulos={getProximosTitulos(contas)} getLabel={(t) => t.fornecedor} valorClassName={styles.cellValorNeg} title="Próximos pagamentos" hint="Saídas previstas" />
      </div>

      <TableSection
        toolbar={
          <FinanceiroTableToolbar
            title="Contas a pagar"
            subtitle={`${contasFiltradas.length} de ${contas.length} títulos`}
            bulkBar={
              <FinanceiroBulkBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
                <button type="button" className={styles.bulkBtn} onClick={() => { const first = contas.find((c) => selectedIds.has(c.id)); if (first) setBaixaTitulo(first) }}>Pagar selecionadas</button>
                <button type="button" className={styles.bulkBtn} onClick={() => { bulkMutation.mutate({ ids: [...selectedIds], action: 'cancelar' }, { onSuccess: () => setSelectedIds(new Set()) }) }}>Cancelar</button>
                <button type="button" className={styles.bulkBtn} onClick={handleExport}>Exportar</button>
                <button type="button" className={styles.bulkBtn} onClick={() => { bulkMutation.mutate({ ids: [...selectedIds], action: 'excluir' }, { onSuccess: () => setSelectedIds(new Set()) }) }}>Excluir</button>
              </FinanceiroBulkBar>
            }
            filters={
              <>
                <div className={styles.tableToolbar}>
                  <div />
                  <div className={styles.tableToolbarRight}>
                    <button type="button" className={styles.btnSecondary} onClick={handleExport}>Exportar CSV</button>
                    <button type="button" className={styles.btnPrimary} onClick={onNovo}>+ Nova despesa</button>
                    <ContasTituloTableFiltersButton open={filtrosOpen} activeCount={activeTableFilters} onToggle={() => setFiltrosOpen((c) => !c)} />
                  </div>
                </div>
                {filtrosOpen ? (
                  <ContasTituloTableFiltersPanel
                    title="Filtrar contas a pagar"
                    parteLabel="Fornecedor"
                    partePlaceholder="Buscar por fornecedor ou documento"
                    categorias={CONTAS_PAGAR_CATEGORIAS}
                    filtros={tableFiltros}
                    activeCount={activeTableFilters}
                    onChange={setTableFiltros}
                    onClear={() => setTableFiltros(EMPTY_CONTAS_TITULO_TABLE_FILTROS)}
                    onClose={() => setFiltrosOpen(false)}
                  />
                ) : null}
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${contasFiltradas.length} contas a pagar`}
            actionLabel="Registrar pagamento"
            onAction={() => {
              const first = contasFiltradas.find((c) => c.status !== 'pago' && c.status !== 'cancelado')
              if (first) setBaixaTitulo(first)
              else showToast({ message: 'Nenhum título em aberto para pagar.', variant: 'info' })
            }}
          />
        }
      >
        <SelectableDataTable
          columns={columns}
          data={contasFiltradas}
          getRowKey={(row) => row.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Nenhuma conta a pagar encontrada para os filtros selecionados."
        />
      </TableSection>

      <FinanceiroBaixaModal
        open={!!baixaTitulo}
        modulo="pagar"
        titulo={baixaTitulo ?? { id: '', categoria: '', vencimento: '', vencimentoIso: '', valor: 0, formaPagamento: 'pix', status: 'pendente', documento: '—', fornecedor: '' }}
        onClose={() => setBaixaTitulo(null)}
        onConfirm={handleBaixa}
      />

      <TituloDetalheDrawer
        open={!!detalheTitulo}
        modulo="pagar"
        titulo={detalheTitulo}
        onClose={() => setDetalheTitulo(null)}
        onEdit={() => {
          if (detalheTitulo) onEditar?.(detalheTitulo)
          setDetalheTitulo(null)
        }}
      />

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Excluir conta a pagar"
        description="Esta ação não pode ser desfeita. O título será removido permanentemente."
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
