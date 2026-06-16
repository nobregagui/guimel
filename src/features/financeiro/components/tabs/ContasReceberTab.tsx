import { useMemo } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  HandCoins,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react'

import { CategoryBreakdown } from '@/features/financeiro/components/CategoryBreakdown'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FilterPills, FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { ProximosTitulos } from '@/features/financeiro/components/ProximosTitulos'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { CONTAS_RECEBER, CONTAS_RECEBER_FILTROS } from '@/features/financeiro/data/contasReceber'
import type { ContaReceber, ContasReceberFiltro, TableColumn } from '@/features/financeiro/types'
import {
  FORMA_PAGAMENTO_LABEL,
  filterContasReceber,
  formatBRL,
  getProximosTitulos,
  groupByCategory,
  isVencido,
  isVencimentoProximo,
  sumByStatus,
  sumEmAberto,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ContasReceberTabProps {
  filtro: ContasReceberFiltro
  onFiltroChange: (filtro: ContasReceberFiltro) => void
}

export function ContasReceberTab({ filtro, onFiltroChange }: ContasReceberTabProps) {
  const contasFiltradas = useMemo(() => filterContasReceber(CONTAS_RECEBER, filtro), [filtro])

  const totalAberto = useMemo(() => sumEmAberto(CONTAS_RECEBER), [])
  const totalVencido = useMemo(() => sumByStatus(CONTAS_RECEBER, 'vencido'), [])
  const totalProximo = useMemo(
    () =>
      CONTAS_RECEBER.filter((c) => c.status === 'pendente' && isVencimentoProximo(c.vencimentoIso)).reduce(
        (acc, c) => acc + c.valor,
        0,
      ),
    [],
  )
  const totalRecebido = useMemo(() => sumByStatus(CONTAS_RECEBER, 'pago'), [])

  const categorias = useMemo(() => groupByCategory(CONTAS_RECEBER), [])
  const proximosRecebimentos = useMemo(() => getProximosTitulos(CONTAS_RECEBER), [])

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

  return (
    <>
      <KpiGrid>
        <FinanceiroKpiCard
          label="Total a receber"
          value={formatBRL(totalAberto)}
          trend={`${CONTAS_RECEBER.filter((c) => c.status !== 'pago').length} títulos em aberto`}
          trendPositive
          progress={72}
          progressColor="#16a34a"
          icon={<HandCoins size={13} />}
          colorClass={styles.colorGreen}
        />
        <FinanceiroKpiCard
          label="Vencidas"
          value={formatBRL(totalVencido)}
          trend={`${CONTAS_RECEBER.filter((c) => c.status === 'vencido').length} título(s) em atraso`}
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
          trend={`${CONTAS_RECEBER.filter((c) => c.status === 'pago').length} recebimento(s) confirmado(s)`}
          trendPositive
          progress={60}
          progressColor="#16a34a"
          icon={<CheckCircle2 size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <CategoryBreakdown
          items={categorias}
          title="Receitas por categoria"
          hint="Em aberto"
        />

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
          <TableToolbar
            title="Contas a receber"
            subtitle={`${contasFiltradas.length} de ${CONTAS_RECEBER.length} títulos em junho`}
            actions={
              <>
                <FilterPills options={CONTAS_RECEBER_FILTROS} value={filtro} onChange={onFiltroChange} />
                <button type="button" className={styles.btnSecondary}>
                  <SlidersHorizontal size={12} /> Filtros
                </button>
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${contasFiltradas.length} de ${CONTAS_RECEBER.length} contas a receber`}
            actionLabel="Registrar recebimento"
          />
        }
      >
        <DataTable
          columns={columns}
          data={contasFiltradas}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma conta a receber encontrada para o filtro selecionado."
        />
      </TableSection>
    </>
  )
}
