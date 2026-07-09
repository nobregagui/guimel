import { useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  HandCoins,
} from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { usePermissions } from '@/hooks/usePermissions'
import { CategoryBreakdown } from '@/features/financeiro/components/CategoryBreakdown'
import {
  ContasTituloTableFiltersButton,
  ContasTituloTableFiltersPanel,
} from '@/features/financeiro/components/ContasTituloTableFilters'
import type { ActionMenuItem } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroActionMenu } from '@/features/financeiro/components/FinanceiroActionMenu'
import { FinanceiroBaixaModal } from '@/features/financeiro/components/FinanceiroBaixaModal'
import { FinanceiroBulkBar } from '@/features/financeiro/components/FinanceiroBulkBar'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximosTitulos } from '@/features/financeiro/components/ProximosTitulos'
import { SelectableDataTable, FinanceiroTableToolbar } from '@/features/financeiro/components/SelectableDataTable'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { TableFooter, TableSection } from '@/features/financeiro/components/DataTable'
import { TituloDetalheDrawer } from '@/features/financeiro/components/TituloDetalheDrawer'
import { CONTAS_RECEBER_CATEGORIAS } from '@/features/financeiro/data/contasReceber'
import { EMPTY_CONTAS_TITULO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { FinanceiroQueryFeedback } from '@/features/financeiro/components/FinanceiroQueryFeedback'
import {
  mapBaixaToReceberPayload,
  useBulkContasReceberMutation,
  useContasReceberQuery,
  useDeleteContaReceberMutation,
  useDuplicateContaReceberMutation,
  useEstornarRecebimentoMutation,
  useReceberContaMutation,
} from '@/features/financeiro/hooks/useFinanceiro'
import type { BaixaTituloFormValues, ContaReceber, ContasTituloTableFiltros, TableColumn } from '@/features/financeiro/types'
import { exportTitulosCsv } from '@/features/financeiro/utils/exportFinanceiro'
import {
  FORMA_PAGAMENTO_LABEL,
  countActiveContasTituloTableFiltros,
  formatBRL,
  getContasTituloTableItems,
  getProximosTitulos,
  groupByCategory,
  hasActiveContasTituloTableFiltros,
  isVencido,
  isVencimentoProximo,
  sumByStatus,
  sumEmAberto,
} from '@/features/financeiro/utils'
import {
  canReceiveTitulo,
  canReverseFinanceiro,
  canWriteContasReceber,
} from '@/utils/financePermissions'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ContasReceberTabProps {
  onNovo?: () => void
  onEditar?: (titulo: ContaReceber) => void
}

export function ContasReceberTab({ onNovo, onEditar }: ContasReceberTabProps) {
  const { showToast } = useToast()
  const { userPermissions, isReadOnly } = usePermissions()
  const { data: contas = [], isLoading, isError, refetch } = useContasReceberQuery()
  const receberMutation = useReceberContaMutation()
  const estornarMutation = useEstornarRecebimentoMutation()
  const deleteMutation = useDeleteContaReceberMutation()
  const duplicateMutation = useDuplicateContaReceberMutation()
  const bulkMutation = useBulkContasReceberMutation()

  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ContasTituloTableFiltros>(EMPTY_CONTAS_TITULO_TABLE_FILTROS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [baixaTitulo, setBaixaTitulo] = useState<ContaReceber | null>(null)
  const [detalheTitulo, setDetalheTitulo] = useState<ContaReceber | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const contasFiltradas = useMemo(
    () => getContasTituloTableItems(contas, tableFiltros, (conta) => conta.cliente),
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
  const totalRecebido = useMemo(() => sumByStatus(contas, 'pago'), [contas])

  const handleExport = useCallback(() => {
    const rows = contasFiltradas.map((c) => ({
      Cliente: c.cliente,
      Documento: c.documento,
      Categoria: c.categoria,
      Vencimento: c.vencimento,
      Valor: c.valor,
      Status: c.status,
      Forma: FORMA_PAGAMENTO_LABEL[c.formaPagamento],
    }))
    exportTitulosCsv('receber', rows)
    showToast({ message: 'Exportação CSV iniciada.', variant: 'success' })
  }, [contasFiltradas, showToast])

  const handleBaixa = useCallback(
    (baixa: BaixaTituloFormValues) => {
      if (!baixaTitulo) return
      receberMutation.mutate(
        { id: baixaTitulo.id, payload: mapBaixaToReceberPayload(baixa) },
        { onSuccess: () => setBaixaTitulo(null) },
      )
    },
    [baixaTitulo, receberMutation],
  )

  const buildMenuItems = useCallback(
    (conta: ContaReceber) => {
      const podeBaixar = conta.status !== 'pago' && conta.status !== 'cancelado'
      const podeExcluir =
        conta.status !== 'pago' && conta.status !== 'parcial' && (conta.valorBaixado ?? 0) === 0
      const receiveCheck = canReceiveTitulo(userPermissions)
      const canWrite = canWriteContasReceber(userPermissions) && !isReadOnly
      const canReverse = canReverseFinanceiro(userPermissions) && !isReadOnly

      const items: ActionMenuItem[] = [
        { id: 'ver', label: 'Visualizar', onClick: () => setDetalheTitulo(conta) },
      ]

      if (canWrite) {
        items.push({
          id: 'editar',
          label: 'Editar',
          onClick: () => onEditar?.(conta),
          disabled: !podeBaixar,
        })
      }

      if (!isReadOnly && podeBaixar && receiveCheck.allowed) {
        items.push({ id: 'receber', label: 'Receber', onClick: () => setBaixaTitulo(conta) })
      }

      if (canReverse) {
        items.push({
          id: 'estornar',
          label: 'Estornar recebimento',
          onClick: () => estornarMutation.mutate(conta.id),
          disabled: conta.status !== 'pago' && conta.status !== 'parcial',
        })
      }

      items.push(
        { id: 'boleto', label: 'Gerar boleto', onClick: () => undefined, future: true },
        { id: 'pix', label: 'Gerar Pix', onClick: () => undefined, future: true },
        {
          id: 'nfe',
          label: 'Emitir NF-e',
          onClick: () => showToast({ message: 'Vincule a uma venda para emitir NF-e.', variant: 'info' }),
          future: !conta.vendaId,
        },
        { id: 'anexo', label: 'Anexar documento', onClick: () => undefined, future: true },
      )

      if (canWrite) {
        items.push({ id: 'duplicar', label: 'Duplicar', onClick: () => duplicateMutation.mutate(conta.id) })
      }

      items.push(
        { id: 'enviar', label: 'Enviar cobrança', onClick: () => undefined, future: true },
        { id: 'imprimir', label: 'Imprimir', onClick: () => window.print(), future: true },
      )

      if (canWrite) {
        items.push({
          id: 'excluir',
          label: 'Excluir',
          onClick: () => setConfirmDeleteId(conta.id),
          disabled: !podeExcluir,
          danger: true,
        })
      }

      return items
    },
    [duplicateMutation, estornarMutation, isReadOnly, onEditar, showToast, userPermissions],
  )

  const columns = useMemo<TableColumn<ContaReceber>[]>(
    () => [
      {
        key: 'cliente',
        header: 'Cliente',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.cliente}</p>
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
        render: (row) => <span className={styles.cellValorPos}>+ {formatBRL(row.valor)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        headerClassName: styles.thCenter,
        cellClassName: styles.cellStatusCenter,
        render: (row) => <StatusBadge status={row.status} modulo="receber" />,
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
        <FinanceiroKpiCard label="Total a receber" value={formatBRL(totalAberto)} trend={`${contas.filter((c) => c.status !== 'pago').length} títulos em aberto`} trendPositive progress={72} progressColor="#16a34a" icon={<HandCoins size={13} />} colorClass={styles.colorGreen} />
        <FinanceiroKpiCard label="Atrasadas" value={formatBRL(totalVencido)} trend={`${contas.filter((c) => c.status === 'vencido').length} título(s) em atraso`} progress={38} progressColor="#e24b4a" icon={<AlertCircle size={13} />} colorClass={styles.colorRed} />
        <FinanceiroKpiCard label="A receber (7 dias)" value={formatBRL(totalProximo)} trend="Previsão de entrada" trendPositive progress={45} progressColor="#f97316" icon={<CalendarClock size={13} />} colorClass={styles.colorOrange} />
        <FinanceiroKpiCard label="Recebidas no mês" value={formatBRL(totalRecebido)} trend={`${contas.filter((c) => c.status === 'pago').length} recebimento(s)`} trendPositive progress={60} progressColor="#16a34a" icon={<CheckCircle2 size={13} />} colorClass={styles.colorGreen} />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown items={groupByCategory(contas)} title="Receitas por categoria" hint="Em aberto" />
        <ProximosTitulos titulos={getProximosTitulos(contas)} getLabel={(t) => t.cliente} valorClassName={styles.cellValorPos} title="Próximos recebimentos" hint="Entradas previstas" />
      </div>

      <TableSection
        toolbar={
          <FinanceiroTableToolbar
            title="Contas a receber"
            subtitle={
              hasActiveContasTituloTableFiltros(tableFiltros)
                ? `${contasFiltradas.length} de ${contas.length} títulos`
                : `${contas.length} títulos cadastrados`
            }
            bulkBar={
              <FinanceiroBulkBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
                <button type="button" className={styles.bulkBtn} onClick={() => { const first = contas.find((c) => selectedIds.has(c.id)); if (first) setBaixaTitulo(first) }}>Receber selecionadas</button>
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
                    <button type="button" className={styles.btnPrimary} onClick={onNovo}>+ Nova conta</button>
                    <ContasTituloTableFiltersButton open={filtrosOpen} activeCount={activeTableFilters} onToggle={() => setFiltrosOpen((c) => !c)} />
                  </div>
                </div>
                {filtrosOpen ? (
                  <ContasTituloTableFiltersPanel
                    title="Filtrar contas a receber"
                    parteLabel="Cliente"
                    partePlaceholder="Buscar por cliente ou documento"
                    categorias={CONTAS_RECEBER_CATEGORIAS}
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
            info={`Mostrando ${contasFiltradas.length} contas a receber`}
            actionLabel="Registrar recebimento"
            onAction={() => {
              const first = contasFiltradas.find((c) => c.status !== 'pago' && c.status !== 'cancelado')
              if (first) setBaixaTitulo(first)
              else showToast({ message: 'Nenhum título em aberto para receber.', variant: 'info' })
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
          emptyMessage="Nenhuma conta a receber encontrada para os filtros selecionados."
        />
      </TableSection>

      <FinanceiroBaixaModal
        open={!!baixaTitulo}
        modulo="receber"
        titulo={baixaTitulo ?? { id: '', categoria: '', vencimento: '', vencimentoIso: '', valor: 0, formaPagamento: 'pix', status: 'pendente', documento: '—', cliente: '' }}
        onClose={() => setBaixaTitulo(null)}
        onConfirm={handleBaixa}
      />

      <TituloDetalheDrawer
        open={!!detalheTitulo}
        modulo="receber"
        titulo={detalheTitulo}
        onClose={() => setDetalheTitulo(null)}
        onEdit={() => {
          if (detalheTitulo) onEditar?.(detalheTitulo)
          setDetalheTitulo(null)
        }}
      />

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Excluir conta a receber"
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
