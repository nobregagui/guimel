import type {
  NaturezaOperacao,
  NotaFiscalDevolucaoFormValues,
  NotaFiscalFormValues,
  NotaFiscalItemFormValues,
  NotasFiscaisAba,
  TipoDevolucao,
  TipoNota,
} from '@/features/notasFiscais/types'

export const NOTAS_FISCAIS_ABAS: { id: NotasFiscaisAba; label: string }[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'notas', label: 'Notas emitidas' },
  { id: 'relatorios', label: 'Relatórios' },
]

export const NATUREZAS_ENTRADA: NaturezaOperacao[] = [
  'compra',
  'devolucao_venda',
  'retorno',
  'remessa',
]

export const NATUREZAS_SAIDA: NaturezaOperacao[] = [
  'venda',
  'devolucao_compra',
  'servico',
  'transferencia',
  'remessa',
]

export const MINHA_EMPRESA = {
  nome: 'Minha Empresa Ltda',
  cnpj: '12.345.678/0001-95',
  ie: '123.456.789.110',
  endereco: 'Rua das Flores, 100',
  cidade: 'São Paulo',
  estado: 'SP',
} as const

export const ALIQUOTA_ICMS = 12
export const ALIQUOTA_PIS = 0.65
export const ALIQUOTA_COFINS = 3

export function emptyNotaFiscalItem(): NotaFiscalItemFormValues {
  return {
    descricao: '',
    ncm: '',
    cfop: '',
    unidade: 'UN',
    quantidade: 1,
    valorUnitario: 0,
    desconto: 0,
  }
}

export function createEmptyDevolucaoForm(
  tipoDevolucao: TipoDevolucao = 'devolucao_venda',
): NotaFiscalDevolucaoFormValues {
  const hoje = new Date().toISOString().split('T')[0]
  const isDevolucaoVenda = tipoDevolucao === 'devolucao_venda'

  return {
    tipoDevolucao,
    tipo: isDevolucaoVenda ? 'entrada' : 'saida',
    dataEmissao: hoje,
    dataSaida: hoje,
    vencimento: '',
    notaOriginalId: '',
    referenciaChaveAcesso: '',
    referenciaNumero: '',
    referenciaSerie: '',
    referenciaDataEmissao: '',
    motivoDevolucao: 'defeito',
    motivoDescricao: '',
    destinatarioNome: '',
    destinatarioCnpj: '',
    destinatarioIe: '',
    destinatarioCpf: '',
    destinatarioEndereco: '',
    destinatarioCidade: '',
    destinatarioEstado: 'SP',
    itens: [],
    valorFrete: 0,
    valorSeguro: 0,
    valorOutrasDespesas: 0,
    formaPagamento: 'pix',
    informacoesAdicionais: '',
  }
}

export function createEmptyNotaFiscalForm(tipo: TipoNota): NotaFiscalFormValues {
  const naturezas = tipo === 'entrada' ? NATUREZAS_ENTRADA : NATUREZAS_SAIDA
  const hoje = new Date().toISOString().split('T')[0]

  return {
    tipo,
    naturezaOperacao: naturezas[0],
    dataEmissao: hoje,
    dataSaida: hoje,
    vencimento: '',
    destinatarioNome: '',
    destinatarioCnpj: '',
    destinatarioIe: '',
    destinatarioCpf: '',
    destinatarioEndereco: '',
    destinatarioCidade: '',
    destinatarioEstado: 'SP',
    itens: [emptyNotaFiscalItem()],
    valorFrete: 0,
    valorSeguro: 0,
    valorOutrasDespesas: 0,
    formaPagamento: 'pix',
    informacoesAdicionais: '',
  }
}
