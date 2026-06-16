import { Card } from '@/components/ui'

interface KpiCardProps {
  label: string
  value: string
}

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <Card>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</p>
      <strong style={{ fontSize: '1.3rem' }}>{value}</strong>
    </Card>
  )
}
