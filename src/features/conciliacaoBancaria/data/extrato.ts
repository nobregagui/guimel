import type { ExtratoItem, ExtratoItemStatus, ExtratoMovTipo, ExtratoOrigemTipo } from '@/features/conciliacaoBancaria/types'

interface Pattern {
  descricao: string
  origem: ExtratoOrigemTipo
  tipo: ExtratoMovTipo
  valorBase: number
  variacao: number
  docPrefix?: string
}

const PATTERNS: Pattern[] = [
  // Créditos
  { descricao: 'PIX REC - MERCADO LIVRE LTDA', origem: 'pix', tipo: 'credito', valorBase: 3_200, variacao: 800 },
  { descricao: 'PIX REC - STONE PAGAMENTOS SA', origem: 'pix', tipo: 'credito', valorBase: 5_800, variacao: 1_200 },
  { descricao: 'TED REC - CLIENTE ALFA LTDA', origem: 'ted', tipo: 'credito', valorBase: 12_000, variacao: 2_000, docPrefix: 'TED' },
  { descricao: 'TED REC - DISTRIBUIDORA XYZ ME', origem: 'ted', tipo: 'credito', valorBase: 8_400, variacao: 1_600 },
  { descricao: 'PIX REC - PAGSEGURO INTERNET', origem: 'pix', tipo: 'credito', valorBase: 4_200, variacao: 900 },
  { descricao: 'PIX REC - LOJA DELTA COMERCIO', origem: 'pix', tipo: 'credito', valorBase: 6_100, variacao: 1_100 },
  { descricao: 'TED REC - EMPRESA GAMA ME', origem: 'ted', tipo: 'credito', valorBase: 15_000, variacao: 3_000 },
  { descricao: 'PIX REC - MERCADO PAGO BRASIL', origem: 'pix', tipo: 'credito', valorBase: 2_800, variacao: 600 },
  { descricao: 'BOLETO LIQUIDADO - NF 00142', origem: 'boleto', tipo: 'credito', valorBase: 7_500, variacao: 0, docPrefix: 'BOL' },
  { descricao: 'PIX REC - CIELO CREDENCIAMENTOS', origem: 'pix', tipo: 'credito', valorBase: 9_800, variacao: 2_200 },
  { descricao: 'TED REC - GETNET PAGAMENTOS', origem: 'ted', tipo: 'credito', valorBase: 3_600, variacao: 400 },
  { descricao: 'RESGATE APLIC AUTOMATICA CDB', origem: 'resgate', tipo: 'credito', valorBase: 50_000, variacao: 10_000 },
  { descricao: 'PIX REC - STONE MAQUININHA', origem: 'pix', tipo: 'credito', valorBase: 1_850, variacao: 450 },
  { descricao: 'TED REC - CLIENTE BETA CORP', origem: 'ted', tipo: 'credito', valorBase: 22_000, variacao: 3_000 },
  { descricao: 'BOLETO RECEBIDO - NF 00156', origem: 'boleto', tipo: 'credito', valorBase: 4_800, variacao: 0 },
  // Débitos
  { descricao: 'PIX ENV - ALUGUEL ESCRITORIO', origem: 'pix', tipo: 'debito', valorBase: 3_200, variacao: 0 },
  { descricao: 'PIX ENV - FORNECEDOR BETA SA', origem: 'pix', tipo: 'debito', valorBase: 5_800, variacao: 400 },
  { descricao: 'TED ENV - ESCRITORIO CONTABIL SILVA', origem: 'ted', tipo: 'debito', valorBase: 1_800, variacao: 0 },
  { descricao: 'PAGTO BOL - COPEL ENERGIA', origem: 'boleto', tipo: 'debito', valorBase: 850, variacao: 120, docPrefix: 'BOL' },
  { descricao: 'PAGTO BOL - VIVO EMPRESAS', origem: 'boleto', tipo: 'debito', valorBase: 299, variacao: 0 },
  { descricao: 'PIX ENV - FOLHA DE PAGAMENTO JUN', origem: 'pix', tipo: 'debito', valorBase: 22_000, variacao: 0 },
  { descricao: 'IOF OPERACAO CREDITO 06/2026', origem: 'iof', tipo: 'debito', valorBase: 45, variacao: 20 },
  { descricao: 'TARIFA MANUTENCAO CONTA JUN', origem: 'tarifa', tipo: 'debito', valorBase: 68, variacao: 0 },
  { descricao: 'TARIFA TED ENVIADO', origem: 'tarifa', tipo: 'debito', valorBase: 8, variacao: 2 },
  { descricao: 'APLIC AUTOMATICA CDB', origem: 'aplicacao', tipo: 'debito', valorBase: 50_000, variacao: 10_000 },
  { descricao: 'DEB AUTO - SEGURO EMPRESARIAL', origem: 'cartao', tipo: 'debito', valorBase: 450, variacao: 0 },
  { descricao: 'PIX ENV - PRO LABORE SOCIO', origem: 'pix', tipo: 'debito', valorBase: 6_000, variacao: 0 },
  { descricao: 'PAGTO FATURA CARTAO CORP', origem: 'cartao', tipo: 'debito', valorBase: 3_200, variacao: 800 },
  { descricao: 'PIX ENV - IMPOSTOS DAS', origem: 'pix', tipo: 'debito', valorBase: 1_200, variacao: 200 },
  { descricao: 'TED ENV - FORNECEDOR GRAFICOS', origem: 'ted', tipo: 'debito', valorBase: 2_400, variacao: 600 },
  { descricao: 'JUROS SALDO NEGATIVO', origem: 'juros', tipo: 'debito', valorBase: 28, variacao: 15 },
]

function seed(n: number): number {
  return ((n * 1_103_515_245 + 12_345) & 0x7fff_ffff) / 0x7fff_ffff
}

function pickValue(base: number, variacao: number, s: number): number {
  if (variacao === 0) return base
  return Math.round((base + variacao * seed(s)) * 100) / 100
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.max(1, Math.min(day, 28))).padStart(2, '0')}`
}

function toBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function generateForAccount(contaId: string, saldoInicial: number): ExtratoItem[] {
  const items: ExtratoItem[] = []
  let saldo = saldoInicial
  let seq = contaId === 'cb-1' ? 0 : contaId === 'cb-2' ? 1000 : contaId === 'cb-3' ? 2000 : 3000

  for (let mBack = 5; mBack >= 0; mBack--) {
    const baseDate = new Date('2026-06-26')
    baseDate.setMonth(baseDate.getMonth() - mBack)
    const year = baseDate.getFullYear()
    const month = baseDate.getMonth() + 1

    const txCount = 12 + (seq % 8)

    for (let i = 0; i < txCount; i++) {
      seq++
      const pIdx = seq % PATTERNS.length
      const pat = PATTERNS[pIdx]
      const valor = pickValue(pat.valorBase, pat.variacao, seq)
      const day = 1 + Math.floor((i / txCount) * 27)
      const dataIso = toIso(year, month, day)

      saldo = pat.tipo === 'credito' ? saldo + valor : saldo - valor

      const isConciliated = mBack >= 1
      const isCurrent = mBack === 0

      let status: ExtratoItemStatus = 'pendente'
      if (isConciliated) status = 'conciliado'
      else if (isCurrent && seq % 7 === 0) status = 'sugerido'
      else if (isCurrent && seq % 11 === 0) status = 'ignorado'

      const conciliacaoId = isConciliated ? `conc-${contaId}-${seq}` : undefined
      const lancamentoErpId = isConciliated ? `erp-${seq}` : undefined

      const importMonth = mBack === 0 ? '2026-06-25' : toIso(year + (month >= 12 ? 1 : 0), month === 12 ? 1 : month + 1, 1)

      items.push({
        id: `ext-${contaId}-${seq}`,
        contaId,
        data: toBR(dataIso),
        dataIso,
        descricao: pat.descricao,
        documento: pat.docPrefix ? `${pat.docPrefix}-${seq * 7 + 1000}` : seq % 4 === 0 ? `DOC-${seq + 5000}` : undefined,
        valor,
        tipo: pat.tipo,
        saldo: Math.round(saldo * 100) / 100,
        origem: pat.origem,
        status,
        lancamentoErpId,
        conciliacaoId,
        importadoEm: importMonth,
      })
    }
  }

  return items.sort((a, b) => b.dataIso.localeCompare(a.dataIso))
}

export const EXTRATO_ITEMS: ExtratoItem[] = [
  ...generateForAccount('cb-1', 120_000),
  ...generateForAccount('cb-2', 45_000),
  ...generateForAccount('cb-3', 28_000),
].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
