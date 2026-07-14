import { useMemo, useState, type ReactNode } from 'react'
import axios from 'axios'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, RefreshCw, Trash2 } from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Loading } from '@/components/ui/Loading'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { useToast } from '@/components/ui/Toast'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import {
  CategoriaChip,
  EstoqueBadge,
  ProdutoDrawer,
  StatusProdutoBadge,
  TipoProdutoBadge,
  formatarData,
  formatarMoeda,
  produtoIniciais,
  produtoToFormValues,
  getProdutoSaveErrorMessage,
  useProdutosStore,
} from '@/features/produtos'
import {
  ORIGEM_LABEL,
  TIPO_PRODUTO_LABEL,
  UNIDADE_LABEL,
} from '@/features/produtos/data/shared'
import {
  useProdutoQuery,
  useRemoveProdutoMutation,
  useUpdateProdutoMutation,
  useUpdateProdutoStatusMutation,
} from '@/features/produtos/hooks/useProdutos'
import { useProdutoLookupsQueries } from '@/features/produtos/hooks/useProdutoLookups'
import { APP_PATHS } from '@/routes/paths'
import { getApiAssetUrl } from '@/utils/apiAssets'
import styles from '@/pages/produtos/ProdutoDetalhePage.module.css'

function display(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  return String(value)
}

function displayPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function Dado({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.dadoItem}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function ArquivoLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <Dado label={label}>
        <span className={styles.muted}>—</span>
      </Dado>
    )
  }

  const resolved = getApiAssetUrl(url) ?? url
  return (
    <Dado label={label}>
      <a href={resolved} target="_blank" rel="noreferrer" className={styles.fileLink}>
        Abrir arquivo
      </a>
    </Dado>
  )
}

export function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inativarOpen, setInativarOpen] = useState(false)
  const [excluirOpen, setExcluirOpen] = useState(false)

  useProdutoLookupsQueries()
  const produtoQuery = useProdutoQuery(id)
  const updateProdutoMutation = useUpdateProdutoMutation()
  const updateStatusMutation = useUpdateProdutoStatusMutation()
  const removeProdutoMutation = useRemoveProdutoMutation()

  const produtoFromStore = useProdutosStore((s) => (id ? s.produtos.find((p) => p.id === id) : undefined))
  const categorias = useProdutosStore((s) => s.categorias)
  const produto = produtoQuery.data ?? produtoFromStore

  const initialValues = useMemo(
    () => (produto ? produtoToFormValues(produto) : undefined),
    [produto],
  )

  const categoria = useMemo(() => {
    if (!produto?.categoriaId) return undefined
    return categorias.find((item) => item.id === produto.categoriaId)
  }, [categorias, produto?.categoriaId])

  if (produtoQuery.isLoading && !produto) {
    return (
      <div className={styles.notFound}>
        <Loading label="Carregando produto..." layout="fullscreen" />
      </div>
    )
  }

  if (produtoQuery.isError && !produto) {
    const status = axios.isAxiosError(produtoQuery.error)
      ? produtoQuery.error.response?.status
      : undefined

    if (status === 403 || status === 404) {
      return <Navigate to={APP_PATHS.forbidden} replace />
    }

    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Erro ao carregar produto</h1>
        <p className={styles.notFoundText}>Não foi possível buscar os dados deste produto.</p>
        <button type="button" className={styles.backLinkStandalone} onClick={() => produtoQuery.refetch()}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Produto não encontrado</h1>
        <p className={styles.notFoundText}>O produto solicitado não existe ou foi removido.</p>
        <Link to={APP_PATHS.produtos} className={styles.backLinkStandalone}>
          Voltar para produtos
        </Link>
      </div>
    )
  }

  const produtoId = produto.id

  async function handleConfirmInativar() {
    try {
      await updateStatusMutation.mutateAsync({ id: produtoId, status: 'inativo' })
      showToast({ message: 'Produto inativado com sucesso.', variant: 'success' })
      setInativarOpen(false)
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível inativar o produto.'),
        variant: 'error',
      })
    }
  }

  async function handleConfirmExcluir() {
    try {
      await removeProdutoMutation.mutateAsync(produtoId)
      showToast({ message: 'Produto excluído com sucesso.', variant: 'success' })
      navigate(APP_PATHS.produtos)
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível excluir o produto.'),
        variant: 'error',
      })
    }
  }

  async function handleReativar() {
    try {
      await updateStatusMutation.mutateAsync({ id: produtoId, status: 'ativo' })
      showToast({ message: 'Produto reativado com sucesso.', variant: 'success' })
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível reativar o produto.'),
        variant: 'error',
      })
    }
  }

  const imageUrl = produto.imagemUrl
    ? getApiAssetUrl(produto.imagemUrl) ?? produto.imagemUrl
    : null

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link to={APP_PATHS.produtos} className={styles.backLink}>
            <ArrowLeft size={14} /> Voltar para produtos
          </Link>

          <div className={styles.headerActions}>
            <PermissionGate permissions={[...MODULE_WRITE_PERMISSIONS.produtos]} requireWrite>
              {produto.status === 'inativo' ? (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => void handleReativar()}
                  disabled={updateStatusMutation.isPending}
                >
                  <RefreshCw size={13} /> Reativar
                </button>
              ) : (
                <>
                  <button type="button" className={styles.btnSecondary} onClick={() => setDrawerOpen(true)}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={() => setInativarOpen(true)}>
                    Inativar
                  </button>
                  <button type="button" className={styles.btnDanger} onClick={() => setExcluirOpen(true)}>
                    <Trash2 size={13} /> Excluir
                  </button>
                </>
              )}
            </PermissionGate>
          </div>
        </div>

        <div className={styles.profileRow}>
          <div className={styles.produtoThumb}>
            {imageUrl ? (
              <img src={imageUrl} alt="" className={styles.produtoThumbImg} />
            ) : (
              produtoIniciais(produto.nome)
            )}
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileTitleRow}>
              <h1 className={styles.pageTitle}>{produto.nome}</h1>
              <StatusProdutoBadge status={produto.status} />
              <TipoProdutoBadge tipo={produto.tipo} />
            </div>
            <p className={styles.profileSubtitle}>
              {produto.codigo}
              {produto.marcaNome ? ` · ${produto.marcaNome}` : ''}
              {produto.codigoBarras ? ` · EAN/Barras ${produto.codigoBarras}` : ''}
            </p>
            <div className={styles.profileMeta}>
              <span>Criado em {formatarData(produto.criadoEm)}</span>
              <span>Atualizado em {formatarData(produto.atualizadoEm)}</span>
              <EstoqueBadge produto={produto} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Dados gerais</h2>
              </div>
              <dl className={styles.dadosGrid}>
                <Dado label="Nome">{produto.nome}</Dado>
                <Dado label="Código / SKU">{display(produto.codigo)}</Dado>
                <Dado label="Tipo">{TIPO_PRODUTO_LABEL[produto.tipo]}</Dado>
                <Dado label="Unidade">{UNIDADE_LABEL[produto.unidadeMedida]}</Dado>
                <Dado label="Código de barras">{display(produto.codigoBarras)}</Dado>
                <Dado label="Código interno">{display(produto.codigoInterno)}</Dado>
                <Dado label="Descrição">
                  <span className={styles.longText}>{display(produto.descricao)}</span>
                </Dado>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Organização</h2>
              </div>
              <dl className={styles.dadosGrid}>
                <Dado label="Categoria">
                  {produto.categoriaNome || categoria ? (
                    <CategoriaChip
                      nome={categoria?.nome ?? produto.categoriaNome ?? '—'}
                      cor={categoria?.cor ?? '#6B7280'}
                    />
                  ) : (
                    '—'
                  )}
                </Dado>
                <Dado label="Marca">{display(produto.marcaNome)}</Dado>
                <Dado label="Fabricante">{display(produto.fabricanteNome)}</Dado>
                <Dado label="Linha">{display(produto.linhaNome)}</Dado>
                <Dado label="Coleção">{display(produto.colecaoNome)}</Dado>
                <Dado label="Modelo">{display(produto.modeloNome)}</Dado>
                <Dado label="Fornecedor principal">{display(produto.fornecedorPrincipalNome)}</Dado>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Fiscal</h2>
              </div>
              <dl className={styles.dadosGrid}>
                <Dado label="NCM">{display(produto.ncm)}</Dado>
                <Dado label="CEST">{display(produto.cest)}</Dado>
                <Dado label="CFOP">{display(produto.cfop)}</Dado>
                <Dado label="CST">{display(produto.cst)}</Dado>
                <Dado label="Origem">{ORIGEM_LABEL[produto.origem]}</Dado>
                <Dado label="Benefício fiscal">{display(produto.codigoBeneficioFiscal)}</Dado>
                <Dado label="Código ANP">{display(produto.codigoAnp)}</Dado>
                <Dado label="Alíquota ICMS">{displayPercent(produto.aliquotaIcms)}</Dado>
                <Dado label="Alíquota IPI">{displayPercent(produto.aliquotaIpi)}</Dado>
                <Dado label="Alíquota PIS">{displayPercent(produto.aliquotaPis)}</Dado>
                <Dado label="Alíquota COFINS">{displayPercent(produto.aliquotaCofins)}</Dado>
                <Dado label="Alíquota ISS">{displayPercent(produto.aliquotaIss)}</Dado>
                <Dado label="Alíquota FCP">{displayPercent(produto.aliquotaFcp)}</Dado>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Complementos</h2>
              </div>
              <dl className={styles.dadosGrid}>
                <Dado label="Garantia">{display(produto.garantia)}</Dado>
                <Dado label="Comissão">{displayPercent(produto.comissao)}</Dado>
                <Dado label="Cód. fabricante">{display(produto.codigoFabricante)}</Dado>
                <Dado label="Cód. referência">{display(produto.codigoReferencia)}</Dado>
                <Dado label="EAN">{display(produto.ean)}</Dado>
                <Dado label="GTIN tributável">{display(produto.gtinTributavel)}</Dado>
                <Dado label="SKU marketplace">{display(produto.skuMarketplace)}</Dado>
                <Dado label="Título marketplace">{display(produto.tituloMarketplace)}</Dado>
                <Dado label="Categoria marketplace">{display(produto.categoriaMarketplace)}</Dado>
                <Dado label="Marca marketplace">{display(produto.marcaMarketplace)}</Dado>
                <Dado label="Observações internas">
                  <span className={styles.longText}>{display(produto.observacoesInternas)}</span>
                </Dado>
                <Dado label="Obs. nota fiscal">
                  <span className={styles.longText}>{display(produto.observacoesNotaFiscal)}</span>
                </Dado>
              </dl>
            </section>
          </div>

          <aside className={styles.sideCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Preços</h2>
              </div>
              <dl className={styles.dadosStack}>
                <Dado label="Preço de custo">{formatarMoeda(produto.precoCusto)}</Dado>
                <Dado label="Preço de venda">
                  <span className={styles.priceHighlight}>{formatarMoeda(produto.precoVenda)}</span>
                </Dado>
                <Dado label="Margem">{displayPercent(produto.margemLucro)}</Dado>
                <Dado label="Preço promocional">
                  {produto.precoPromocional != null ? formatarMoeda(produto.precoPromocional) : '—'}
                </Dado>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Estoque e logística</h2>
              </div>
              <dl className={styles.dadosStack}>
                <Dado label="Controla estoque">{produto.controlaEstoque ? 'Sim' : 'Não'}</Dado>
                <Dado label="Estoque atual">{display(produto.estoqueAtual)}</Dado>
                <Dado label="Estoque mínimo">{display(produto.estoqueMinimo)}</Dado>
                <Dado label="Estoque máximo">{display(produto.estoqueMaximo)}</Dado>
                <Dado label="Localização">{display(produto.localizacaoEstoque)}</Dado>
                <Dado label="Peso líquido">{produto.pesoLiquido != null ? `${produto.pesoLiquido} kg` : '—'}</Dado>
                <Dado label="Peso bruto">{produto.pesoBruto != null ? `${produto.pesoBruto} kg` : '—'}</Dado>
                <Dado label="Dimensões (A×L×C)">
                  {produto.altura != null || produto.largura != null || produto.comprimento != null
                    ? `${display(produto.altura)} × ${display(produto.largura)} × ${display(produto.comprimento)} cm`
                    : '—'}
                </Dado>
                <Dado label="Volume">{produto.volume != null ? `${produto.volume}` : '—'}</Dado>
                <Dado label="Prazo médio compra">
                  {produto.prazoMedioCompra != null ? `${produto.prazoMedioCompra} dias` : '—'}
                </Dado>
                <Dado label="Lote econômico">{display(produto.loteEconomico)}</Dado>
                <Dado label="Qtd. mínima compra">{display(produto.quantidadeMinimaCompra)}</Dado>
              </dl>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Arquivos</h2>
              </div>
              <dl className={styles.dadosStack}>
                <ArquivoLink label="Imagem principal" url={produto.imagemUrl} />
                <ArquivoLink label="Ficha técnica" url={produto.fichaTecnicaUrl} />
                <ArquivoLink label="Manual" url={produto.manualUrl} />
                <ArquivoLink label="Catálogo" url={produto.catalogoUrl} />
                <Dado label="Imagens secundárias">
                  {produto.imagensSecundariasUrls.length > 0 ? (
                    <ul className={styles.secondaryList}>
                      {produto.imagensSecundariasUrls.map((url) => {
                        const resolved = getApiAssetUrl(url) ?? url
                        return (
                          <li key={url}>
                            <a href={resolved} target="_blank" rel="noreferrer" className={styles.fileLink}>
                              Ver imagem
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    '—'
                  )}
                </Dado>
              </dl>
            </section>
          </aside>
        </div>
      </div>

      <ProdutoDrawer
        open={drawerOpen}
        mode="edit"
        initialValues={initialValues}
        isSaving={updateProdutoMutation.isPending}
        onClose={() => {
          if (!updateProdutoMutation.isPending) setDrawerOpen(false)
        }}
        onSubmit={async (values) => {
          try {
            await updateProdutoMutation.mutateAsync({ id: produto.id, values })
            showToast({ message: 'Produto atualizado com sucesso.', variant: 'success' })
            setDrawerOpen(false)
          } catch (error) {
            showToast({
              message: getProdutoSaveErrorMessage(error, 'Erro ao atualizar produto'),
              variant: 'error',
            })
            throw error
          }
        }}
      />

      <ConfirmModal
        open={inativarOpen}
        title="Inativar produto"
        description={`Tem certeza que deseja inativar “${produto.nome}”? Você poderá reativá-lo depois.`}
        variant="warning"
        confirmLabel="Inativar"
        confirmingLabel="Inativando..."
        isConfirming={updateStatusMutation.isPending}
        onClose={() => {
          if (!updateStatusMutation.isPending) setInativarOpen(false)
        }}
        onConfirm={() => void handleConfirmInativar()}
      />

      <ConfirmModal
        open={excluirOpen}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir permanentemente “${produto.nome}”? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isConfirming={removeProdutoMutation.isPending}
        onClose={() => {
          if (!removeProdutoMutation.isPending) setExcluirOpen(false)
        }}
        onConfirm={() => void handleConfirmExcluir()}
      />
    </div>
  )
}
