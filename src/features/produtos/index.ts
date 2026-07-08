export { ProdutoDrawer } from '@/features/produtos/components/ProdutoDrawer'
export { ProdutosQueryFeedback } from '@/features/produtos/components/ProdutosQueryFeedback'
export {
  CategoriaChip,
  EstoqueBadge,
  StatusProdutoBadge,
  TipoProdutoBadge,
} from '@/features/produtos/components/ProdutoBadges'

export * from '@/features/produtos/types'
export * from '@/features/produtos/utils'
export {
  EMPTY_PRODUTO_FORM,
  EMPTY_PRODUTOS_TABLE_FILTROS,
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
export {
  useProdutosQuery,
  useCategoriasQuery,
  useProdutoQuery,
  useCreateProdutoMutation,
  useUpdateProdutoMutation,
  useRemoveProdutoMutation,
} from '@/features/produtos/hooks/useProdutos'
