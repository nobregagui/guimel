import { statusEstoque } from '@/features/produtos/data/shared'
import type { Produto, ProdutosTab, ProdutosTableFiltros } from '@/features/produtos/types'

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

export function filterProdutosByTab(produtos: Produto[], tab: ProdutosTab): Produto[] {
  if (tab === 'todos') return produtos
  return produtos.filter((produto) => produto.status === tab)
}

export function filterProdutosByBusca(produtos: Produto[], busca: string): Produto[] {
  const query = normalizeSearch(busca)
  if (!query) return produtos

  return produtos.filter((produto) => {
    const searchable = [
      produto.nome,
      produto.codigo,
      produto.codigoBarras ?? '',
      produto.categoriaNome ?? '',
      produto.ncm,
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
}

export function applyProdutosTableFiltros(
  produtos: Produto[],
  filtros: ProdutosTableFiltros,
): Produto[] {
  return produtos.filter((produto) => {
    if (filtros.categoriaId && produto.categoriaId !== filtros.categoriaId) return false
    if (filtros.tipo !== 'todos' && produto.tipo !== filtros.tipo) return false

    if (filtros.estoque !== 'todos') {
      const estoque = statusEstoque(produto)
      if (estoque !== filtros.estoque) return false
    }

    return true
  })
}

export function countActiveProdutosTableFiltros(filtros: ProdutosTableFiltros): number {
  let count = 0
  if (filtros.categoriaId) count += 1
  if (filtros.tipo !== 'todos') count += 1
  if (filtros.estoque !== 'todos') count += 1
  return count
}

export function hasActiveProdutosTableFiltros(filtros: ProdutosTableFiltros): boolean {
  return countActiveProdutosTableFiltros(filtros) > 0
}

export function getProdutosFiltrados(
  produtos: Produto[],
  tab: ProdutosTab,
  busca: string,
  filtros: ProdutosTableFiltros,
): Produto[] {
  return applyProdutosTableFiltros(filterProdutosByBusca(filterProdutosByTab(produtos, tab), busca), filtros)
}

export function countEstoqueAlerta(produtos: Produto[]): number {
  return produtos.filter((produto) => {
    const estoque = statusEstoque(produto)
    return estoque === 'baixo' || estoque === 'critico'
  }).length
}

export function produtoToFormValues(produto: Produto) {
  return {
    codigo: produto.codigo,
    codigoBarras: produto.codigoBarras ?? '',
    nome: produto.nome,
    descricao: produto.descricao ?? '',
    tipo: produto.tipo,
    status: produto.status,
    categoriaId: produto.categoriaId ?? '',
    unidadeMedida: produto.unidadeMedida,
    precoCusto: produto.precoCusto,
    precoVenda: produto.precoVenda,
    precoPromocional: produto.precoPromocional,
    ncm: produto.ncm,
    cfop: produto.cfop,
    cst: produto.cst,
    origem: produto.origem,
    aliquotaIcms: produto.aliquotaIcms,
    aliquotaPis: produto.aliquotaPis,
    aliquotaCofins: produto.aliquotaCofins,
    estoqueAtual: produto.estoqueAtual,
    estoqueMinimo: produto.estoqueMinimo,
    estoqueMaximo: produto.estoqueMaximo,
    controlaEstoque: produto.controlaEstoque,
  }
}

export function produtoIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}
