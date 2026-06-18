import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  HandCoins,
  MoreHorizontal,
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
import { CONTAS_RECEBER_CATEGORIAS } from '@/features/financeiro/data/contasReceber'
import { EMPTY_CONTAS_TITULO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type { ContaReceber, ContasTituloTableFiltros, TableColumn } from '@/features/financeiro/types'
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

export function ContasReceberTab() {
  const contas = useFinanceiroStore((s) => s.contasReceber)
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ContasTituloTableFiltros>(EMPTY_CONTAS_TITULO_TABLE_FILTROS)

  const contasFiltradas = useMemo(
    () => getContasTituloTableItems(contas, tableFiltros, (conta) => conta.cliente),
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
  const totalRecebido = useMemo(() => sumByStatus(contas, 'pago'), [contas])

  const categorias = useMemo(() => groupByCategory(contas), [contas])
  const proximosRecebimentos = useMemo(() => getProximosTitulos(contas), [contas])

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
        render: (row) => (
          <span className={styles.formaPagamento}>{FORMA_PAGAMENTO_LABEL[row.formaPagamento]}</span>
        ),
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
          label="Total a receber"
          value={formatBRL(totalAberto)}
          trend={`${contas.filter((c) => c.status !== 'pago').length} títulos em aberto`}
          trendPositive
          progress={72}
          progressColor="#16a34a"
          icon={<HandCoins size={13} />}
          colorClass={styles.colorGreen}
        />
        <FinanceiroKpiCard
          label="Vencidas"
          value={formatBRL(totalVencido)}
          trend={`${contas.filter((c) => c.status === 'vencido').length} título(s) em atraso`}
          progress={38}
          progressColor="#e24b4a"
          icon={<AlertCircle size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="A receber (7 dias)"
          value={formatBRL(totalProximo)}
          trend="Previsão de entrada"
          trendPositive
          progress={45}
          progressColor="#f97316"
          icon={<CalendarClock size={13} />}
          colorClass={styles.colorOrange}
        />
        <FinanceiroKpiCard
          label="Recebidas no mês"
          value={formatBRL(totalRecebido)}
          trend={`${contas.filter((c) => c.status === 'pago').length} recebimento(s) confirmado(s)`}
          trendPositive
          progress={60}
          progressColor="#16a34a"
          icon={<CheckCircle2 size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown items={categorias} title="Receitas por categoria" hint="Em aberto" />
        <ProximosTitulos
          titulos={proximosRecebimentos}
          getLabel={(titulo) => titulo.cliente}
          valorClassName={styles.cellValorPos}
          title="Próximos recebimentos"
          hint="Entradas previstas"
        />
      </div>

      <TableSection
        toolbar={
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Contas a receber"
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
                title="Filtrar contas a receber"
                parteLabel="Cliente"
                partePlaceholder="Buscar por cliente ou documento"
                categorias={CONTAS_RECEBER_CATEGORIAS}
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
                ? `Mostrando ${contasFiltradas.length} de ${contasBaseCount} contas a receber`
                : `Mostrando ${contasFiltradas.length} contas a receber`
            }
            actionLabel="Registrar recebimento"
          />
        }
      >
        <DataTable
          columns={columns}
          data={contasFiltradas}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma conta a receber encontrada para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
