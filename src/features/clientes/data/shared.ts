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
  { id: 'transferencia' as const, label: 'Transferência' },
  { id: 'cartao' as const, label: 'Cartão' },
  { id: 'debito' as const, label: 'Débito' },
]

export const FORMA_PAGAMENTO_LABEL: Record<(typeof CLIENTE_FORMAS_PAGAMENTO)[number]['id'], string> = {
  pix: 'PIX',
  boleto: 'Boleto',
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
  cidade: '',
  estado: 'SP',
  observacao: '',
  formaPagamentoPreferida: 'pix' as const,
}
