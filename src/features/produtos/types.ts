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

export type ProdutoLookupKind =
  | 'categoria'
  | 'marca'
  | 'fabricante'
  | 'linha'
  | 'colecao'
  | 'modelo'
  | 'fornecedor'

export type ProdutoArquivoCampo =
  | 'imagemUrl'
  | 'imagensSecundariasUrls'
  | 'fichaTecnicaUrl'
  | 'manualUrl'
  | 'catalogoUrl'

export interface ProdutoLookupOption {
  id: string
  nome: string
}

export interface ProdutoArquivoMeta {
  id: string
  nome: string
  tamanho: number
  tipo: string
  previewUrl?: string
  url?: string
  file?: File
  campo?: ProdutoArquivoCampo
}

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
  marcaId: string | null
  marcaNome: string | null
  fabricanteId: string | null
  fabricanteNome: string | null
  linhaId: string | null
  linhaNome: string | null
  colecaoId: string | null
  colecaoNome: string | null
  modeloId: string | null
  modeloNome: string | null
  fornecedorPrincipalId: string | null
  fornecedorPrincipalNome: string | null
  unidadeMedida: UnidadeMedida
  precoCusto: number
  precoVenda: number
  margemLucro: number
  precoPromocional: number | null
  ncm: string
  cest: string | null
  cfop: string
  cst: string
  origem: OrigemProduto
  codigoBeneficioFiscal: string | null
  codigoAnp: string | null
  aliquotaIcms: number
  aliquotaIpi: number
  aliquotaPis: number
  aliquotaCofins: number
  aliquotaIss: number
  aliquotaFcp: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number | null
  controlaEstoque: boolean
  pesoLiquido: number | null
  pesoBruto: number | null
  altura: number | null
  largura: number | null
  comprimento: number | null
  volume: number | null
  localizacaoEstoque: string | null
  codigoInterno: string | null
  prazoMedioCompra: number | null
  loteEconomico: number | null
  quantidadeMinimaCompra: number | null
  garantia: string | null
  comissao: number | null
  codigoFabricante: string | null
  codigoReferencia: string | null
  ean: string | null
  gtinTributavel: string | null
  skuMarketplace: string | null
  tituloMarketplace: string | null
  categoriaMarketplace: string | null
  marcaMarketplace: string | null
  observacoesInternas: string | null
  observacoesNotaFiscal: string | null
  imagemUrl: string | null
  imagensSecundariasUrls: string[]
  fichaTecnicaUrl: string | null
  manualUrl: string | null
  catalogoUrl: string | null
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
  marcaId: string
  fabricanteId: string
  linhaId: string
  colecaoId: string
  modeloId: string
  fornecedorPrincipalId: string
  unidadeMedida: UnidadeMedida
  precoCusto: number
  precoVenda: number
  precoPromocional: number | null
  ncm: string
  cest: string
  cfop: string
  cst: string
  origem: OrigemProduto
  codigoBeneficioFiscal: string
  codigoAnp: string
  aliquotaIcms: number
  aliquotaIpi: number
  aliquotaPis: number
  aliquotaCofins: number
  aliquotaIss: number
  aliquotaFcp: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number | null
  controlaEstoque: boolean
  pesoLiquido: number | null
  pesoBruto: number | null
  altura: number | null
  largura: number | null
  comprimento: number | null
  volume: number | null
  localizacaoEstoque: string
  codigoInterno: string
  prazoMedioCompra: number | null
  loteEconomico: number | null
  quantidadeMinimaCompra: number | null
  garantia: string
  comissao: number | null
  codigoFabricante: string
  codigoReferencia: string
  ean: string
  gtinTributavel: string
  skuMarketplace: string
  tituloMarketplace: string
  categoriaMarketplace: string
  marcaMarketplace: string
  observacoesInternas: string
  observacoesNotaFiscal: string
  imagemPrincipal: ProdutoArquivoMeta | null
  imagensSecundarias: ProdutoArquivoMeta[]
  fichaTecnica: ProdutoArquivoMeta | null
  manual: ProdutoArquivoMeta | null
  catalogo: ProdutoArquivoMeta | null
}

export interface ProdutosTableFiltros {
  categoriaId: string
  tipo: 'todos' | TipoProduto
  estoque: EstoqueFiltro
}

export type ProdutoFieldErrorKey = keyof ProdutoFormValues

export type ProdutoFieldErrors = Partial<Record<ProdutoFieldErrorKey, string>>
