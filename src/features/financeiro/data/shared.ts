import type {
  ContaBancaria,
  FluxoPonto,
  Lancamento,
  LancamentosTableFiltros,
  ContasTituloTableFiltros,
  ExtratoTableFiltros,
  TransferenciasTableFiltros,
} from '@/features/financeiro/types'

export const CONTAS_BANCARIAS: ContaBancaria[] = [
  { id: '1', nome: 'Itaú C/C', banco: 'itau', saldo: 24500 },
  { id: '2', nome: 'Bradesco C/C', banco: 'bradesco', saldo: 9800 },
  { id: '3', nome: 'Nubank PJ', banco: 'nubank', saldo: 6020 },
  { id: '4', nome: 'Caixa', banco: 'caixa', saldo: 1200 },
]

export const LANCAMENTOS: Lancamento[] = [
  { id: '1', descricao: 'Cliente Alfa Ltda.', subDescricao: 'NF-e 00142', categoria: 'Serviços prestados', vencimento: '10/06/2026', vencimentoIso: '2026-06-10', tipo: 'receber', valor: 12000, status: 'pago' },
  { id: '2', descricao: 'Aluguel escritório', subDescricao: 'Recorrente', categoria: 'Despesas fixas', vencimento: '15/06/2026', vencimentoIso: '2026-06-15', tipo: 'pagar', valor: 3200, status: 'pendente' },
  { id: '3', descricao: 'Fornecedor Beta S.A.', subDescricao: 'Boleto #8821', categoria: 'Compras', vencimento: '08/06/2026', vencimentoIso: '2026-06-08', tipo: 'pagar', valor: 5800, status: 'vencido' },
  { id: '4', descricao: 'Cliente Gama ME', subDescricao: 'NF-e 00143', categoria: 'Serviços prestados', vencimento: '20/06/2026', vencimentoIso: '2026-06-20', tipo: 'receber', valor: 8400, status: 'pendente' },
  { id: '5', descricao: 'Pro Labore — Guilherme', subDescricao: 'Folha junho', categoria: 'Pessoal', vencimento: '25/06/2026', vencimentoIso: '2026-06-25', tipo: 'pagar', valor: 6000, status: 'pendente' },
  { id: '6', descricao: 'Cliente Delta Corp.', subDescricao: 'NF-e 00144', categoria: 'Serviços prestados', vencimento: '28/06/2026', vencimentoIso: '2026-06-28', tipo: 'receber', valor: 15000, status: 'pendente' },
]

export const FLUXO_MES: FluxoPonto[] = [
  { label: '01', entradas: 22, saidas: 10 },
  { label: '05', entradas: 30, saidas: 15 },
  { label: '09', entradas: 16, saidas: 11 },
  { label: '12', entradas: 34, saidas: 17 },
  { label: '15', entradas: 25, saidas: 13 },
  { label: '19', entradas: 20, saidas: 8, projecao: true },
  { label: '23', entradas: 16, saidas: 9, projecao: true },
  { label: '28', entradas: 28, saidas: 12, projecao: true },
]

export const FINANCEIRO_ABAS = [
  { id: 'visao-geral' as const, label: 'Visão geral' },
  { id: 'a-pagar' as const, label: 'Contas a pagar' },
  { id: 'a-receber' as const, label: 'Contas a receber' },
  { id: 'extrato' as const, label: 'Extrato' },
  { id: 'transferencias' as const, label: 'Transferências' },
]

export const LANCAMENTO_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'receber' as const, label: 'A receber' },
  { id: 'pagar' as const, label: 'A pagar' },
  { id: 'vencidos' as const, label: 'Vencidos' },
]

export const LANCAMENTO_CATEGORIAS = [...new Set(LANCAMENTOS.map((l) => l.categoria))].sort()

export const LANCAMENTOS_VENCIMENTO_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'mes_atual' as const, label: 'Junho/2026' },
  { id: 'ultimos_30' as const, label: 'Últimos 30 dias' },
  { id: 'proximos_7' as const, label: 'Próximos 7 dias' },
  { id: 'vencidos' as const, label: 'Vencidos' },
]

export const LANCAMENTOS_TIPO_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'receber' as const, label: 'A receber' },
  { id: 'pagar' as const, label: 'A pagar' },
]

export const LANCAMENTOS_STATUS_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'pago' as const, label: 'Pago' },
  { id: 'pendente' as const, label: 'Pendente' },
  { id: 'vencido' as const, label: 'Vencido' },
]

export const EMPTY_LANCAMENTOS_TABLE_FILTROS: LancamentosTableFiltros = {
  descricao: '',
  categoria: '',
  vencimento: 'todos',
  tipo: 'todos',
  status: 'todos',
}

export const FINANCEIRO_DATA_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'mes_atual' as const, label: 'Junho/2026' },
  { id: 'ultimos_30' as const, label: 'Últimos 30 dias' },
  { id: 'ultimos_7' as const, label: 'Últimos 7 dias' },
]

export const EXTRATO_TIPO_TABLE_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'entrada' as const, label: 'Entradas' },
  { id: 'saida' as const, label: 'Saídas' },
]

export const TRANSFERENCIAS_STATUS_TABLE_FILTROS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'concluida' as const, label: 'Concluídas' },
  { id: 'agendada' as const, label: 'Agendadas' },
  { id: 'cancelada' as const, label: 'Canceladas' },
]

export const FORMA_PAGAMENTO_TABLE_FILTROS = [
  { id: 'boleto' as const, label: 'Boleto' },
  { id: 'pix' as const, label: 'PIX' },
  { id: 'transferencia' as const, label: 'Transferência' },
  { id: 'cartao' as const, label: 'Cartão' },
  { id: 'debito' as const, label: 'Débito' },
]

export const EMPTY_CONTAS_TITULO_TABLE_FILTROS: ContasTituloTableFiltros = {
  parte: '',
  categoria: '',
  vencimento: 'todos',
  formaPagamento: '',
  status: 'todos',
}

export const EMPTY_EXTRATO_TABLE_FILTROS: ExtratoTableFiltros = {
  descricao: '',
  categoria: '',
  conta: '',
  tipo: 'todos',
  data: 'todos',
}

export const EMPTY_TRANSFERENCIAS_TABLE_FILTROS: TransferenciasTableFiltros = {
  descricao: '',
  data: 'todos',
  status: 'todos',
}
