import { useMemo } from 'react'
import { Activity, AlertCircle, CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react'

import { AreaChart } from '@/features/conciliacaoBancaria/components/charts/AreaChart'
import { BarChart } from '@/features/conciliacaoBancaria/components/charts/BarChart'
import { DonutChart } from '@/features/conciliacaoBancaria/components/charts/DonutChart'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import { formatBRL, formatBRLCompact } from '@/features/conciliacaoBancaria/utils'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
const CURRENT_YEAR = 2026

const CATEGORY_COLORS = [
  '#16a34a', '#2563eb', '#9333ea', '#f59e0b', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b',
]

export function AnalyticsTab() {
  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)
  const regras = useConciliacaoStore((s) => s.regras)

  // ── KPI Computations ──────────────────────────────────────────────────────
  const totalExtrato = extratoItems.length
  const conciliadosExtrato = extratoItems.filter((e) => e.status === 'conciliado').length
  const pendentesExtrato = extratoItems.filter((e) => e.status === 'pendente').length
  const ignoradosExtrato = extratoItems.filter((e) => e.status === 'ignorado').length

  const totalErp = erpLancamentos.length
  const conciliadosErp = erpLancamentos.filter((e) => e.status === 'conciliado').length

  const totalConciliacoes = conciliacoes.length
  const manuais = conciliacoes.filter((c) => c.tipo === 'manual').length
  const automaticas = conciliacoes.filter((c) => c.tipo === 'automatica').length
  const sugeridas = conciliacoes.filter((c) => c.tipo === 'sugerida').length

  const pctConciliadoExtrato = totalExtrato > 0 ? (conciliadosExtrato / totalExtrato) * 100 : 0
  const pctConciliadoErp = totalErp > 0 ? (conciliadosErp / totalErp) * 100 : 0
  const pctAutoVsManual = totalConciliacoes > 0 ? ((automaticas + sugeridas) / totalConciliacoes) * 100 : 0

  // ── Monthly bar chart data ─────────────────────────────────────────────────
  const monthlyBarData = useMemo(() => {
    return MONTHS.map((mes, idx) => {
      const mesNum = idx + 1
      const conciliadosMes = conciliacoes.filter((c) => {
        const d = new Date(c.criadoEmIso)
        return d.getFullYear() === CURRENT_YEAR && d.getMonth() + 1 === mesNum
      }).length

      const pendentesMes = extratoItems.filter((e) => {
        if (e.status !== 'pendente') return false
        const d = new Date(e.data.split('/').reverse().join('-'))
        return d.getFullYear() === CURRENT_YEAR && d.getMonth() + 1 === mesNum
      }).length

      return { label: mes, values: [conciliadosMes, pendentesMes] }
    })
  }, [conciliacoes, extratoItems])

  // ── Area chart: cash flow by month ─────────────────────────────────────────
  const cashFlowData = useMemo(() => {
    const creditosPorMes = MONTHS.map((mes, idx) => {
      const mesNum = idx + 1
      const total = extratoItems
        .filter((e) => {
          const d = new Date(e.data.split('/').reverse().join('-'))
          return e.tipo === 'credito' && d.getMonth() + 1 === mesNum && d.getFullYear() === CURRENT_YEAR
        })
        .reduce((acc, e) => acc + e.valor, 0)
      return { label: mes, value: Math.round(total) }
    })

    const debitosPorMes = MONTHS.map((mes, idx) => {
      const mesNum = idx + 1
      const total = extratoItems
        .filter((e) => {
          const d = new Date(e.data.split('/').reverse().join('-'))
          return e.tipo === 'debito' && d.getMonth() + 1 === mesNum && d.getFullYear() === CURRENT_YEAR
        })
        .reduce((acc, e) => acc + e.valor, 0)
      return { label: mes, value: Math.round(total) }
    })

    return [
      { name: 'Entradas', color: '#16a34a', data: creditosPorMes },
      { name: 'Saídas', color: '#ef4444', data: debitosPorMes },
    ]
  }, [extratoItems])

  // ── Donut: conciliation type ───────────────────────────────────────────────
  const conciliacaoTipoSegments = [
    { label: 'Manual', value: manuais, color: '#16a34a' },
    { label: 'Por Sugestão IA', value: sugeridas, color: '#2563eb' },
    { label: 'Automática (Regra)', value: automaticas, color: '#9333ea' },
  ]

  // ── Donut: ERP categories ──────────────────────────────────────────────────
  const categoriaMap = useMemo(() => {
    const map: Record<string, number> = {}
    erpLancamentos.forEach((e) => {
      if (!e.categoria) return
      map[e.categoria] = (map[e.categoria] ?? 0) + e.valor
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [erpLancamentos])

  const categoriaSegments = categoriaMap.map(([label, value], i) => ({
    label,
    value: Math.round(value),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  // ── Origin distribution ────────────────────────────────────────────────────
  const origemMap = useMemo(() => {
    const map: Record<string, number> = {}
    extratoItems.forEach((e) => {
      map[e.origem] = (map[e.origem] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [extratoItems])

  const origemSegments = origemMap.map(([label, value], i) => ({
    label: label.toUpperCase(),
    value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  const regraAtivas = regras.filter((r) => r.ativo).length
  const totalEntradas = extratoItems.filter((e) => e.tipo === 'credito').reduce((a, e) => a + e.valor, 0)
  const totalSaidas = extratoItems.filter((e) => e.tipo === 'debito').reduce((a, e) => a + e.valor, 0)

  return (
    <div className={styles.analyticsRoot}>
      {/* ── KPI Row ── */}
      <div className={styles.kpiGrid}>
        <KpiMini
          icon={<CheckCircle2 size={15} />}
          label="Extrato conciliado"
          value={`${pctConciliadoExtrato.toFixed(1)}%`}
          sub={`${conciliadosExtrato} de ${totalExtrato} movimentos`}
          colorClass={styles.kpiCardIconGreen}
          progress={pctConciliadoExtrato}
        />
        <KpiMini
          icon={<CheckCircle2 size={15} />}
          label="ERP conciliado"
          value={`${pctConciliadoErp.toFixed(1)}%`}
          sub={`${conciliadosErp} de ${totalErp} lançamentos`}
          colorClass={styles.kpiCardIconBlue}
          progress={pctConciliadoErp}
        />
        <KpiMini
          icon={<Zap size={15} />}
          label="Automação"
          value={`${pctAutoVsManual.toFixed(1)}%`}
          sub={`${automaticas + sugeridas} automáticas · ${manuais} manuais`}
          colorClass={styles.kpiCardIconPurple}
          progress={pctAutoVsManual}
        />
        <KpiMini
          icon={<AlertCircle size={15} />}
          label="Pendências"
          value={pendentesExtrato.toString()}
          sub={`${ignoradosExtrato} ignorados · ${conciliadosExtrato} conciliados`}
          colorClass={pctConciliadoExtrato >= 80 ? styles.kpiCardIconGreen : styles.kpiCardIconRed}
        />
        <KpiMini
          icon={<TrendingUp size={15} />}
          label="Total entradas"
          value={formatBRLCompact(totalEntradas)}
          sub="Créditos no período"
          colorClass={styles.kpiCardIconGreen}
        />
        <KpiMini
          icon={<Activity size={15} />}
          label="Total saídas"
          value={formatBRLCompact(totalSaidas)}
          sub="Débitos no período"
          colorClass={styles.kpiCardIconRed}
        />
        <KpiMini
          icon={<Clock size={15} />}
          label="Regras ativas"
          value={`${regraAtivas}`}
          sub={`de ${regras.length} regras cadastradas`}
          colorClass={styles.kpiCardIconPurple}
        />
        <KpiMini
          icon={<CheckCircle2 size={15} />}
          label="Conciliações"
          value={totalConciliacoes.toString()}
          sub="Total registradas na sessão"
          colorClass={styles.kpiCardIconGreen}
        />
      </div>

      {/* ── Charts Grid ── */}
      <div className={styles.analyticsGrid}>
        {/* Bar chart */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Conciliações por mês</p>
            <p className={styles.analyticsCardSub}>{CURRENT_YEAR}</p>
          </div>
          <div className={styles.analyticsCardBody}>
            <BarChart
              data={monthlyBarData}
              seriesNames={['Conciliadas', 'Pendentes']}
              seriesColors={['#16a34a', '#f59e0b']}
              formatValue={(v) => v.toString()}
              height={210}
            />
          </div>
        </div>

        {/* Conciliation type donut */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Tipo de conciliação</p>
            <p className={styles.analyticsCardSub}>{totalConciliacoes} registros</p>
          </div>
          <div className={styles.analyticsCardBody}>
            {totalConciliacoes > 0 ? (
              <DonutChart
                segments={conciliacaoTipoSegments}
                centerLabel="total"
                centerValue={totalConciliacoes.toString()}
                size={140}
                thickness={30}
              />
            ) : (
              <EmptyChart message="Nenhuma conciliação realizada ainda." />
            )}
          </div>
        </div>

        {/* Area chart: cash flow */}
        <div className={`${styles.analyticsCard} ${styles.analyticsCardWide}`}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Fluxo de caixa mensal</p>
            <p className={styles.analyticsCardSub}>Entradas vs. saídas</p>
          </div>
          <div className={styles.analyticsCardBody}>
            <AreaChart
              series={cashFlowData}
              formatValue={formatBRLCompact}
              height={200}
            />
          </div>
        </div>

        {/* Categories donut */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Top categorias ERP</p>
            <p className={styles.analyticsCardSub}>Por valor total</p>
          </div>
          <div className={styles.analyticsCardBody}>
            <DonutChart
              segments={categoriaSegments}
              centerLabel="categorias"
              centerValue={categoriaSegments.length.toString()}
              size={130}
              thickness={26}
              formatValue={formatBRLCompact}
            />
          </div>
        </div>

        {/* Origem donut */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Origem dos movimentos</p>
            <p className={styles.analyticsCardSub}>Por quantidade</p>
          </div>
          <div className={styles.analyticsCardBody}>
            <DonutChart
              segments={origemSegments}
              centerLabel="tipos"
              centerValue={origemSegments.length.toString()}
              size={130}
              thickness={26}
              formatValue={(v) => `${v}`}
            />
          </div>
        </div>

        {/* Top ERP values horizontal bars */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <p className={styles.analyticsCardTitle}>Maiores lançamentos ERP</p>
            <p className={styles.analyticsCardSub}>Top 6 por valor</p>
          </div>
          <div className={styles.analyticsCardBody}>
            <HorizontalBars
              items={erpLancamentos
                .slice()
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 6)
                .map((e) => ({
                  label: e.descricao.substring(0, 28) + (e.descricao.length > 28 ? '…' : ''),
                  value: e.valor,
                  color: e.tipo === 'receber' ? '#16a34a' : '#ef4444',
                }))}
              formatValue={formatBRL}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Internal components ────────────────────────────────────────────────────────

function KpiMini({
  icon,
  label,
  value,
  sub,
  colorClass,
  progress,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  colorClass: string
  progress?: number
}) {
  return (
    <div className={styles.kpiCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span className={styles.kpiCardLabel}>{label}</span>
        <div className={`${styles.kpiCardIcon} ${colorClass}`}>{icon}</div>
      </div>
      <p className={styles.kpiCardValue}>{value}</p>
      <p className={styles.kpiCardSub}>{sub}</p>
      {progress !== undefined ? (
        <div className={styles.progressBar} style={{ marginTop: 8 }}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: progress >= 80 ? '#16a34a' : progress >= 50 ? '#f59e0b' : '#ef4444' }}
          />
        </div>
      ) : null}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, color: '#9ca3af', gap: 8 }}>
      <Activity size={28} strokeWidth={1.5} />
      <p style={{ fontSize: '12px', textAlign: 'center', margin: 0 }}>{message}</p>
    </div>
  )
}

function HorizontalBars({
  items,
  formatValue,
}: {
  items: Array<{ label: string; value: number; color: string }>
  formatValue: (v: number) => string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>{formatValue(item.value)}</span>
          </div>
          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(item.value / max) * 100}%`,
                background: item.color,
                borderRadius: 3,
                opacity: 0.85,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
