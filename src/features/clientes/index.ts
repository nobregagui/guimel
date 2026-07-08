export { CidadeBreakdown } from '@/features/clientes/components/CidadeBreakdown'
export { ClienteDrawer } from '@/features/clientes/components/ClienteDrawer'
export { ClientesQueryFeedback } from '@/features/clientes/components/ClientesQueryFeedback'
export { ClienteDetalheDados } from '@/features/clientes/components/detalhe/ClienteDetalheDados'
export { ClienteDetalheHeader } from '@/features/clientes/components/detalhe/ClienteDetalheHeader'
export { ClienteDetalheKpis } from '@/features/clientes/components/detalhe/ClienteDetalheKpis'
export { ClienteDetalhePedidos } from '@/features/clientes/components/detalhe/ClienteDetalhePedidos'
export { ClienteDetalheResumo } from '@/features/clientes/components/detalhe/ClienteDetalheResumo'
export { useClientesStore } from '@/features/clientes/store/useClientesStore'
export {
  clientesQueryKeys,
  useClientesQuery,
  useClienteQuery,
  useClientePedidosQuery,
  useCreateClienteMutation,
  useUpdateClienteMutation,
  useRemoveClienteMutation,
} from '@/features/clientes/hooks/useClientes'
export { ClienteAvatar } from '@/features/clientes/components/ClienteAvatar'
export { ClienteNomeCell } from '@/features/clientes/components/ClienteNomeCell'
export { ClienteStatusBadge } from '@/features/clientes/components/ClienteStatusBadge'
export { ClienteTipoBadge } from '@/features/clientes/components/ClienteTipoBadge'
export { ClientesHeader } from '@/features/clientes/components/ClientesHeader'
export { FilterPills, ClientesKpiCard, KpiGrid } from '@/features/clientes/components/ClientesKpiCard'
export { DataTable, TableFooter, TableSection, TableToolbar } from '@/features/clientes/components/DataTable'
export { SegmentoBreakdown } from '@/features/clientes/components/SegmentoBreakdown'
export { TopClientesCard } from '@/features/clientes/components/TopClientesCard'
export { AnaliseTab } from '@/features/clientes/components/tabs/AnaliseTab'
export { ListaClientesTab } from '@/features/clientes/components/tabs/ListaClientesTab'
export { VisaoGeralTab } from '@/features/clientes/components/tabs/VisaoGeralTab'

export * from '@/features/clientes/types'
export * from '@/features/clientes/utils'
export { CLIENTES } from '@/features/clientes/data/clientes'
export { CLIENTE_PEDIDOS } from '@/features/clientes/data/pedidos'
export { CLIENTES_ABAS, CLIENTES_FILTROS, CLIENTE_FORMAS_PAGAMENTO, CLIENTE_SEGMENTOS, EMPTY_CLIENTE_FORM, EMPTY_RECENTES_TABLE_FILTROS, ESTADOS_BR, FORMA_PAGAMENTO_LABEL, RECENTES_CADASTRO_FILTROS, RECENTES_STATUS_FILTROS } from '@/features/clientes/data/shared'
