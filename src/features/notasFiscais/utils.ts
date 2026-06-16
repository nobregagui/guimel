import {
  ALIQUOTA_COFINS,
  ALIQUOTA_ICMS,
  ALIQUOTA_PIS,
  MINHA_EMPRESA,
} from '@/features/notasFiscais/data/shared'
import type {
  ItemNota,
  NotaFiscal,
  NotaFiscalFormValues,
  NotaFiscalItemFormValues,
  StatusFilter,
  StatusNota,
  TipoFilter,
  TributosNota,
} from '@/features/notasFiscais/types'

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function calcTotalItens(itens: NotaFiscalItemFormValues[]): number {
  return itens.reduce((acc, item) => {
    const subtotal = item.quantidade * item.valorUnitario - item.desconto
    return acc + subtotal
  }, 0)
}

export function calcTributosEstimados(base: number): TributosNota {
  const valorIcms = (base * ALIQUOTA_ICMS) / 100
  const valorPis = (base * ALIQUOTA_PIS) / 100
  const valorCofins = (base * ALIQUOTA_COFINS) / 100

  return {
    baseIcms: base,
    valorIcms,
    basePis: base,
    valorPis,
    baseCofins: base,
    valorCofins,
    valorIpi: 0,
    valorIss: 0,
    valorCsll: 0,
    valorIrpj: 0,
    valorTotalTributos: valorIcms + valorPis + valorCofins,
  }
}

function buildItensFromForm(itens: NotaFiscalItemFormValues[], timestamp: number): ItemNota[] {
  return itens.map((item, index) => {
    const valorTotal = item.quantidade * item.valorUnitario - item.desconto
    const baseCalculo = valorTotal
    const valorIcms = (baseCalculo * ALIQUOTA_ICMS) / 100
    const valorPis = (baseCalculo * ALIQUOTA_PIS) / 100
    const valorCofins = (baseCalculo * ALIQUOTA_COFINS) / 100

    return {
      id: `item-${timestamp}-${index}`,
      codigo: `ITEM${String(index + 1).padStart(3, '0')}`,
      descricao: item.descricao,
      ncm: item.ncm || '0000.00.00',
      cfop: item.cfop || (item.unidade === 'SERV' ? '5933' : '5102'),
      unidade: item.unidade,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal,
      desconto: item.desconto,
      baseCalculo,
      aliquotaIcms: ALIQUOTA_ICMS,
      valorIcms,
      aliquotaIpi: 0,
      valorIpi: 0,
      aliquotaPis: ALIQUOTA_PIS,
      valorPis,
      aliquotaCofins: ALIQUOTA_COFINS,
      valorCofins,
    }
  })
}

function generateChaveAcesso(numero: string): string {
  const padded = numero.padStart(9, '0')
  return `352406123456780001955500100${padded}${String(Date.now()).slice(-8)}`
}

export function buildNotaFromForm(
  values: NotaFiscalFormValues,
  existingCount: number,
): Omit<NotaFiscal, 'id'> {
  const timestamp = Date.now()
  const numero = String(existingCount + 1).padStart(6, '0')
  const itens = buildItensFromForm(values.itens, timestamp)
  const totalItens = calcTotalItens(values.itens)
  const valorDesconto = values.itens.reduce((acc, item) => acc + item.desconto, 0)
  const valorProdutos = values.itens.reduce(
    (acc, item) => acc + item.quantidade * item.valorUnitario,
    0,
  )
  const valorTotal =
    totalItens + values.valorFrete + values.valorSeguro + values.valorOutrasDespesas
  const tributos = calcTributosEstimados(totalItens)

  const contraparte = {
    nome: values.destinatarioNome,
    cnpj: values.destinatarioCnpj,
    ie: values.destinatarioIe ?? '',
    endereco: values.destinatarioEndereco,
    cidade: values.destinatarioCidade,
    estado: values.destinatarioEstado,
  }

  const isEntrada = values.tipo === 'entrada'

  return {
    numero,
    serie: '1',
    chaveAcesso: generateChaveAcesso(numero),
    tipo: values.tipo,
    status: 'pendente',
    naturezaOperacao: values.naturezaOperacao,
    dataEmissao: values.dataEmissao,
    ...(isEntrada
      ? { dataEntrada: values.dataSaida }
      : { dataSaida: values.dataSaida }),
    vencimento: values.vencimento || undefined,
    emitente: isEntrada ? contraparte : { ...MINHA_EMPRESA },
    destinatario: isEntrada
      ? { ...MINHA_EMPRESA }
      : { ...contraparte, cpf: values.destinatarioCpf },
    itens,
    tributos,
    valorProdutos,
    valorDesconto,
    valorFrete: values.valorFrete,
    valorSeguro: values.valorSeguro,
    valorOutrasDespesas: values.valorOutrasDespesas,
    valorTotal,
    formaPagamento: values.formaPagamento,
    informacoesAdicionais: values.informacoesAdicionais?.trim() || undefined,
  }
}

export function filterNotasFiscais(
  notas: NotaFiscal[],
  statusFilter: StatusFilter,
  tipoFilter: TipoFilter,
  search: string,
): NotaFiscal[] {
  let result = notas

  if (statusFilter !== 'todas') {
    result = result.filter((nota) => nota.status === statusFilter)
  }

  if (tipoFilter !== 'todas') {
    result = result.filter((nota) => nota.tipo === tipoFilter)
  }

  const termo = search.trim().toLowerCase()
  if (termo) {
    result = result.filter(
      (nota) =>
        nota.numero.includes(termo) ||
        nota.destinatario.nome.toLowerCase().includes(termo) ||
        nota.emitente.nome.toLowerCase().includes(termo) ||
        nota.chaveAcesso.includes(termo),
    )
  }

  return [...result].sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao))
}

export const STATUS_DOT_COLORS: Record<StatusNota, string> = {
  autorizada: '#15803d',
  pendente: '#b45309',
  cancelada: '#dc2626',
  denegada: '#dc2626',
  inutilizada: '#6b7280',
}
