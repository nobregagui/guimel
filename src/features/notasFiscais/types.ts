export type TipoNota = 'entrada' | 'saida'

export type StatusNota =
  | 'autorizada'
  | 'pendente'
  | 'cancelada'
  | 'denegada'
  | 'inutilizada'

export type NaturezaOperacao =
  | 'venda'
  | 'compra'
  | 'devolucao_venda'
  | 'devolucao_compra'
  | 'transferencia'
  | 'remessa'
  | 'retorno'
  | 'servico'

export type FormaPagamentoNF =
  | 'dinheiro'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'boleto'
  | 'pix'
  | 'transferencia'
  | 'outros'

export type NotasFiscaisAba = 'visao-geral' | 'notas' | 'relatorios'

export type StatusFilter = 'todas' | StatusNota
export type TipoFilter = 'todas' | TipoNota

export interface EntidadeNota {
  nome: string
  cnpj: string
  ie: string
  endereco: string
  cidade: string
  estado: string
}

export interface ItemNota {
  id: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  desconto: number
  baseCalculo: number
  aliquotaIcms: number
  valorIcms: number
  aliquotaIpi: number
  valorIpi: number
  aliquotaPis: number
  valorPis: number
  aliquotaCofins: number
  valorCofins: number
}

export interface TributosNota {
  baseIcms: number
  valorIcms: number
  basePis: number
  valorPis: number
  baseCofins: number
  valorCofins: number
  valorIpi: number
  valorIss: number
  valorCsll: number
  valorIrpj: number
  valorTotalTributos: number
}

export interface NotaFiscal {
  id: string
  numero: string
  serie: string
  chaveAcesso: string
  tipo: TipoNota
  status: StatusNota
  naturezaOperacao: NaturezaOperacao
  dataEmissao: string
  dataSaida?: string
  dataEntrada?: string
  vencimento?: string
  emitente: EntidadeNota
  destinatario: EntidadeNota & { ie?: string; cpf?: string }
  itens: ItemNota[]
  tributos: TributosNota
  valorProdutos: number
  valorDesconto: number
  valorFrete: number
  valorSeguro: number
  valorOutrasDespesas: number
  valorTotal: number
  formaPagamento: FormaPagamentoNF
  informacoesAdicionais?: string
  xmlUrl?: string
  pdfUrl?: string
  protocolo?: string
  dataProtocolo?: string
  motivoCancelamento?: string
}

export interface NotaFiscalItemFormValues {
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  desconto: number
}

export interface NotaFiscalFormValues {
  tipo: TipoNota
  naturezaOperacao: NaturezaOperacao
  dataEmissao: string
  dataSaida?: string
  vencimento?: string
  destinatarioNome: string
  destinatarioCnpj: string
  destinatarioIe?: string
  destinatarioCpf?: string
  destinatarioEndereco: string
  destinatarioCidade: string
  destinatarioEstado: string
  itens: NotaFiscalItemFormValues[]
  valorFrete: number
  valorSeguro: number
  valorOutrasDespesas: number
  formaPagamento: FormaPagamentoNF
  informacoesAdicionais?: string
}

export const NATUREZA_OPERACAO_LABEL: Record<NaturezaOperacao, string> = {
  venda: 'Venda de mercadoria',
  compra: 'Compra de mercadoria',
  devolucao_venda: 'Devolução de venda',
  devolucao_compra: 'Devolução de compra',
  transferencia: 'Transferência',
  remessa: 'Remessa',
  retorno: 'Retorno de remessa',
  servico: 'Prestação de serviço',
}

export const FORMA_PAGAMENTO_NF_LABEL: Record<FormaPagamentoNF, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  boleto: 'Boleto bancário',
  pix: 'PIX',
  transferencia: 'Transferência bancária',
  outros: 'Outros',
}

export const STATUS_NF_LABEL: Record<StatusNota, string> = {
  autorizada: 'Autorizada',
  pendente: 'Pendente',
  cancelada: 'Cancelada',
  denegada: 'Denegada',
  inutilizada: 'Inutilizada',
}

export const UNIDADE_OPTIONS = [
  'UN',
  'PC',
  'KG',
  'G',
  'L',
  'ML',
  'M',
  'M2',
  'M3',
  'CX',
  'FD',
  'DZ',
  'PAR',
  'HORA',
  'SERV',
] as const

export const ESTADO_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const
