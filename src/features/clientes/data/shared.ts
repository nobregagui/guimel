import type { RecentesTableFiltros } from '@/features/clientes/types'

export const CLIENTES_ABAS = [
  { id: 'visao-geral' as const, label: 'Visão geral' },
  { id: 'clientes' as const, label: 'Clientes' },
  { id: 'analise' as const, label: 'Análise' },
]

export const CLIENTES_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'ativos' as const, label: 'Ativos' },
  { id: 'inativos' as const, label: 'Inativos' },
  { id: 'pendentes' as const, label: 'Pendentes' },
]

export const RECENTES_CADASTRO_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'mes_atual' as const, label: 'Junho/2026' },
  { id: 'ultimos_30' as const, label: 'Últimos 30 dias' },
  { id: 'ultimos_90' as const, label: 'Últimos 90 dias' },
]

export const RECENTES_STATUS_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'ativo' as const, label: 'Ativo' },
  { id: 'inativo' as const, label: 'Inativo' },
  { id: 'pendente' as const, label: 'Pendente' },
]

export const EMPTY_RECENTES_TABLE_FILTROS: RecentesTableFiltros = {
  segmento: '',
  cadastro: 'todos',
  status: 'todos',
}

export const CLIENTE_SEGMENTOS = [
  'Serviços',
  'Comércio',
  'Indústria',
  'Distribuição',
  'Tecnologia',
  'Varejo',
  'Consultoria',
  'Educação',
  'Marketing',
]

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const CLIENTE_FORMAS_PAGAMENTO = [
  { id: 'pix' as const, label: 'PIX' },
  { id: 'boleto' as const, label: 'Boleto' },
  { id: 'boleto_prazo' as const, label: 'Boleto a prazo' },
  { id: 'transferencia' as const, label: 'Transferência' },
  { id: 'cartao' as const, label: 'Cartão' },
  { id: 'debito' as const, label: 'Débito' },
]

export const FORMA_PAGAMENTO_LABEL: Record<(typeof CLIENTE_FORMAS_PAGAMENTO)[number]['id'], string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  boleto_prazo: 'Boleto a prazo',
  transferencia: 'Transferência',
  cartao: 'Cartão',
  debito: 'Débito',
}

export const EMPTY_CLIENTE_FORM = {
  tipo: 'pj' as const,
  nome: '',
  nomeFantasia: '',
  documento: '',
  email: '',
  telefone: '',
  segmento: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: 'SP',
  observacao: '',
  formaPagamentoPreferida: 'pix' as const,
  parcelasPreferidas: 1,
  taxaJurosMensalPreferida: 0,
  diasVencimentoPreferidos: [30],
}
