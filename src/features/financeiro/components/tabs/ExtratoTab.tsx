import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  List,
  MoreHorizontal,
  Wallet,
} from 'lucide-react'

import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import {
  ExtratoTableFiltersButton,
  ExtratoTableFiltersPanel,
} from '@/features/financeiro/components/ExtratoTableFilters'
import { ExtratoResumoCard } from '@/features/financeiro/components/ExtratoResumoCard'
import { FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { EXTRATO_CATEGORIAS } from '@/features/financeiro/data/extrato'
import { EMPTY_EXTRATO_TABLE_FILTROS } from '@/features/financeiro/data/shared'
import { useFinanceiroStore } from '@/features/financeiro/store/useFinanceiroStore'
import type { ExtratoContaFiltro, ExtratoMovimento, ExtratoTableFiltros, Periodo, TableColumn } from '@/features/financeiro/types'
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
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ExtratoTabProps {
  periodo: Periodo
  contaId: ExtratoContaFiltro
  onContaChange: (contaId: ExtratoContaFiltro) => void
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

export function ExtratoTab({ periodo, contaId, onContaChange }: ExtratoTabProps) {
  const movimentos = useFinanceiroStore((s) => s.extratoMovimentos)
  const contasBancarias = useFinanceiroStore((s) => s.contasBancarias)
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ExtratoTableFiltros>(EMPTY_EXTRATO_TABLE_FILTROS)
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
            <p className={styles.cellDescricao}>{row.descricao}</p>
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
      render: () => (
        <button type="button" className={styles.rowAction} aria-label="Ações">
          <MoreHorizontal size={16} />
        </button>
      ),
    })

    return base
  }, [contaId, contasBancarias])

  function handleClearTableFiltros() {
    setTableFiltros(EMPTY_EXTRATO_TABLE_FILTROS)
  }

  return (
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
          <div className={styles.tableToolbarStack}>
            <TableToolbar
              title="Extrato bancário"
              subtitle={
                hasActiveExtratoTableFiltros(tableFiltros, showContaFilter)
                  ? `${movimentosFiltrados.length} de ${movimentosBase.length} lançamentos — ${getPeriodoLabel(periodo)}`
                  : `${movimentosFiltrados.length} lançamentos — ${getPeriodoLabel(periodo)}`
              }
              actions={
                <ExtratoTableFiltersButton
                  open={filtrosOpen}
                  activeCount={activeTableFilters}
                  onToggle={() => setFiltrosOpen((current) => !current)}
                />
              }
            />

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
          </div>
        }
        footer={
          <TableFooter
            info={
              hasActiveExtratoTableFiltros(tableFiltros, showContaFilter)
                ? `Mostrando ${movimentosFiltrados.length} de ${movimentosBase.length} movimentações`
                : `Mostrando ${movimentosFiltrados.length} movimentações`
            }
            actionLabel="Exportar extrato"
          />
        }
      >
        <DataTable
          columns={columns}
          data={movimentosFiltrados}
          getRowKey={(row) => row.id}
          emptyMessage="Nenhuma movimentação encontrada para os filtros selecionados."
        />
      </TableSection>
    </>
  )
}
