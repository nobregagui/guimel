import { useMemo } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  MoreHorizontal,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'

import { CategoryBreakdown } from '@/features/financeiro/components/CategoryBreakdown'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FilterPills, FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximosTitulos } from '@/features/financeiro/components/ProximosTitulos'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { CONTAS_PAGAR, CONTAS_PAGAR_FILTROS } from '@/features/financeiro/data/contasPagar'
import type { ContaPagar, ContasPagarFiltro, TableColumn } from '@/features/financeiro/types'
import {
  FORMA_PAGAMENTO_LABEL,
  filterContasPagar,
  formatBRL,
  getProximosTitulos,
  groupByCategory,
  isVencido,
  isVencimentoProximo,
  sumByStatus,
  sumEmAberto,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ContasPagarTabProps {
  filtro: ContasPagarFiltro
  onFiltroChange: (filtro: ContasPagarFiltro) => void
}

export function ContasPagarTab({ filtro, onFiltroChange }: ContasPagarTabProps) {
  const contasFiltradas = useMemo(() => filterContasPagar(CONTAS_PAGAR, filtro), [filtro])

  const totalAberto = useMemo(() => sumEmAberto(CONTAS_PAGAR), [])
  const totalVencido = useMemo(() => sumByStatus(CONTAS_PAGAR, 'vencido'), [])
  const totalProximo = useMemo(
    () =>
      CONTAS_PAGAR.filter((c) => c.status === 'pendente' && isVencimentoProximo(c.vencimentoIso)).reduce(
        (acc, c) => acc + c.valor,
        0,
      ),
    [],
  )
  const totalPago = useMemo(() => sumByStatus(CONTAS_PAGAR, 'pago'), [])

  const categorias = useMemo(() => groupByCategory(CONTAS_PAGAR), [])
  const proximosVencimentos = useMemo(() => getProximosTitulos(CONTAS_PAGAR), [])

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

  return (
    <>
      <KpiGrid>
        <FinanceiroKpiCard
          label="Total em aberto"
          value={formatBRL(totalAberto)}
          trend={`${CONTAS_PAGAR.filter((c) => c.status !== 'pago').length} títulos pendentes`}
          progress={68}
          progressColor="#dc2626"
          icon={<Wallet size={13} />}
          colorClass={styles.colorRed}
        />
        <FinanceiroKpiCard
          label="Vencidas"
          value={formatBRL(totalVencido)}
          trend={`${CONTAS_PAGAR.filter((c) => c.status === 'vencido').length} título(s) em atraso`}
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
          trend={`${CONTAS_PAGAR.filter((c) => c.status === 'pago').length} pagamento(s) confirmado(s)`}
          trendPositive
          progress={55}
          progressColor="#16a34a"
          icon={<CheckCircle2 size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown items={categorias} />

        <ProximosTitulos
          titulos={proximosVencimentos}
          getLabel={(titulo) => titulo.fornecedor}
        />
      </div>

      <TableSection
        toolbar={
          <TableToolbar
            title="Contas a pagar"
            subtitle={`${contasFiltradas.length} de ${CONTAS_PAGAR.length} títulos em junho`}
            actions={
              <>
                <FilterPills options={CONTAS_PAGAR_FILTROS} value={filtro} onChange={onFiltroChange} />
                <button type="button" className={styles.btnSecondary}>
                  <SlidersHorizontal size={12} /> Filtros
                </button>
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${contasFiltradas.length} de ${CONTAS_PAGAR.length} contas a pagar`}
            actionLabel="Registrar pagamento"
          />
        }
      >
        <DataTable
          columns={columns}
          data={contasFiltradas}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma conta a pagar encontrada para o filtro selecionado."
        />
      </TableSection>
    </>
  )
}
