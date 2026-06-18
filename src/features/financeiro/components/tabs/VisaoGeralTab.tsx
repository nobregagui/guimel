import { useMemo, useState } from 'react'
import { MoreHorizontal, TrendingDown, TrendingUp, Clock } from 'lucide-react'

import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FluxoCaixaChart } from '@/features/financeiro/components/FluxoCaixaChart'
import {
  LancamentosTableFiltersButton,
  LancamentosTableFiltersPanel,
} from '@/features/financeiro/components/LancamentosTableFilters'
import { StatusBadge, TipoBadge } from '@/features/financeiro/components/StatusBadge'
import { EMPTY_LANCAMENTOS_TABLE_FILTROS, FLUXO_MES } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type { Lancamento, LancamentosTableFiltros, Periodo, TableColumn } from '@/features/financeiro/types'
import {
  countActiveLancamentosTableFiltros,
  formatBRL,
  getPeriodoLabel,
  getRecentesTableLancamentos,
  hasActiveLancamentosTableFiltros,
  isVencido,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface VisaoGeralTabProps {
  periodo: Periodo
}

export function VisaoGeralTab({ periodo }: VisaoGeralTabProps) {
  const lancamentosBase = useFinanceiroStore((s) => s.lancamentos)
  const contasBancarias = useFinanceiroStore((s) => s.contasBancarias)
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<LancamentosTableFiltros>(EMPTY_LANCAMENTOS_TABLE_FILTROS)

  const totalSaldo = contasBancarias.reduce((s, c) => s + c.saldo, 0)
  const receitasMes = 48320
  const despesasMes = 31150
  const resultado = receitasMes - despesasMes
  const periodoLabel = getPeriodoLabel(periodo)

  const lancamentos = useMemo(
    () => getRecentesTableLancamentos(lancamentosBase, tableFiltros),
    [lancamentosBase, tableFiltros],
  )
  const activeTableFilters = countActiveLancamentosTableFiltros(tableFiltros)
  const lancamentosBaseCount = useMemo(
    () => getRecentesTableLancamentos(lancamentosBase, EMPTY_LANCAMENTOS_TABLE_FILTROS).length,
    [lancamentosBase],
  )

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

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_LANCAMENTOS_TABLE_FILTROS)
  }

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
            {contasBancarias.map((conta) => (
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
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Lançamentos recentes"
              subtitle={
                hasActiveLancamentosTableFiltros(tableFiltros)
                  ? `${lancamentos.length} de ${lancamentosBaseCount} lançamentos recentes`
                  : `${lancamentos.length} últimos lançamentos do mês`
              }
              actions={
                <LancamentosTableFiltersButton
                  open={filtrosOpen}
                  activeCount={activeTableFilters}
                  onToggle={() => setFiltrosOpen((current) => !current)}
                />
              }
            />

            {filtrosOpen ? (
              <LancamentosTableFiltersPanel
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
              hasActiveLancamentosTableFiltros(tableFiltros)
                ? `Mostrando ${lancamentos.length} de ${lancamentosBaseCount} lançamentos recentes`
                : `Mostrando ${lancamentos.length} lançamentos recentes`
            }
          />
        }
      >
        <DataTable
          columns={columns}
          data={lancamentos}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhum lançamento encontrado para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
