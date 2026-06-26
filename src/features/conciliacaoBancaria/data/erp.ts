import type { ErpLancamento } from '@/features/conciliacaoBancaria/types'

const CLIENTES = [
  'Mercado Livre Brasil LTDA',
  'Stone Pagamentos SA',
  'Cliente Alfa Comércio LTDA',
  'Distribuidora XYZ ME',
  'PagSeguro Internet LTDA',
  'Loja Delta Comércio',
  'Empresa Gama ME',
  'Mercado Pago Brasil LTDA',
  'Cielo Credenciamentos SA',
  'GetNet Pagamentos LTDA',
  'Cliente Beta Corporativo',
  'Serviços Delta Consultoria',
]

const FORNECEDORES = [
  'Imobiliária Sigma LTDA',
  'Fornecedor Beta SA',
  'Escritório Contábil Silva',
  'COPEL Energia Elétrica',
  'Vivo Empresas',
  'Seguradora Alfa Seguros',
  'Gráfica Impressos Rápidos',
  'Software House Delta TI',
  'Fornecedor Gráficos',
  'Marketing Digital Omega',
]

const CATEGORIAS_RECEBER = [
  'Serviços prestados',
  'Marketplace',
  'Comissões',
  'Licenças de software',
  'Consultoria',
  'Vendas produto',
]

const CATEGORIAS_PAGAR = [
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

const CENTROS_CUSTO = ['Comercial', 'Operacional', 'Administrativo', 'TI', 'RH', 'Marketing']

function seed(n: number): number {
  return ((n * 1_103_515_245 + 12_345) & 0x7fff_ffff) / 0x7fff_ffff
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.max(1, Math.min(day, 28))).padStart(2, '0')}`
}

function toBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function generate(): ErpLancamento[] {
  const lancamentos: ErpLancamento[] = []
  let seq = 5000

  // ─── Pre-conciliated: Jan-May 2026 ────────────────────────────────────────
  for (let mBack = 5; mBack >= 1; mBack--) {
    const ref = new Date('2026-06-26')
    ref.setMonth(ref.getMonth() - mBack)
    const year = ref.getFullYear()
    const month = ref.getMonth() + 1
    const m2 = String(month).padStart(2, '0')
    const competenciaIso = `${year}-${m2}`
    const competencia = `${m2}/${year}`

    for (let i = 0; i < 10; i++) {
      seq++
      const day = 1 + Math.floor(seed(seq) * 26)
      const vencimentoIso = toIso(year, month, day)
      const clienteIdx = seq % CLIENTES.length
      const catIdx = seq % CATEGORIAS_RECEBER.length
      const ccIdx = seq % CENTROS_CUSTO.length
      const valor = Math.round((2_000 + seed(seq) * 13_000) * 100) / 100

      lancamentos.push({
        id: `erp-${seq}`,
        tipo: 'receber',
        descricao: `Recebimento — ${CLIENTES[clienteIdx]}`,
        cliente: CLIENTES[clienteIdx],
        documento: `NF-e ${String(seq).padStart(5, '0')}`,
        categoria: CATEGORIAS_RECEBER[catIdx],
        centroCusto: CENTROS_CUSTO[ccIdx],
        competencia,
        competenciaIso,
        vencimento: toBR(vencimentoIso),
        vencimentoIso,
        valor,
        status: 'conciliado',
        conciliacaoId: `conc-cb-1-${seq}`,
        extratoItemId: `ext-cb-1-${seq}`,
      })
    }

    for (let i = 0; i < 8; i++) {
      seq++
      const day = 1 + Math.floor(seed(seq) * 26)
      const vencimentoIso = toIso(year, month, day)
      const fornIdx = seq % FORNECEDORES.length
      const catIdx = seq % CATEGORIAS_PAGAR.length
      const ccIdx = seq % CENTROS_CUSTO.length
      const valor = Math.round((500 + seed(seq) * 8_000) * 100) / 100

      lancamentos.push({
        id: `erp-${seq}`,
        tipo: 'pagar',
        descricao: `Pagamento — ${FORNECEDORES[fornIdx]}`,
        fornecedor: FORNECEDORES[fornIdx],
        documento: seq % 2 === 0 ? `BOL-${seq * 11 + 500}` : undefined,
        categoria: CATEGORIAS_PAGAR[catIdx],
        centroCusto: CENTROS_CUSTO[ccIdx],
        competencia,
        competenciaIso,
        vencimento: toBR(vencimentoIso),
        vencimentoIso,
        valor,
        status: 'conciliado',
        conciliacaoId: `conc-cb-2-${seq}`,
        extratoItemId: `ext-cb-2-${seq}`,
      })
    }
  }

  // ─── Pending: June 2026 ────────────────────────────────────────────────────
  const YEAR = 2026
  const MONTH = 6
  const M2 = '06'
  const competenciaIso = `${YEAR}-${M2}`
  const competencia = `${M2}/${YEAR}`

  for (let i = 0; i < 14; i++) {
    seq++
    const day = 1 + Math.floor(seed(seq) * 28)
    const vencimentoIso = toIso(YEAR, MONTH, day)
    const clienteIdx = seq % CLIENTES.length
    const catIdx = seq % CATEGORIAS_RECEBER.length
    const ccIdx = seq % CENTROS_CUSTO.length
    const valor = Math.round((1_500 + seed(seq) * 18_000) * 100) / 100

    lancamentos.push({
      id: `erp-${seq}`,
      tipo: 'receber',
      descricao: `Recebimento — ${CLIENTES[clienteIdx]}`,
      cliente: CLIENTES[clienteIdx],
      documento: `NF-e ${String(seq).padStart(5, '0')}`,
      categoria: CATEGORIAS_RECEBER[catIdx],
      centroCusto: CENTROS_CUSTO[ccIdx],
      competencia,
      competenciaIso,
      vencimento: toBR(vencimentoIso),
      vencimentoIso,
      valor,
      status: 'pendente',
    })
  }

  for (let i = 0; i < 12; i++) {
    seq++
    const day = 1 + Math.floor(seed(seq) * 28)
    const vencimentoIso = toIso(YEAR, MONTH, day)
    const fornIdx = seq % FORNECEDORES.length
    const catIdx = seq % CATEGORIAS_PAGAR.length
    const ccIdx = seq % CENTROS_CUSTO.length
    const valor = Math.round((300 + seed(seq) * 9_000) * 100) / 100

    lancamentos.push({
      id: `erp-${seq}`,
      tipo: 'pagar',
      descricao: `Pagamento — ${FORNECEDORES[fornIdx]}`,
      fornecedor: FORNECEDORES[fornIdx],
      documento: seq % 3 === 0 ? `BOL-${seq * 13 + 600}` : undefined,
      categoria: CATEGORIAS_PAGAR[catIdx],
      centroCusto: CENTROS_CUSTO[ccIdx],
      competencia,
      competenciaIso,
      vencimento: toBR(vencimentoIso),
      vencimentoIso,
      valor,
      status: 'pendente',
    })
  }

  return lancamentos
}

export const ERP_LANCAMENTOS: ErpLancamento[] = generate()
