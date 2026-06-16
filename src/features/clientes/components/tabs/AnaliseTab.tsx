import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, PieChart, TrendingUp, User } from 'lucide-react'

import { CidadeBreakdown } from '@/features/clientes/components/CidadeBreakdown'
import { ClientesKpiCard, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
import { SegmentoBreakdown } from '@/features/clientes/components/SegmentoBreakdown'
import { TopClientesCard } from '@/features/clientes/components/TopClientesCard'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import {
  countByTipo,
  filterClientes,
  formatBRL,
  getTopClientes,
  groupByCidade,
  groupBySegmento,
  sumTotalVendas,
} from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface AnaliseTabProps {
  busca: string
}

export function AnaliseTab({ busca }: AnaliseTabProps) {
  const navigate = useNavigate()
  const clientesStore = useClientesStore((state) => state.clientes)
  const clientes = useMemo(() => filterClientes(clientesStore, 'todos', busca), [clientesStore, busca])
  const segmentos = useMemo(() => groupBySegmento(clientes), [clientes])
  const cidades = useMemo(() => groupByCidade(clientes), [clientes])
  const topClientes = useMemo(() => getTopClientes(clientes, 5), [clientes])

  const totalPf = countByTipo(clientes, 'pf')
  const totalPj = countByTipo(clientes, 'pj')
  const totalClientes = clientes.length || 1

  return (
    <>
      <KpiGrid>
        <ClientesKpiCard
          label="Pessoa jurídica"
          value={String(totalPj)}
          trend={`${Math.round((totalPj / totalClientes) * 100)}% da base`}
          trendPositive
          progress={Math.round((totalPj / totalClientes) * 100)}
          progressColor="#16a34a"
          icon={<Building2 size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Pessoa física"
          value={String(totalPf)}
          trend={`${Math.round((totalPf / totalClientes) * 100)}% da base`}
          progress={Math.round((totalPf / totalClientes) * 100)}
          progressColor="#f97316"
          icon={<User size={13} />}
          colorClass={styles.colorOrange}
        />
        <ClientesKpiCard
          label="Regiões atendidas"
          value={String(cidades.length)}
          trend="Cidades distintas"
          trendPositive
          progress={55}
          progressColor="#16a34a"
          icon={<MapPin size={13} />}
          colorClass={styles.colorGreen}
        />
        <ClientesKpiCard
          label="Receita total"
          value={formatBRL(sumTotalVendas(clientes))}
          trend={`${segmentos.length} segmentos`}
          trendPositive
          progress={68}
          progressColor="#16a34a"
          icon={<TrendingUp size={13} />}
          colorClass={styles.colorGreen}
        />
      </KpiGrid>

      <div className={styles.twoCol}>
        <SegmentoBreakdown
          items={segmentos}
          title="Distribuição por segmento"
          hint="Participação na receita"
        />
        <CidadeBreakdown items={cidades} />
      </div>

      <div className={styles.twoColBalanced}>
        <TopClientesCard
          clientes={topClientes}
          title="Maiores compradores"
          hint="Ranking por faturamento"
          onClienteClick={(cliente) => navigate(`/clientes/${cliente.id}`)}
        />

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resumo da base</h3>
            <span className={styles.categoryHint}>
              <PieChart size={12} /> Análise consolidada
            </span>
          </div>

          <div className={styles.analiseResumoList}>
            <div className={styles.analiseResumoItem}>
              <span>Segmento líder</span>
              <strong>{segmentos[0]?.segmento ?? '—'}</strong>
            </div>
            <div className={styles.analiseResumoItem}>
              <span>Principal região</span>
              <strong>
                {cidades[0] ? `${cidades[0].cidade}/${cidades[0].estado}` : '—'}
              </strong>
            </div>
            <div className={styles.analiseResumoItem}>
              <span>Maior cliente</span>
              <strong>{topClientes[0]?.nome ?? '—'}</strong>
            </div>
            <div className={styles.analiseResumoItem}>
              <span>Receita do top 5</span>
              <strong>{formatBRL(topClientes.reduce((acc, c) => acc + c.totalVendas, 0))}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
