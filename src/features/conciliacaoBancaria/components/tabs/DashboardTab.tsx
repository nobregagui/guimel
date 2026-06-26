import { useMemo } from 'react'
import {
  Activity,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Link2,
  TrendingUp,
} from 'lucide-react'

import { ConciliacaoKpiCard, KpiGrid } from '@/features/conciliacaoBancaria/components/ConciliacaoKpiCard'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ConciliacaoKpiItem } from '@/features/conciliacaoBancaria/types'
import { formatBRL, formatBRLCompact, calcularPercentualConciliado } from '@/features/conciliacaoBancaria/utils'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export function DashboardTab() {
  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)
  const contas = useConciliacaoStore((s) => s.contas)
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)

  const stats = useMemo(() => {
    const totalExtrato = extratoItems.length
    const conciliadosExtrato = extratoItems.filter((i) => i.status === 'conciliado').length
    const pendentesExtrato = extratoItems.filter((i) => i.status === 'pendente' || i.status === 'sugerido').length
    const ignoradosExtrato = extratoItems.filter((i) => i.status === 'ignorado').length

    const totalErp = erpLancamentos.length
    const conciliadosErp = erpLancamentos.filter((e) => e.status === 'conciliado').length
    const pendentesErp = erpLancamentos.filter((e) => e.status === 'pendente').length

    const saldoBancoTotal = contas.reduce((acc, c) => acc + c.saldo, 0)
    const saldoErpTotal = contas.reduce((acc, c) => acc + c.saldoErp, 0)
    const diferenca = saldoBancoTotal - saldoErpTotal

    const totalConciliacoes = conciliacoes.length + conciliadosExtrato
    const percentual = calcularPercentualConciliado(totalExtrato, conciliadosExtrato)

    const creditosPendentes = extratoItems
      .filter((i) => i.status === 'pendente' && i.tipo === 'credito')
      .reduce((acc, i) => acc + i.valor, 0)

    const debitosPendentes = extratoItems
      .filter((i) => i.status === 'pendente' && i.tipo === 'debito')
      .reduce((acc, i) => acc + i.valor, 0)

    return {
      totalExtrato,
      conciliadosExtrato,
      pendentesExtrato,
      ignoradosExtrato,
      totalErp,
      conciliadosErp,
      pendentesErp,
      saldoBancoTotal,
      saldoErpTotal,
      diferenca,
      totalConciliacoes,
      percentual,
      creditosPendentes,
      debitosPendentes,
    }
  }, [extratoItems, erpLancamentos, contas, conciliacoes])

  const kpiItems: ConciliacaoKpiItem[] = [
    {
      id: 'percentual',
      label: 'Percentual conciliado',
      value: `${stats.percentual}%`,
      subValue: `${stats.conciliadosExtrato} de ${stats.totalExtrato} movimentos`,
      trend: stats.percentual >= 80 ? '↑ Meta de 80% atingida' : `↑ ${80 - stats.percentual}% para a meta`,
      trendPositive: stats.percentual >= 80,
      progress: stats.percentual,
      progressColor: '#16a34a',
    },
    {
      id: 'pendentes',
      label: 'Movimentos pendentes',
      value: String(stats.pendentesExtrato),
      subValue: `Extrato bancário`,
      trend: `${stats.pendentesErp} lançamentos ERP também pendentes`,
      trendPositive: false,
      progress: (stats.pendentesExtrato / Math.max(stats.totalExtrato, 1)) * 100,
      progressColor: '#f97316',
    },
    {
      id: 'diferenca',
      label: 'Diferença banco × ERP',
      value: formatBRLCompact(Math.abs(stats.diferenca)),
      subValue: stats.diferenca === 0 ? 'Contas zeradas ✓' : stats.diferenca > 0 ? 'Banco maior que ERP' : 'ERP maior que banco',
      trend: stats.diferenca === 0 ? 'Saldos conciliados' : `R$ ${formatBRL(stats.diferenca)} de diferença`,
      trendPositive: stats.diferenca === 0,
    },
    {
      id: 'conciliacoes',
      label: 'Conciliações realizadas',
      value: String(stats.totalConciliacoes),
      subValue: 'Total histórico',
      trend: `${conciliacoes.length} nesta sessão`,
      trendPositive: true,
      progress: Math.min(100, (stats.totalConciliacoes / 500) * 100),
      progressColor: '#3b82f6',
    },
  ]

  return (
    <>
      {/* KPIs */}
      <section aria-label="Indicadores de conciliação">
      <KpiGrid>
        <ConciliacaoKpiCard item={kpiItems[0]} icon={<TrendingUp size={16} />} iconClass={styles.kpiCardIconGreen} />
        <ConciliacaoKpiCard item={kpiItems[1]} icon={<Clock size={16} />} iconClass={styles.kpiCardIconOrange} />
        <ConciliacaoKpiCard item={kpiItems[2]} icon={<Activity size={16} />} iconClass={styles.kpiCardIconBlue} />
        <ConciliacaoKpiCard item={kpiItems[3]} icon={<Link2 size={16} />} iconClass={styles.kpiCardIconPurple} />
      </KpiGrid>
      </section>

      {/* Saldo summary */}
      <section aria-label="Resumo de saldos">
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Saldo total bancário</p>
          <p className={styles.summaryCardValue}>{formatBRL(stats.saldoBancoTotal)}</p>
          <p className={`${styles.summaryCardDiff} ${styles.summaryCardDiffPositive}`}>
            {contas.length} contas ativas
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Saldo total ERP</p>
          <p className={styles.summaryCardValue}>{formatBRL(stats.saldoErpTotal)}</p>
          <p className={`${styles.summaryCardDiff} ${stats.diferenca === 0 ? styles.summaryCardDiffPositive : styles.summaryCardDiffNegative}`}>
            {stats.diferenca === 0 ? 'Conciliado' : `Dif: ${formatBRL(stats.diferenca)}`}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Créditos pendentes</p>
          <p className={styles.summaryCardValue}>{formatBRL(stats.creditosPendentes)}</p>
          <p className={`${styles.summaryCardDiff} ${styles.summaryCardDiffPositive}`}>
            <ArrowDownRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Entradas a conciliar
          </p>
        </div>
      </div>
      </section>

      {/* Accounts */}
      <section aria-label="Contas bancárias">
      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableToolbarLeft}>
            <p className={styles.tableToolbarTitle}>Contas bancárias</p>
            <p className={styles.tableToolbarSub}>Situação atual de cada conta</p>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Banco</th>
              <th className={styles.thRight}>Saldo banco</th>
              <th className={styles.thRight}>Saldo ERP</th>
              <th className={styles.thRight}>Diferença</th>
              <th className={styles.thCenter}>Status</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => {
              const diff = conta.saldo - conta.saldoErp
              return (
                <tr key={conta.id}>
                  <td>
                    <p className={styles.cellDescricao}>{conta.nome}</p>
                    <p className={styles.cellSubDesc}>Ag. {conta.agencia} · C/C {conta.conta}</p>
                  </td>
                  <td>
                    <span className={styles.cellData}>{conta.banco.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`${styles.cellValorPos} ${styles.cellValorRight}`}>
                      {formatBRL(conta.saldo)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.cellValorPos} ${styles.cellValorRight}`}>
                      {formatBRL(conta.saldoErp)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${diff === 0 ? styles.cellValorPos : styles.cellValorNeg} ${styles.cellValorRight}`}
                    >
                      {diff === 0 ? '—' : formatBRL(diff)}
                    </span>
                  </td>
                  <td className={styles.cellCenter}>
                    {diff === 0 ? (
                      <span className={`${styles.badge} ${styles.badgeConciliado}`}>
                        <CheckCircle2 size={10} /> OK
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgePendente}`}>
                        <Clock size={10} /> Divergência
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className={styles.twoCol}>
        <div className={styles.tableSection}>
          <div className={styles.tableToolbar}>
            <div className={styles.tableToolbarLeft}>
              <p className={styles.tableToolbarTitle}>Extrato bancário</p>
              <p className={styles.tableToolbarSub}>{stats.totalExtrato} movimentos importados</p>
            </div>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Conciliados', count: stats.conciliadosExtrato, color: '#16a34a', pct: (stats.conciliadosExtrato / Math.max(stats.totalExtrato, 1)) * 100 },
              { label: 'Pendentes', count: stats.pendentesExtrato, color: '#f97316', pct: (stats.pendentesExtrato / Math.max(stats.totalExtrato, 1)) * 100 },
              { label: 'Ignorados', count: stats.ignoradosExtrato, color: '#9ca3af', pct: (stats.ignoradosExtrato / Math.max(stats.totalExtrato, 1)) * 100 },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{row.count}</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressBarFill} style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableToolbar}>
            <div className={styles.tableToolbarLeft}>
              <p className={styles.tableToolbarTitle}>Lançamentos ERP</p>
              <p className={styles.tableToolbarSub}>{stats.totalErp} lançamentos registrados</p>
            </div>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Conciliados', count: stats.conciliadosErp, color: '#16a34a', pct: (stats.conciliadosErp / Math.max(stats.totalErp, 1)) * 100 },
              { label: 'Pendentes', count: stats.pendentesErp, color: '#f97316', pct: (stats.pendentesErp / Math.max(stats.totalErp, 1)) * 100 },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{row.count}</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressBarFill} style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
