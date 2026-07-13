import axios from 'axios'

import { EMPTY_PRODUTO_FORM, statusEstoque } from '@/features/produtos/data/shared'
import type {
  Produto,
  ProdutoArquivoMeta,
  ProdutoFormValues,
  ProdutosTab,
  ProdutosTableFiltros,
} from '@/features/produtos/types'
import { getApiAssetUrl } from '@/utils/apiAssets'

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

export function filterProdutosByTab(produtos: Produto[], tab: ProdutosTab): Produto[] {
  if (tab === 'todos') return produtos
  return produtos.filter((produto) => produto.status === tab)
}

export function findProdutoByNome(produtos: Produto[], nome: string): Produto | undefined {
  const termo = normalizeSearch(nome)
  if (termo.length < 2) return undefined

  return produtos.find((produto) => normalizeSearch(produto.nome) === termo)
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
      produto.marcaNome ?? '',
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

function urlToArquivoMeta(
  url: string | null | undefined,
  nome: string,
  tipo = 'application/octet-stream',
): ProdutoArquivoMeta | null {
  if (!url) return null
  const absolute = getApiAssetUrl(url) ?? url
  return {
    id: absolute,
    nome,
    tamanho: 0,
    tipo,
    previewUrl: absolute,
    url: absolute,
  }
}

export function produtoToFormValues(produto: Produto): ProdutoFormValues {
  return {
    ...EMPTY_PRODUTO_FORM,
    codigo: produto.codigo,
    codigoBarras: produto.codigoBarras ?? '',
    nome: produto.nome,
    descricao: produto.descricao ?? '',
    tipo: produto.tipo,
    status: produto.status,
    categoriaId: produto.categoriaId ?? '',
    marcaId: produto.marcaId ?? '',
    fabricanteId: produto.fabricanteId ?? '',
    linhaId: produto.linhaId ?? '',
    colecaoId: produto.colecaoId ?? '',
    modeloId: produto.modeloId ?? '',
    fornecedorPrincipalId: produto.fornecedorPrincipalId ?? '',
    unidadeMedida: produto.unidadeMedida,
    precoCusto: produto.precoCusto,
    precoVenda: produto.precoVenda,
    precoPromocional: produto.precoPromocional,
    ncm: produto.ncm ?? '',
    cest: produto.cest ?? '',
    cfop: produto.cfop,
    cst: produto.cst,
    origem: produto.origem,
    codigoBeneficioFiscal: produto.codigoBeneficioFiscal ?? '',
    codigoAnp: produto.codigoAnp ?? '',
    aliquotaIcms: produto.aliquotaIcms,
    aliquotaIpi: produto.aliquotaIpi ?? 0,
    aliquotaPis: produto.aliquotaPis,
    aliquotaCofins: produto.aliquotaCofins,
    aliquotaIss: produto.aliquotaIss ?? 0,
    aliquotaFcp: produto.aliquotaFcp ?? 0,
    estoqueAtual: produto.estoqueAtual,
    estoqueMinimo: produto.estoqueMinimo,
    estoqueMaximo: produto.estoqueMaximo,
    controlaEstoque: produto.controlaEstoque,
    pesoLiquido: produto.pesoLiquido,
    pesoBruto: produto.pesoBruto,
    altura: produto.altura,
    largura: produto.largura,
    comprimento: produto.comprimento,
    volume: produto.volume,
    localizacaoEstoque: produto.localizacaoEstoque ?? '',
    codigoInterno: produto.codigoInterno ?? '',
    prazoMedioCompra: produto.prazoMedioCompra,
    loteEconomico: produto.loteEconomico,
    quantidadeMinimaCompra: produto.quantidadeMinimaCompra,
    garantia: produto.garantia ?? '',
    comissao: produto.comissao,
    codigoFabricante: produto.codigoFabricante ?? '',
    codigoReferencia: produto.codigoReferencia ?? '',
    ean: produto.ean ?? '',
    gtinTributavel: produto.gtinTributavel ?? '',
    skuMarketplace: produto.skuMarketplace ?? '',
    tituloMarketplace: produto.tituloMarketplace ?? '',
    categoriaMarketplace: produto.categoriaMarketplace ?? '',
    marcaMarketplace: produto.marcaMarketplace ?? '',
    observacoesInternas: produto.observacoesInternas ?? '',
    observacoesNotaFiscal: produto.observacoesNotaFiscal ?? '',
    imagemPrincipal: urlToArquivoMeta(produto.imagemUrl, 'Imagem principal', 'image/*'),
    imagensSecundarias: (produto.imagensSecundariasUrls ?? []).map((url, index) => ({
      id: `${url}-${index}`,
      nome: `Imagem ${index + 1}`,
      tamanho: 0,
      tipo: 'image/*',
      previewUrl: getApiAssetUrl(url) ?? url,
      url: getApiAssetUrl(url) ?? url,
    })),
    fichaTecnica: urlToArquivoMeta(produto.fichaTecnicaUrl, 'Ficha técnica', 'application/pdf'),
    manual: urlToArquivoMeta(produto.manualUrl, 'Manual'),
    catalogo: urlToArquivoMeta(produto.catalogoUrl, 'Catálogo'),
  }
}

export function produtoIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function getProdutoSaveErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const status = error.response?.status
  const message = error.response?.data?.message

  if (status === 409) {
    return typeof message === 'string' ? message : 'Código ou registro já cadastrado'
  }

  if (status === 400 && Array.isArray(message)) {
    return message.join(', ')
  }

  if (status === 400 && typeof message === 'string') {
    return message
  }

  if (status === 404) {
    return typeof message === 'string' ? message : 'Registro não encontrado'
  }

  return fallback
}
