import { api } from '@/services/api'
import type {
  Produto,
  ProdutoArquivoCampo,
  ProdutoArquivoMeta,
  ProdutoFormValues,
} from '@/features/produtos/types'
import { getApiAssetUrl } from '@/utils/apiAssets'

export type CreateProdutoPayload = {
  codigo: string
  codigoBarras?: string | null
  nome: string
  descricao?: string | null
  tipo: Produto['tipo']
  status: Produto['status']
  categoriaId?: string | null
  marcaId?: string | null
  fabricanteId?: string | null
  linhaId?: string | null
  colecaoId?: string | null
  modeloId?: string | null
  fornecedorPrincipalId?: string | null
  unidadeMedida: Produto['unidadeMedida']
  precoCusto: number
  precoVenda: number
  precoPromocional?: number | null
  ncm: string
  cest?: string | null
  cfop: string
  cst: string
  origem: Produto['origem']
  codigoBeneficioFiscal?: string | null
  codigoAnp?: string | null
  aliquotaIcms: number
  aliquotaIpi?: number
  aliquotaPis: number
  aliquotaCofins: number
  aliquotaIss?: number
  aliquotaFcp?: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo?: number | null
  controlaEstoque: boolean
  pesoLiquido?: number | null
  pesoBruto?: number | null
  altura?: number | null
  largura?: number | null
  comprimento?: number | null
  volume?: number | null
  localizacaoEstoque?: string | null
  codigoInterno?: string | null
  prazoMedioCompra?: number | null
  loteEconomico?: number | null
  quantidadeMinimaCompra?: number | null
  garantia?: string | null
  comissao?: number | null
  codigoFabricante?: string | null
  codigoReferencia?: string | null
  ean?: string | null
  gtinTributavel?: string | null
  skuMarketplace?: string | null
  tituloMarketplace?: string | null
  categoriaMarketplace?: string | null
  marcaMarketplace?: string | null
  observacoesInternas?: string | null
  observacoesNotaFiscal?: string | null
  imagemUrl?: string | null
  imagensSecundariasUrls?: string[]
  fichaTecnicaUrl?: string | null
  manualUrl?: string | null
  catalogoUrl?: string | null
}

export type UpdateProdutoPayload = Partial<CreateProdutoPayload>

export type ProdutoArquivoUploadResponse = {
  id: string
  nome: string
  tamanho: number
  tipo: string
  url: string
  campo: ProdutoArquivoCampo
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function generateCodigo(nome: string): string {
  const slug = nome
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)

  return slug || `PROD-${Date.now().toString(36).toUpperCase()}`
}

function existingUrl(meta: ProdutoArquivoMeta | null | undefined): string | null {
  if (!meta) return null
  if (meta.file) return null
  return meta.url ?? meta.previewUrl ?? null
}

export function mapProdutoFormToPayload(values: ProdutoFormValues): CreateProdutoPayload {
  const codigo = trimOptional(values.codigo) ?? generateCodigo(values.nome)

  const imagensSecundariasUrls = values.imagensSecundarias
    .map((item) => existingUrl(item))
    .filter((url): url is string => Boolean(url))

  return {
    codigo,
    codigoBarras: emptyToNull(values.codigoBarras),
    nome: values.nome.trim(),
    descricao: emptyToNull(values.descricao),
    tipo: values.tipo,
    status: values.status,
    categoriaId: emptyToNull(values.categoriaId),
    marcaId: emptyToNull(values.marcaId),
    fabricanteId: emptyToNull(values.fabricanteId),
    linhaId: emptyToNull(values.linhaId),
    colecaoId: emptyToNull(values.colecaoId),
    modeloId: emptyToNull(values.modeloId),
    fornecedorPrincipalId: emptyToNull(values.fornecedorPrincipalId),
    unidadeMedida: values.unidadeMedida,
    precoCusto: values.precoCusto,
    precoVenda: values.precoVenda,
    precoPromocional: values.precoPromocional,
    ncm: values.ncm.trim(),
    cest: emptyToNull(values.cest),
    cfop: values.cfop.trim(),
    cst: values.cst.trim(),
    origem: values.origem,
    codigoBeneficioFiscal: emptyToNull(values.codigoBeneficioFiscal),
    codigoAnp: emptyToNull(values.codigoAnp),
    aliquotaIcms: values.aliquotaIcms,
    aliquotaIpi: values.aliquotaIpi,
    aliquotaPis: values.aliquotaPis,
    aliquotaCofins: values.aliquotaCofins,
    aliquotaIss: values.aliquotaIss,
    aliquotaFcp: values.aliquotaFcp,
    estoqueAtual: values.estoqueAtual,
    estoqueMinimo: values.estoqueMinimo,
    estoqueMaximo: values.estoqueMaximo,
    controlaEstoque: values.controlaEstoque,
    pesoLiquido: values.pesoLiquido,
    pesoBruto: values.pesoBruto,
    altura: values.altura,
    largura: values.largura,
    comprimento: values.comprimento,
    volume: values.volume,
    localizacaoEstoque: emptyToNull(values.localizacaoEstoque),
    codigoInterno: emptyToNull(values.codigoInterno),
    prazoMedioCompra: values.prazoMedioCompra,
    loteEconomico: values.loteEconomico,
    quantidadeMinimaCompra: values.quantidadeMinimaCompra,
    garantia: emptyToNull(values.garantia),
    comissao: values.comissao,
    codigoFabricante: emptyToNull(values.codigoFabricante),
    codigoReferencia: emptyToNull(values.codigoReferencia),
    ean: emptyToNull(values.ean),
    gtinTributavel: emptyToNull(values.gtinTributavel),
    skuMarketplace: emptyToNull(values.skuMarketplace),
    tituloMarketplace: emptyToNull(values.tituloMarketplace),
    categoriaMarketplace: emptyToNull(values.categoriaMarketplace),
    marcaMarketplace: emptyToNull(values.marcaMarketplace),
    observacoesInternas: emptyToNull(values.observacoesInternas),
    observacoesNotaFiscal: emptyToNull(values.observacoesNotaFiscal),
    imagemUrl: existingUrl(values.imagemPrincipal),
    imagensSecundariasUrls,
    fichaTecnicaUrl: existingUrl(values.fichaTecnica),
    manualUrl: existingUrl(values.manual),
    catalogoUrl: existingUrl(values.catalogo),
  }
}

export type PendingProdutoUpload = {
  campo: ProdutoArquivoCampo
  file: File
}

export function collectPendingProdutoUploads(values: ProdutoFormValues): PendingProdutoUpload[] {
  const pending: PendingProdutoUpload[] = []

  if (values.imagemPrincipal?.file) {
    pending.push({ campo: 'imagemUrl', file: values.imagemPrincipal.file })
  }

  for (const item of values.imagensSecundarias) {
    if (item.file) {
      pending.push({ campo: 'imagensSecundariasUrls', file: item.file })
    }
  }

  if (values.fichaTecnica?.file) {
    pending.push({ campo: 'fichaTecnicaUrl', file: values.fichaTecnica.file })
  }

  if (values.manual?.file) {
    pending.push({ campo: 'manualUrl', file: values.manual.file })
  }

  if (values.catalogo?.file) {
    pending.push({ campo: 'catalogoUrl', file: values.catalogo.file })
  }

  return pending
}

export const produtoService = {
  async list(): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>('/produtos')
    return data
  },

  async getById(id: string): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },

  async create(payload: CreateProdutoPayload): Promise<Produto> {
    const { data } = await api.post<Produto>('/produtos', payload)
    return data
  },

  async update(id: string, payload: UpdateProdutoPayload): Promise<Produto> {
    const { data } = await api.patch<Produto>(`/produtos/${id}`, payload)
    return data
  },

  async updateStatus(id: string, status: Produto['status']): Promise<Produto> {
    const { data } = await api.patch<Produto>(`/produtos/${id}/status`, { status })
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/produtos/${id}`)
  },

  async uploadArquivo(
    id: string,
    file: File,
    campo: ProdutoArquivoCampo = 'imagemUrl',
  ): Promise<ProdutoArquivoUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('campo', campo)

    const { data } = await api.post<ProdutoArquivoUploadResponse>(
      `/produtos/${id}/arquivos`,
      formData,
    )

    return {
      ...data,
      url: getApiAssetUrl(data.url) ?? data.url,
    }
  },

  async uploadPendingArquivos(id: string, values: ProdutoFormValues): Promise<void> {
    const pending = collectPendingProdutoUploads(values)
    for (const item of pending) {
      await produtoService.uploadArquivo(id, item.file, item.campo)
    }
  },
}
