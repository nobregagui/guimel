import { useMemo } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  List,
  MoreHorizontal,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'

import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import { ContaSelector } from '@/features/financeiro/components/ContaSelector'
import { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/financeiro/components/DataTable'
import { ExtratoResumoCard } from '@/features/financeiro/components/ExtratoResumoCard'
import { FilterPills, FinanceiroKpiCard, KpiGrid } from '@/features/financeiro/components/FinanceiroKpiCard'
import { EXTRATO_FILTROS, EXTRATO_MOVIMENTOS } from '@/features/financeiro/data/extrato'
import { CONTAS_BANCARIAS } from '@/features/financeiro/data/shared'
import type { ExtratoContaFiltro, ExtratoFiltro, ExtratoMovimento, Periodo, TableColumn } from '@/features/financeiro/types'
import {
  buildExtratoResumo,
  filterExtrato,
  formatBRL,
  getPeriodoLabel,
  sumExtratoPorTipo,
} from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ExtratoTabProps {
  periodo: Periodo
  filtro: ExtratoFiltro
  contaId: ExtratoContaFiltro
  onFiltroChange: (filtro: ExtratoFiltro) => void
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

export function ExtratoTab({ periodo, filtro, contaId, onFiltroChange, onContaChange }: ExtratoTabProps) {
  const contaSelecionada = useMemo(
    () => CONTAS_BANCARIAS.find((c) => c.id === contaId),
    [contaId],
  )

  const movimentosBase = useMemo(
    () => filterExtrato(EXTRATO_MOVIMENTOS, 'todos', contaId, periodo),
    [contaId, periodo],
  )

  const movimentosFiltrados = useMemo(
    () => filterExtrato(EXTRATO_MOVIMENTOS, filtro, contaId, periodo),
    [filtro, contaId, periodo],
  )

  const resumo = useMemo(() => {
    const saldoAtual =
      contaId === 'todas'
        ? CONTAS_BANCARIAS.reduce((acc, c) => acc + c.saldo, 0)
        : (contaSelecionada?.saldo ?? 0)

    return buildExtratoResumo(movimentosBase, saldoAtual)
  }, [contaId, contaSelecionada, movimentosBase])

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
          const conta = CONTAS_BANCARIAS.find((c) => c.id === row.contaId)
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
  }, [contaId])

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
          <ContaSelector contas={CONTAS_BANCARIAS} value={contaId} onChange={onContaChange} />
        </div>
        <div className={styles.extratoFilterGroup}>
          <span className={styles.extratoFilterLabel}>Tipo</span>
          <FilterPills options={EXTRATO_FILTROS} value={filtro} onChange={onFiltroChange} />
        </div>
      </div>

      <div className={styles.twoCol}>
        <ExtratoResumoCard resumo={resumo} contaLabel={contaLabel} />

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Contas vinculadas</h3>
            <span className={styles.categoryHint}>{CONTAS_BANCARIAS.length} contas</span>
          </div>
          <div className={styles.contaList}>
            {CONTAS_BANCARIAS.map((conta) => (
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
          <TableToolbar
            title="Extrato bancário"
            subtitle={`${movimentosFiltrados.length} lançamentos — ${getPeriodoLabel(periodo)}`}
            actions={
              <button type="button" className={styles.btnSecondary}>
                <SlidersHorizontal size={12} /> Filtros avançados
              </button>
            }
          />
        }
        footer={
          <TableFooter
            info={`Mostrando ${movimentosFiltrados.length} de ${movimentosBase.length} movimentações`}
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
