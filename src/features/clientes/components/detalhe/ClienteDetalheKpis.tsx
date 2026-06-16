import { CheckCircle2, Clock, ShoppingCart, Wallet } from 'lucide-react'

import { ClientesKpiCard, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
import type { Cliente } from '@/features/clientes/types'
import { formatBRL, getTicketMedioCliente } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

interface ClienteDetalheKpisProps {
  cliente: Cliente
}

export function ClienteDetalheKpis({ cliente }: ClienteDetalheKpisProps) {
  const ticketMedio = getTicketMedioCliente(cliente)

  return (
    <KpiGrid>
      <ClientesKpiCard
        label="Total em vendas"
        value={formatBRL(cliente.totalVendas)}
        trend={`${cliente.quantidadePedidos} pedidos`}
        trendPositive={cliente.totalVendas > 0}
        progress={cliente.totalVendas > 0 ? 72 : 8}
        progressColor="#16a34a"
        icon={<Wallet size={13} />}
        colorClass={styles.colorGreen}
      />
      <ClientesKpiCard
        label="Ticket médio"
        value={formatBRL(ticketMedio)}
        trend="Por pedido concluído"
        trendPositive={ticketMedio > 0}
        progress={ticketMedio > 0 ? 55 : 8}
        progressColor="#f97316"
        icon={<ShoppingCart size={13} />}
        colorClass={styles.colorOrange}
      />
      <ClientesKpiCard
        label="Última compra"
        value={cliente.ultimaCompra ?? '—'}
        trend={cliente.ultimaCompra ? 'Data da última venda' : 'Sem compras registradas'}
        trendPositive={Boolean(cliente.ultimaCompra)}
        progress={cliente.ultimaCompra ? 48 : 12}
        progressColor="#16a34a"
        icon={<Clock size={13} />}
        colorClass={styles.colorGreen}
      />
      <ClientesKpiCard
        label="Status comercial"
        value={cliente.status === 'ativo' ? 'Ativo' : cliente.status === 'pendente' ? 'Pendente' : 'Inativo'}
        trend={cliente.status === 'ativo' ? 'Relacionamento saudável' : 'Requer atenção'}
        trendPositive={cliente.status === 'ativo'}
        progress={cliente.status === 'ativo' ? 80 : 25}
        progressColor={cliente.status === 'ativo' ? '#16a34a' : '#f97316'}
        icon={<CheckCircle2 size={13} />}
        colorClass={cliente.status === 'ativo' ? styles.colorGreen : styles.colorOrange}
      />
    </KpiGrid>
  )
}
