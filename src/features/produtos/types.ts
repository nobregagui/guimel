export type StatusProduto = 'ativo' | 'inativo' | 'rascunho'

export type TipoProduto = 'produto' | 'servico' | 'kit'

export type UnidadeMedida =
  | 'un'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'm'
  | 'm2'
  | 'm3'
  | 'cx'
  | 'pc'
  | 'hr'

export type OrigemProduto = '0' | '1' | '2'

export type ProdutosTab = 'todos' | StatusProduto

export type EstoqueFiltro = 'todos' | 'ok' | 'baixo' | 'critico' | 'sem_controle'

export interface Produto {
  id: string
  codigo: string
  codigoBarras: string | null
  nome: string
  descricao: string | null
  tipo: TipoProduto
  status: StatusProduto
  categoriaId: string | null
  categoriaNome: string | null
  unidadeMedida: UnidadeMedida
  precoCusto: number
  precoVenda: number
  margemLucro: number
  precoPromocional: number | null
  ncm: string
  cfop: string
  cst: string
  origem: OrigemProduto
  aliquotaIcms: number
  aliquotaPis: number
  aliquotaCofins: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number | null
  controlaEstoque: boolean
  imagemUrl: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface Categoria {
  id: string
  nome: string
  cor: string
}

export interface ProdutoFormValues {
  codigo: string
  codigoBarras: string
  nome: string
  descricao: string
  tipo: TipoProduto
  status: StatusProduto
  categoriaId: string
  unidadeMedida: UnidadeMedida
  precoCusto: number
  precoVenda: number
  precoPromocional: number | null
  ncm: string
  cfop: string
  cst: string
  origem: OrigemProduto
  aliquotaIcms: number
  aliquotaPis: number
  aliquotaCofins: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number | null
  controlaEstoque: boolean
}

export interface ProdutosTableFiltros {
  categoriaId: string
  tipo: 'todos' | TipoProduto
  estoque: EstoqueFiltro
}
