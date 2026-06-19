import type { CondicaoPagamento, FormaPagamento, Parcela } from '@/features/vendas/types'

export interface OpcaoParcela {
  parcelas: number
  taxaMensal: number
  label: string
}

export interface ConfigFormaPagamento {
  label: string
  prazoInicial: number
  intervalo: number
  opcoesParcelas: OpcaoParcela[]
}

export const CONFIG_FORMA: Record<FormaPagamento, ConfigFormaPagamento> = {
  pix: {
    label: 'PIX',
    prazoInicial: 0,
    intervalo: 0,
    opcoesParcelas: [{ parcelas: 1, taxaMensal: 0, label: 'À vista (PIX)' }],
  },
  debito: {
    label: 'Débito',
    prazoInicial: 1,
    intervalo: 0,
    opcoesParcelas: [{ parcelas: 1, taxaMensal: 0, label: 'À vista (débito)' }],
  },
  transferencia: {
    label: 'Transferência',
    prazoInicial: 1,
    intervalo: 30,
    opcoesParcelas: [
      { parcelas: 1, taxaMensal: 0, label: 'À vista' },
      { parcelas: 2, taxaMensal: 0, label: '2× sem juros' },
      { parcelas: 3, taxaMensal: 0, label: '3× sem juros' },
    ],
  },
  boleto: {
    label: 'Boleto',
    prazoInicial: 3,
    intervalo: 30,
    opcoesParcelas: [
      { parcelas: 1, taxaMensal: 0, label: 'À vista (30 dias)' },
      { parcelas: 2, taxaMensal: 0, label: '2× sem juros (30/60)' },
      { parcelas: 3, taxaMensal: 0, label: '3× sem juros' },
      { parcelas: 4, taxaMensal: 1.5, label: '4× (1,5% a.m.)' },
      { parcelas: 6, taxaMensal: 1.5, label: '6× (1,5% a.m.)' },
      { parcelas: 9, taxaMensal: 1.99, label: '9× (1,99% a.m.)' },
      { parcelas: 12, taxaMensal: 1.99, label: '12× (1,99% a.m.)' },
    ],
  },
  boleto_prazo: {
    label: 'Boleto a prazo',
    prazoInicial: 30,
    intervalo: 30,
    opcoesParcelas: [
      { parcelas: 1, taxaMensal: 0, label: 'À vista a prazo' },
      { parcelas: 2, taxaMensal: 0, label: '2× a prazo' },
      { parcelas: 3, taxaMensal: 0, label: '3× a prazo' },
      { parcelas: 4, taxaMensal: 0, label: '4× a prazo' },
      { parcelas: 6, taxaMensal: 0, label: '6× a prazo' },
      { parcelas: 9, taxaMensal: 0, label: '9× a prazo' },
      { parcelas: 12, taxaMensal: 0, label: '12× a prazo' },
    ],
  },
  cartao: {
    label: 'Cartão de crédito',
    prazoInicial: 30,
    intervalo: 30,
    opcoesParcelas: [
      { parcelas: 1, taxaMensal: 0, label: 'À vista' },
      { parcelas: 2, taxaMensal: 0, label: '2× sem juros' },
      { parcelas: 3, taxaMensal: 0, label: '3× sem juros' },
      { parcelas: 4, taxaMensal: 0, label: '4× sem juros' },
      { parcelas: 5, taxaMensal: 0, label: '5× sem juros' },
      { parcelas: 6, taxaMensal: 0, label: '6× sem juros' },
      { parcelas: 7, taxaMensal: 1.99, label: '7× (1,99% a.m.)' },
      { parcelas: 8, taxaMensal: 1.99, label: '8× (1,99% a.m.)' },
      { parcelas: 9, taxaMensal: 1.99, label: '9× (1,99% a.m.)' },
      { parcelas: 10, taxaMensal: 1.99, label: '10× (1,99% a.m.)' },
      { parcelas: 11, taxaMensal: 1.99, label: '11× (1,99% a.m.)' },
      { parcelas: 12, taxaMensal: 1.99, label: '12× (1,99% a.m.)' },
    ],
  },
}

export function defaultDiasVencimento(parcelas: number, formaPagamento: FormaPagamento): number[] {
  const config = CONFIG_FORMA[formaPagamento]
  return Array.from({ length: parcelas }, (_, i) => config.prazoInicial + config.intervalo * i)
}

export function normalizarDiasVencimento(
  dias: number[],
  parcelas: number,
  formaPagamento: FormaPagamento,
): number[] {
  const defaults = defaultDiasVencimento(parcelas, formaPagamento)
  return defaults.map((fallback, index) => {
    const valor = dias[index]
    return typeof valor === 'number' && valor >= 1 ? Math.floor(valor) : fallback
  })
}

export function descricaoCondicaoBoletoPrazo(parcelas: number, dias: number[]): string {
  const diasFmt = dias.map((d) => `${d}d`).join('/')
  if (parcelas === 1) return `À vista a prazo (${dias[0]} dias)`
  return `${parcelas}× a prazo (${diasFmt})`
}

export function dataVencimentoPorDias(dias: number, dataBase = new Date()): Date {
  const vencimento = new Date(dataBase)
  vencimento.setDate(vencimento.getDate() + dias)
  return vencimento
}

export function calcularCronogramaComDias(
  valorBase: number,
  parcelas: number,
  taxaMensal: number,
  diasVencimento: number[],
  dataBase = new Date(),
): Parcela[] {
  if (valorBase <= 0 || parcelas <= 0) return []

  const dias = normalizarDiasVencimento(diasVencimento, parcelas, 'boleto_prazo')
  const taxa = taxaMensal / 100

  let valorParcela: number
  if (taxa === 0) {
    valorParcela = valorBase / parcelas
  } else {
    const fator = Math.pow(1 + taxa, parcelas)
    valorParcela = (valorBase * (taxa * fator)) / (fator - 1)
  }

  const resultado: Parcela[] = []

  for (let i = 0; i < parcelas; i++) {
    const vencimento = dataVencimentoPorDias(dias[i], dataBase)
    const valorSemJuros = valorBase / parcelas
    const juros = Math.max(0, valorParcela - valorSemJuros)

    resultado.push({
      numero: i + 1,
      vencimentoIso: vencimento.toISOString(),
      valor: valorSemJuros,
      juros,
      valorComJuros: valorParcela,
    })
  }

  const somaAntes = resultado.reduce((s, p) => s + p.valorComJuros, 0)
  const totalEsperado =
    taxa === 0
      ? valorBase
      : ((valorBase * (taxa * Math.pow(1 + taxa, parcelas))) /
          (Math.pow(1 + taxa, parcelas) - 1)) *
        parcelas
  const diff = totalEsperado - somaAntes

  if (Math.abs(diff) > 0.001 && resultado.length > 0) {
    const ultima = resultado[resultado.length - 1]
    ultima.valorComJuros = Math.max(0, ultima.valorComJuros + diff)
    ultima.juros = Math.max(0, ultima.juros + diff)
  }

  return resultado
}

export function calcularCronograma(
  valorBase: number,
  parcelas: number,
  taxaMensal: number,
  prazoInicial: number,
  intervalo: number,
): Parcela[] {
  if (valorBase <= 0 || parcelas <= 0) return []

  const taxa = taxaMensal / 100
  const hoje = new Date()

  let valorParcela: number
  if (taxa === 0) {
    valorParcela = valorBase / parcelas
  } else {
    const fator = Math.pow(1 + taxa, parcelas)
    valorParcela = (valorBase * (taxa * fator)) / (fator - 1)
  }

  const resultado: Parcela[] = []

  for (let i = 0; i < parcelas; i++) {
    const diasDesdeHoje = prazoInicial + intervalo * i
    const vencimento = new Date(hoje)
    vencimento.setDate(vencimento.getDate() + diasDesdeHoje)

    const valorSemJuros = valorBase / parcelas
    const juros = Math.max(0, valorParcela - valorSemJuros)

    resultado.push({
      numero: i + 1,
      vencimentoIso: vencimento.toISOString(),
      valor: valorSemJuros,
      juros,
      valorComJuros: valorParcela,
    })
  }

  const somaAntes = resultado.reduce((s, p) => s + p.valorComJuros, 0)
  const totalEsperado =
    taxa === 0
      ? valorBase
      : ((valorBase * (taxa * Math.pow(1 + taxa, parcelas))) /
          (Math.pow(1 + taxa, parcelas) - 1)) *
        parcelas
  const diff = totalEsperado - somaAntes

  if (Math.abs(diff) > 0.001 && resultado.length > 0) {
    const ultima = resultado[resultado.length - 1]
    ultima.valorComJuros = Math.max(0, ultima.valorComJuros + diff)
    ultima.juros = Math.max(0, ultima.juros + diff)
  }

  return resultado
}

export function calcularCondicao(
  valorBase: number,
  formaPagamento: FormaPagamento,
  parcelas: number,
  taxaMensal: number,
  diasVencimento?: number[],
  dataBase?: Date,
): CondicaoPagamento {
  const config = CONFIG_FORMA[formaPagamento]
  const opcao =
    config.opcoesParcelas.find((o) => o.parcelas === parcelas && o.taxaMensal === taxaMensal) ??
    config.opcoesParcelas[0]

  const base = dataBase ?? new Date()
  const usaDiasCustomizados = formaPagamento === 'boleto_prazo'
  const diasNorm = usaDiasCustomizados
    ? normalizarDiasVencimento(diasVencimento ?? [], opcao.parcelas, formaPagamento)
    : undefined

  const cronograma = usaDiasCustomizados
    ? calcularCronogramaComDias(
        valorBase,
        opcao.parcelas,
        opcao.taxaMensal,
        diasNorm ?? [],
        base,
      )
    : calcularCronograma(
        valorBase,
        opcao.parcelas,
        opcao.taxaMensal,
        config.prazoInicial,
        config.intervalo,
      )

  const totalComJuros = cronograma.reduce((s, p) => s + p.valorComJuros, 0)
  const totalJuros = cronograma.reduce((s, p) => s + p.juros, 0)

  const descricao = usaDiasCustomizados
    ? descricaoCondicaoBoletoPrazo(opcao.parcelas, diasNorm ?? [])
    : opcao.label

  return {
    formaPagamento,
    parcelas: opcao.parcelas,
    intervaloDias: config.intervalo,
    taxaJurosMensal: opcao.taxaMensal,
    diasVencimento: diasNorm,
    descricao,
    cronograma,
    totalComJuros,
    totalJuros,
  }
}

export function formatarDataCurta(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function normalizeFormaPagamento(raw: string): FormaPagamento {
  const map: Record<string, FormaPagamento> = {
    pix: 'pix',
    boleto: 'boleto',
    boleto_prazo: 'boleto_prazo',
    transferencia: 'transferencia',
    cartao: 'cartao',
    cartao_credito: 'cartao',
    cartao_debito: 'debito',
    debito: 'debito',
  }
  return map[raw] ?? 'boleto'
}
