interface BarSeries {
  label: string
  values: number[]
}

interface BarChartProps {
  data: BarSeries[]
  seriesNames: string[]
  seriesColors: string[]
  formatValue?: (v: number) => string
  height?: number
  showLegend?: boolean
  unit?: string
}

const PAD_LEFT = 56
const PAD_RIGHT = 8
const PAD_TOP = 16
const PAD_BOTTOM = 36
const WIDTH = 560
const LABEL_FONT = 11

export function BarChart({
  data,
  seriesNames,
  seriesColors,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  height = 220,
  showLegend = true,
}: BarChartProps) {
  const chartW = WIDTH - PAD_LEFT - PAD_RIGHT
  const chartH = height - PAD_TOP - PAD_BOTTOM

  const maxVal = Math.max(...data.flatMap((d) => d.values), 1)
  const yTicks = computeYTicks(maxVal, 5)
  const maxTick = yTicks[yTicks.length - 1]

  const groupCount = data.length
  const seriesCount = seriesNames.length
  const groupWidth = chartW / groupCount
  const gap = 4
  const barW = Math.max(6, (groupWidth - gap * (seriesCount + 1)) / seriesCount)

  return (
    <div style={{ width: '100%' }}>
      {showLegend ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {seriesNames.map((name, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: seriesColors[i] }} />
              {name}
            </div>
          ))}
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        aria-label="Gráfico de barras"
        role="img"
      >
        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick) => {
          const y = PAD_TOP + chartH - (tick / maxTick) * chartH
          return (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={PAD_LEFT + chartW}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={LABEL_FONT}
                fill="#9ca3af"
              >
                {formatValue(tick)}
              </text>
            </g>
          )
        })}

        {/* X-axis baseline */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + chartH}
          x2={PAD_LEFT + chartW}
          y2={PAD_TOP + chartH}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Bars + X labels */}
        {data.map((group, gi) => {
          const groupX = PAD_LEFT + gi * groupWidth
          const centerX = groupX + groupWidth / 2

          return (
            <g key={group.label}>
              {group.values.map((val, si) => {
                const barH = Math.max(2, (val / maxTick) * chartH)
                const barX = groupX + gap + si * (barW + gap) + (groupWidth - seriesCount * barW - (seriesCount + 1) * gap) / 2
                const barY = PAD_TOP + chartH - barH

                return (
                  <g key={si}>
                    <title>{`${seriesNames[si]}: ${formatValue(val)}`}</title>
                    <rect
                      x={barX}
                      y={barY}
                      width={barW}
                      height={barH}
                      fill={seriesColors[si]}
                      rx={3}
                      style={{ transition: 'height 0.4s ease, y 0.4s ease' }}
                      opacity={0.9}
                    />
                    {barH > 20 && barW > 20 ? (
                      <text
                        x={barX + barW / 2}
                        y={barY - 3}
                        textAnchor="middle"
                        fontSize={9}
                        fill={seriesColors[si]}
                        fontWeight="600"
                      >
                        {val > 0 ? formatValue(val) : ''}
                      </text>
                    ) : null}
                  </g>
                )
              })}

              {/* X axis label */}
              <text
                x={centerX}
                y={PAD_TOP + chartH + 18}
                textAnchor="middle"
                fontSize={LABEL_FONT}
                fill="#6b7280"
              >
                {group.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function computeYTicks(maxVal: number, count: number): number[] {
  if (maxVal === 0) return [0, 1, 2, 3, 4, 5]
  const raw = maxVal / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const nice = Math.ceil(raw / magnitude) * magnitude
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * nice))
}
