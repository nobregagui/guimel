import type {
  Categoria,
  OrigemProduto,
  Produto,
  ProdutoFormValues,
  StatusProduto,
  TipoProduto,
  UnidadeMedida,
} from '@/features/produtos/types'

export const STATUS_PRODUTO_LABEL: Record<StatusProduto, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  rascunho: 'Rascunho',
}

export const TIPO_PRODUTO_LABEL: Record<TipoProduto, string> = {
  produto: 'Produto',
  servico: 'Serviço',
  kit: 'Kit',
}

export const UNIDADE_LABEL: Record<UnidadeMedida, string> = {
  un: 'Unidade',
  kg: 'Quilograma',
  g: 'Grama',
  l: 'Litro',
  ml: 'Mililitro',
  m: 'Metro',
  m2: 'Metro²',
  m3: 'Metro³',
  cx: 'Caixa',
  pc: 'Peça',
  hr: 'Hora',
}

export const ORIGEM_LABEL: Record<OrigemProduto, string> = {
  '0': '0 – Nacional',
  '1': '1 – Estrangeira (importação direta)',
  '2': '2 – Estrangeira (mercado interno)',
}

export const PRODUTOS_TABS = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'ativo' as const, label: 'Ativos' },
  { id: 'inativo' as const, label: 'Inativos' },
  { id: 'rascunho' as const, label: 'Rascunhos' },
]

export const EMPTY_PRODUTOS_TABLE_FILTROS = {
  categoriaId: '',
  tipo: 'todos' as const,
  estoque: 'todos' as const,
}

export const EMPTY_PRODUTO_FORM: ProdutoFormValues = {
  codigo: '',
  codigoBarras: '',
  nome: '',
  descricao: '',
  tipo: 'produto',
  status: 'ativo',
  categoriaId: '',
  marcaId: '',
  fabricanteId: '',
  linhaId: '',
  colecaoId: '',
  modeloId: '',
  fornecedorPrincipalId: '',
  unidadeMedida: 'un',
  precoCusto: 0,
  precoVenda: 0,
  precoPromocional: null,
  ncm: '',
  cest: '',
  cfop: '5102',
  cst: '000',
  origem: '0',
  codigoBeneficioFiscal: '',
  codigoAnp: '',
  aliquotaIcms: 12,
  aliquotaIpi: 0,
  aliquotaPis: 0.65,
  aliquotaCofins: 3,
  aliquotaIss: 0,
  aliquotaFcp: 0,
  estoqueAtual: 0,
  estoqueMinimo: 0,
  estoqueMaximo: null,
  controlaEstoque: true,
  pesoLiquido: null,
  pesoBruto: null,
  altura: null,
  largura: null,
  comprimento: null,
  volume: null,
  localizacaoEstoque: '',
  codigoInterno: '',
  prazoMedioCompra: null,
  loteEconomico: null,
  quantidadeMinimaCompra: null,
  garantia: '',
  comissao: null,
  codigoFabricante: '',
  codigoReferencia: '',
  ean: '',
  gtinTributavel: '',
  skuMarketplace: '',
  tituloMarketplace: '',
  categoriaMarketplace: '',
  marcaMarketplace: '',
  observacoesInternas: '',
  observacoesNotaFiscal: '',
  imagemPrincipal: null,
  imagensSecundarias: [],
  fichaTecnica: null,
  manual: null,
  catalogo: null,
}

export function calcularMargem(precoCusto: number, precoVenda: number): number {
  if (precoVenda === 0) return 0
  return ((precoVenda - precoCusto) / precoVenda) * 100
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function formatarData(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR')
}

export function statusEstoque(produto: Produto): 'ok' | 'baixo' | 'critico' | 'sem_controle' {
  if (!produto.controlaEstoque) return 'sem_controle'
  if (produto.estoqueAtual <= 0) return 'critico'
  if (produto.estoqueAtual <= produto.estoqueMinimo) return 'baixo'
  return 'ok'
}

/** Categorias vêm da API; mock mantido apenas como fallback legado. */
export const CATEGORIAS_MOCK: Categoria[] = []

/** Produtos vêm da API. */
export const PRODUTOS_MOCK: Produto[] = []
