export { ProdutoDrawer } from '@/features/produtos/components/ProdutoDrawer'
export { ProdutoActionMenu } from '@/features/produtos/components/ProdutoActionMenu'
export { ProdutosQueryFeedback } from '@/features/produtos/components/ProdutosQueryFeedback'
export { SearchableSelect } from '@/features/produtos/components/SearchableSelect'
export { ProdutoFileUpload } from '@/features/produtos/components/ProdutoFileUpload'
export {
  CategoriaChip,
  EstoqueBadge,
  StatusProdutoBadge,
  TipoProdutoBadge,
} from '@/features/produtos/components/ProdutoBadges'

export * from '@/features/produtos/types'
export * from '@/features/produtos/utils'
export {
  calcProdutoProgresso,
  isProdutoFormValid,
  validateProdutoField,
  validateProdutoForm,
} from '@/features/produtos/utils/produtoFormValidation'
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
export { useProdutoLookupsStore } from '@/features/produtos/store/useProdutoLookupsStore'
export {
  useProdutosQuery,
  useCategoriasQuery,
  useProdutoQuery,
  useCreateProdutoMutation,
  useUpdateProdutoMutation,
  useRemoveProdutoMutation,
  useUpdateProdutoStatusMutation,
  useCreateCategoriaMutation,
} from '@/features/produtos/hooks/useProdutos'
export {
  useProdutoLookupsQueries,
  useMarcasQuery,
  useFabricantesQuery,
  useLinhasQuery,
  useColecoesQuery,
  useModelosQuery,
  useFornecedoresQuery,
  useCreateLookupMutation,
} from '@/features/produtos/hooks/useProdutoLookups'
