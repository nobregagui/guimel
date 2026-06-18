export { ProdutoDrawer } from '@/features/produtos/components/ProdutoDrawer'
export {
  CategoriaChip,
  EstoqueBadge,
  StatusProdutoBadge,
  TipoProdutoBadge,
} from '@/features/produtos/components/ProdutoBadges'

export * from '@/features/produtos/types'
export * from '@/features/produtos/utils'
export {
  CATEGORIAS_MOCK,
  EMPTY_PRODUTO_FORM,
  EMPTY_PRODUTOS_TABLE_FILTROS,
  PRODUTOS_MOCK,
  PRODUTOS_TABS,
  STATUS_PRODUTO_LABEL,
  TIPO_PRODUTO_LABEL,
  UNIDADE_LABEL,
  calcularMargem,
  formatarData,
  formatarMoeda,
  statusEstoque,
} from '@/features/produtos/data/shared'
export { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
