interface AreaSeries {
  label: string
  value: number
}

interface AreaChartProps {
  series: Array<{
    name: string
    color: string
    data: AreaSeries[]
  }>
  formatValue?: (v: number) => string
  height?: number
  showLegend?: boolean
}

const PAD_LEFT = 60
const PAD_RIGHT = 8
const PAD_TOP = 16
const PAD_BOTTOM = 32
const WIDTH = 560

export function AreaChart({
  series,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  height = 200,
  showLegend = true,
}: AreaChartProps) {
  const chartW = WIDTH - PAD_LEFT - PAD_RIGHT
  const chartH = height - PAD_TOP - PAD_BOTTOM

  const allValues = series.flatMap((s) => s.data.map((d) => d.value))
  const maxVal = Math.max(...allValues, 1)
  const labels = series[0]?.data.map((d) => d.label) ?? []
  const n = labels.length

  const yTicks = computeYTicks(maxVal, 4)
  const maxTick = yTicks[yTicks.length - 1]

  function toX(i: number) {
    return PAD_LEFT + (i / Math.max(n - 1, 1)) * chartW
  }
  function toY(v: number) {
    return PAD_TOP + chartH - (v / maxTick) * chartH
  }

  function buildPath(data: AreaSeries[]) {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join(' ')
  }

  function buildArea(data: AreaSeries[]) {
    const baseline = PAD_TOP + chartH
    const line = buildPath(data)
    const right = `L${toX(data.length - 1).toFixed(1)},${baseline}`
    const left = `L${toX(0).toFixed(1)},${baseline} Z`
    return `${line} ${right} ${left}`
  }

  return (
    <div style={{ width: '100%' }}>
      {showLegend ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {series.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        aria-label="Gráfico de área"
        role="img"
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.name} id={`grad-${s.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((tick) => {
          const y = toY(tick)
          return (
            <g key={tick}>
              <line x1={PAD_LEFT} y1={y} x2={PAD_LEFT + chartW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={PAD_LEFT - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                {formatValue(tick)}
              </text>
            </g>
          )
        })}

        {/* Baseline */}
        <line x1={PAD_LEFT} y1={PAD_TOP + chartH} x2={PAD_LEFT + chartW} y2={PAD_TOP + chartH} stroke="#e5e7eb" strokeWidth={1} />

        {/* Area + Line per series */}
        {series.map((s) => (
          <g key={s.name}>
            <path d={buildArea(s.data)} fill={`url(#grad-${s.name.replace(/\s/g, '')})`} />
            <path d={buildPath(s.data)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {/* Data point dots */}
            {s.data.map((d, i) => (
              <g key={i}>
                <title>{`${s.name} — ${d.label}: ${formatValue(d.value)}`}</title>
                <circle cx={toX(i)} cy={toY(d.value)} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2} />
              </g>
            ))}
          </g>
        ))}

        {/* X labels */}
        {labels.map((label, i) => (
          <text key={label} x={toX(i)} y={PAD_TOP + chartH + 18} textAnchor="middle" fontSize={10} fill="#6b7280">
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function computeYTicks(maxVal: number, count: number): number[] {
  if (maxVal === 0) return [0, 1, 2, 3]
  const raw = maxVal / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const nice = Math.ceil(raw / magnitude) * magnitude
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * nice))
}
