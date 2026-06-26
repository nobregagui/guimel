import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  MoreHorizontal,
  Wallet,
} from 'lucide-react'

import { CategoryBreakdown } from '@/features/financeiro/components/CategoryBreakdown'
import {
  ContasTituloTableFiltersButton,
  ContasTituloTableFiltersPanel,
} from '@/features/financeiro/components/ContasTituloTableFilters'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximosTitulos } from '@/features/financeiro/components/ProximosTitulos'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { CONTAS_PAGAR_CATEGORIAS } from '@/features/financeiro/data/contasPagar'
import { EMPTY_CONTAS_TITULO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type { ContaPagar, ContasTituloTableFiltros, TableColumn } from '@/features/financeiro/types'
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
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

export function ContasPagarTab() {
  const contas = useFinanceiroStore((s) => s.contasPagar)
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ContasTituloTableFiltros>(EMPTY_CONTAS_TITULO_TABLE_FILTROS)

  const contasFiltradas = useMemo(
    () => getContasTituloTableItems(contas, tableFiltros, (conta) => conta.fornecedor),
    [contas, tableFiltros],
  )
  const activeTableFilters = countActiveContasTituloTableFiltros(tableFiltros)
  const contasBaseCount = contas.length

  const totalAberto = useMemo(() => sumEmAberto(contas), [contas])
  const totalVencido = useMemo(() => sumByStatus(contas, 'vencido'), [contas])
  const totalProximo = useMemo(
    () =>
      contas.filter((c) => c.status === 'pendente' && isVencimentoProximo(c.vencimentoIso)).reduce(
        (acc, c) => acc + c.valor,
        0,
      ),
    [contas],
  )
  const totalPago = useMemo(() => sumByStatus(contas, 'pago'), [contas])

  const categorias = useMemo(() => groupByCategory(contas), [contas])
  const proximosVencimentos = useMemo(() => getProximosTitulos(contas), [contas])

  const columns = useMemo<TableColumn<ContaPagar>[]>(
    () => [
      {
        key: 'fornecedor',
        header: 'Fornecedor',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.fornecedor}</p>
            <p className={styles.cellSubDesc}>
              {row.documento}
              {row.modoLancamento === 'recorrente' ? (
                <span className={styles.recorrenciaTag}>
                  {' '}
                  · Recorrente
                  {row.recorrenciaParcela && row.recorrenciaTotal
                    ? ` ${row.recorrenciaParcela}/${row.recorrenciaTotal}`
                    : ''}
                </span>
              ) : null}
            </p>
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
        render: (row) => <StatusBadge status={row.status} />,
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

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_CONTAS_TITULO_TABLE_FILTROS)
  }

  return (
    <>
      <KpiGrid>
        <FinanceiroKpiCard
          label="Total em aberto"
          value={formatBRL(totalAberto)}
          trend={`${contas.filter((c) => c.status !== 'pago').length} títulos pendentes`}
          progress={68}
          progressColor="#dc2626"
          icon={<Wallet size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="Vencidas"
          value={formatBRL(totalVencido)}
          trend={`${contas.filter((c) => c.status === 'vencido').length} título(s) em atraso`}
          progress={42}
          progressColor="#e24b4a"
          icon={<AlertCircle size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="A vencer (7 dias)"
          value={formatBRL(totalProximo)}
          trend="Próximos vencimentos"
          trendPositive
          progress={30}
          progressColor="#f97316"
          icon={<CalendarClock size={13} />}
          colorClass={styles.colorOrange}
        />
        <FinanceiroKpiCard
          label="Pagas no mês"
          value={formatBRL(totalPago)}
          trend={`${contas.filter((c) => c.status === 'pago').length} pagamento(s) confirmado(s)`}
          trendPositive
          progress={55}
          progressColor="#16a34a"
          icon={<CheckCircle2 size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown items={categorias} />
        <ProximosTitulos titulos={proximosVencimentos} getLabel={(titulo) => titulo.fornecedor} />
      </div>

      <TableSection
        toolbar={
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Contas a pagar"
              subtitle={
                hasActiveContasTituloTableFiltros(tableFiltros)
                  ? `${contasFiltradas.length} de ${contasBaseCount} títulos em junho`
                  : `${contasBaseCount} títulos em junho`
              }
              actions={
                <ContasTituloTableFiltersButton
                  open={filtrosOpen}
                  activeCount={activeTableFilters}
                  onToggle={() => setFiltrosOpen((current) => !current)}
                />
              }
            />

            {filtrosOpen ? (
              <ContasTituloTableFiltersPanel
                title="Filtrar contas a pagar"
                parteLabel="Fornecedor"
                partePlaceholder="Buscar por fornecedor ou documento"
                categorias={CONTAS_PAGAR_CATEGORIAS}
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
              hasActiveContasTituloTableFiltros(tableFiltros)
                ? `Mostrando ${contasFiltradas.length} de ${contasBaseCount} contas a pagar`
                : `Mostrando ${contasFiltradas.length} contas a pagar`
            }
            actionLabel="Registrar pagamento"
          />
        }
      >
        <DataTable
          columns={columns}
          data={contasFiltradas}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma conta a pagar encontrada para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
