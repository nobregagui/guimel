interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  formatValue?: (v: number) => string
  centerLabel?: string
  centerValue?: string
  showLegend?: boolean
  maxLegendItems?: number
}

export function DonutChart({
  segments,
  size = 140,
  thickness = 28,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  centerLabel,
  centerValue,
  showLegend = true,
  maxLegendItems = 6,
}: DonutChartProps) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const validSegments = segments.filter((s) => s.value > 0)
  const legendItems = validSegments.slice(0, maxLegendItems)
  const others = validSegments.slice(maxLegendItems)
  const othersTotal = others.reduce((acc, s) => acc + s.value, 0)

  const displaySegments =
    others.length > 0
      ? [...legendItems, { label: 'Outros', value: othersTotal, color: '#e5e7eb' }]
      : legendItems

  // Pre-compute cumulative percents to avoid mutation during render
  const segmentData = validSegments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0
    const cumulative = validSegments.slice(0, i).reduce((acc, s) => acc + (total > 0 ? s.value / total : 0), 0)
    return { seg, pct, cumulative }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Gráfico de rosca"
          role="img"
        >
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={thickness}
          />

          {/* Segments */}
          {segmentData.map(({ seg, pct, cumulative }, i) => {
            const offset = circumference * (1 - cumulative)
            const dash = circumference * pct

            return (
              <g key={i}>
                <title>{`${seg.label}: ${formatValue(seg.value)} (${(pct * 100).toFixed(1)}%)`}</title>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </g>
            )
          })}

          {/* Center text */}
          {centerValue ? (
            <g>
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize={14} fontWeight="700" fill="#111827">
                {centerValue}
              </text>
              {centerLabel ? (
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">
                  {centerLabel}
                </text>
              ) : null}
            </g>
          ) : null}
        </svg>
      </div>

      {/* Legend */}
      {showLegend ? (
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {displaySegments.map((seg) => {
            const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0'
            return (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: '#374151', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {seg.label}
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0 }}>{pct}%</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', flexShrink: 0, minWidth: 50, textAlign: 'right' }}>
                  {formatValue(seg.value)}
                </span>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
