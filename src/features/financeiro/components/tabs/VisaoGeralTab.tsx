import { useMemo } from 'react'
import { MoreHorizontal, SlidersHorizontal, TrendingDown, TrendingUp, Clock } from 'lucide-react'

import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FilterPills, FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FluxoCaixaChart } from '@/features/financeiro/components/FluxoCaixaChart'
import { StatusBadge, TipoBadge } from '@/features/financeiro/components/StatusBadge'
import { CONTAS_BANCARIAS, FLUXO_MES, LANCAMENTO_FILTROS, LANCAMENTOS } from '@/features/financeiro/data/shared'
import type { FiltroLancamento, Lancamento, Periodo, TableColumn } from '@/features/financeiro/types'
import { filterLancamentos, formatBRL, getPeriodoLabel, isVencido } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface VisaoGeralTabProps {
  periodo: Periodo
  filtro: FiltroLancamento
  onFiltroChange: (filtro: FiltroLancamento) => void
}

export function VisaoGeralTab({ periodo, filtro, onFiltroChange }: VisaoGeralTabProps) {
  const totalSaldo = CONTAS_BANCARIAS.reduce((s, c) => s + c.saldo, 0)
  const receitasMes = 48320
  const despesasMes = 31150
  const resultado = receitasMes - despesasMes
  const periodoLabel = getPeriodoLabel(periodo)

  const lancamentosFiltrados = useMemo(() => filterLancamentos(LANCAMENTOS, filtro), [filtro])

  const columns = useMemo<TableColumn<Lancamento>[]>(
    () => [
      {
        key: 'descricao',
        header: 'Descrição',
        render: (row) => (
          <>
            <p className={styles.cellDescricao}>{row.descricao}</p>
            <p className={styles.cellSubDesc}>{row.subDescricao}</p>
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
        key: 'tipo',
        header: 'Tipo',
        render: (row) => <TipoBadge tipo={row.tipo} />,
      },
      {
        key: 'valor',
        header: 'Valor',
        align: 'right',
        headerClassName: styles.thRight,
        cellClassName: styles.cellValorNeg,
        render: (row) => (
          <span className={row.tipo === 'receber' ? styles.cellValorPos : styles.cellValorNeg}>
            {row.tipo === 'receber' ? '+' : '−'} {formatBRL(row.valor)}
          </span>
        ),
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
        <FinanceiroKpiCard label="Receitas do mês" value={formatBRL(receitasMes)} trend="↑ 12% vs mês anterior" trendPositive progress={72} progressColor="#16a34a" icon={<TrendingUp size={13} />} colorClass={styles.colorGreen} />
        <FinanceiroKpiCard label="Despesas do mês" value={formatBRL(despesasMes)} trend="↑ 4% vs mês anterior" progress={48} progressColor="#e24b4a" icon={<TrendingDown size={13} />} colorClass={styles.colorRed} />
        <FinanceiroKpiCard label="Resultado líquido" value={formatBRL(resultado)} trend={`Margem de ${((resultado / receitasMes) * 100).toFixed(1)}%`} trendPositive progress={35} progressColor="#f97316" icon={<TrendingUp size={13} />} colorClass={styles.colorOrange} />
        <FinanceiroKpiCard label="A vencer em 7 dias" value={formatBRL(8400)} trend="3 títulos pendentes" progress={25} progressColor="#f97316" icon={<Clock size={13} />} colorClass={styles.colorAmber} />
      </KpiGrid>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Saldo por conta</h3>
            <button type="button" className={styles.cardLink}>
              Gerenciar
            </button>
          </div>
          <div className={styles.contaList}>
            {CONTAS_BANCARIAS.map((conta) => (
              <div key={conta.id} className={styles.contaItem}>
                <div className={styles.contaItemLeft}>
                  <ContaIcon banco={conta.banco} />
                  {conta.nome}
                </div>
                <span className={styles.contaSaldo}>{formatBRL(conta.saldo)}</span>
              </div>
            ))}
          </div>
          <div className={styles.contaTotal}>
            <span className={styles.contaTotalLabel}>Saldo total disponível</span>
            <span className={styles.contaTotalValue}>{formatBRL(totalSaldo)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Fluxo de caixa — {periodoLabel}</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotGreen}`} /> Entradas</span>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotRed}`} /> Saídas</span>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotGray}`} /> Projeção</span>
            </div>
          </div>
          <FluxoCaixaChart dados={FLUXO_MES} />
        </div>
      </div>

      <TableSection
        toolbar={
          <TableToolbar
            title="Lançamentos recentes"
            subtitle={`${LANCAMENTOS.length} lançamentos em junho`}
            actions={
              <>
                <FilterPills options={LANCAMENTO_FILTROS} value={filtro} onChange={onFiltroChange} />
                <button type="button" className={styles.btnSecondary}>
                  <SlidersHorizontal size={12} /> Filtros
                </button>
              </>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${lancamentosFiltrados.length} de ${LANCAMENTOS.length} lançamentos`}
          />
        }
      >
        <DataTable columns={columns} data={lancamentosFiltrados} getRowKey={(row) => row.id} />
      </TableSection>
    </>
  )
}
