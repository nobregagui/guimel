import type { FluxoPonto } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FluxoCaixaChartProps {
  dados: FluxoPonto[]
}

export function FluxoCaixaChart({ dados }: FluxoCaixaChartProps) {
  const maxVal = Math.max(...dados.flatMap((d) => [d.entradas, d.saidas]))
  const chartH = 140
  const barW = 14
  const paddingL = 32
  const paddingB = 20
  const paddingT = 12
  const groupW = barW * 2 + 2
  const colW = groupW + 16
  const totalW = paddingL + dados.length * colW + 8
  const innerH = chartH - paddingB - paddingT

  const yAt = (v: number) => paddingT + innerH * (1 - v / maxVal)
  const hFor = (v: number) => innerH * (v / maxVal)
  const yLabels = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal]

  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH}`}
      className={styles.chartSvg}
      style={{ height: chartH }}
      role="img"
      aria-label="Gráfico de fluxo de caixa mensal"
    >
      {yLabels.map((v) => (
        <g key={v}>
          <line
            x1={paddingL}
            y1={yAt(v)}
            x2={totalW}
            y2={yAt(v)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray={v === 0 ? undefined : '3,3'}
          />
          <text x={paddingL - 4} y={yAt(v) + 4} textAnchor="end" fontSize={8} fill="#9ca3af" fontFamily="inherit">
            {v}k
          </text>
        </g>
      ))}

      {dados.map((d, i) => {
        const x = paddingL + i * colW
        const alpha = d.projecao ? 0.35 : 0.9
        const labelX = x + groupW / 2

        return (
          <g key={d.label}>
            <rect x={x} y={yAt(d.entradas)} width={barW} height={hFor(d.entradas)} rx={3} fill="#16a34a" opacity={alpha} />
            <rect x={x + barW + 2} y={yAt(d.saidas)} width={barW} height={hFor(d.saidas)} rx={3} fill="#e24b4a" opacity={alpha} />
            <text
              x={labelX}
              y={chartH - 4}
              textAnchor="middle"
              fontSize={8}
              fill={d.projecao ? '#d1d5db' : '#9ca3af'}
              fontFamily="inherit"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
