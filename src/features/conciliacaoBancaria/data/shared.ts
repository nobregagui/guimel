import type {
  ExtratoTableFiltros,
  ErpTableFiltros,
  ExtratoOrigemTipo,
  ExtratoMovTipo,
  ExtratoItemStatus,
  ErpLancTipo,
  ErpLancStatus,
} from '@/features/conciliacaoBancaria/types'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const CONCILIACAO_ABAS = [
  { id: 'dashboard' as const, label: 'Dashboard' },
  { id: 'conciliacao' as const, label: 'Conciliação' },
  { id: 'regras' as const, label: 'Regras' },
  { id: 'analytics' as const, label: 'Analytics' },
  { id: 'historico' as const, label: 'Histórico' },
]

// ─── Extrato filter options ───────────────────────────────────────────────────
export const EXTRATO_ORIGEM_FILTROS: { id: ExtratoOrigemTipo | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todas as origens' },
  { id: 'pix', label: 'PIX' },
  { id: 'ted', label: 'TED' },
  { id: 'doc', label: 'DOC' },
  { id: 'boleto', label: 'Boleto' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'tarifa', label: 'Tarifa' },
  { id: 'iof', label: 'IOF' },
  { id: 'juros', label: 'Juros' },
  { id: 'transferencia', label: 'Transferência' },
  { id: 'aplicacao', label: 'Aplicação' },
  { id: 'resgate', label: 'Resgate' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'outros', label: 'Outros' },
]

export const EXTRATO_TIPO_FILTROS: { id: ExtratoMovTipo | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Débitos e créditos' },
  { id: 'credito', label: 'Créditos' },
  { id: 'debito', label: 'Débitos' },
]

export const EXTRATO_STATUS_FILTROS: { id: ExtratoItemStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos os status' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'sugerido', label: 'Sugerido' },
  { id: 'conciliado', label: 'Conciliado' },
  { id: 'ignorado', label: 'Ignorado' },
]

export const EXTRATO_DATA_FILTROS = [
  { id: 'todos' as const, label: 'Todos os períodos' },
  { id: 'hoje' as const, label: 'Hoje' },
  { id: 'semana' as const, label: 'Últimos 7 dias' },
  { id: 'mes' as const, label: 'Junho/2026' },
  { id: 'mes_anterior' as const, label: 'Maio/2026' },
]

// ─── ERP filter options ───────────────────────────────────────────────────────
export const ERP_TIPO_FILTROS: { id: ErpLancTipo | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Receber e pagar' },
  { id: 'receber', label: 'A receber' },
  { id: 'pagar', label: 'A pagar' },
]

export const ERP_STATUS_FILTROS: { id: ErpLancStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos os status' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'conciliado', label: 'Conciliado' },
  { id: 'pago', label: 'Pago' },
]

export const ERP_DATA_FILTROS = [
  { id: 'todos' as const, label: 'Todos os períodos' },
  { id: 'mes_atual' as const, label: 'Junho/2026' },
  { id: 'mes_anterior' as const, label: 'Maio/2026' },
  { id: 'ultimos_30' as const, label: 'Últimos 30 dias' },
  { id: 'proximos_7' as const, label: 'Próximos 7 dias' },
]

// ─── ERP categories ───────────────────────────────────────────────────────────
export const ERP_CATEGORIAS_RECEBER = [
  'Serviços prestados',
  'Marketplace',
  'Comissões',
  'Licenças de software',
  'Consultoria',
  'Vendas produto',
]

export const ERP_CATEGORIAS_PAGAR = [
  'Aluguel',
  'Fornecedores',
  'Pessoal',
  'Utilidades',
  'Serviços externos',
  'Impostos e taxas',
  'Tarifas bancárias',
  'Seguros',
  'Marketing',
  'TI e Software',
]

export const ERP_CENTROS_CUSTO = [
  'Comercial',
  'Operacional',
  'Administrativo',
  'TI',
  'RH',
  'Marketing',
]

// ─── Empty filter states ──────────────────────────────────────────────────────
export const EMPTY_EXTRATO_FILTROS: ExtratoTableFiltros = {
  busca: '',
  contaId: 'todas',
  origem: 'todos',
  tipo: 'todos',
  status: 'pendente',
  data: 'todos',
  valorMin: '',
  valorMax: '',
}

export const EMPTY_ERP_FILTROS: ErpTableFiltros = {
  busca: '',
  tipo: 'todos',
  status: 'pendente',
  categoria: '',
  centroCusto: '',
  data: 'todos',
  valorMin: '',
  valorMax: '',
}
