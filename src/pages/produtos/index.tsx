import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Download,
  Filter,
  Package,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import {
  CategoriaChip,
  EstoqueBadge,
  ProdutoDrawer,
  ProdutosQueryFeedback,
  PRODUTOS_TABS,
  StatusProdutoBadge,
  TipoProdutoBadge,
  EMPTY_PRODUTOS_TABLE_FILTROS,
  TIPO_PRODUTO_LABEL,
  formatarMoeda,
  useProdutosStore,
  countActiveProdutosTableFiltros,
  countEstoqueAlerta,
  getProdutosFiltrados,
  hasActiveProdutosTableFiltros,
  produtoIniciais,
  produtoToFormValues,
  getProdutoSaveErrorMessage,
  type Produto,
  type ProdutosTab,
  type ProdutosTableFiltros,
} from '@/features/produtos'
import { ProdutoActionMenu } from '@/features/produtos/components/ProdutoActionMenu'
import {
  useCategoriasQuery,
  useCreateProdutoMutation,
  useProdutosQuery,
  useRemoveProdutoMutation,
  useUpdateProdutoMutation,
  useUpdateProdutoStatusMutation,
} from '@/features/produtos/hooks/useProdutos'
import { useProdutoLookupsQueries } from '@/features/produtos/hooks/useProdutoLookups'
import { usePermissions } from '@/hooks/usePermissions'
import { APP_PATHS } from '@/routes/paths'
import { getApiAssetUrl } from '@/utils/apiAssets'
import styles from '@/pages/produtos/ProdutosPage.module.css'

export function ProdutosPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { canWriteModule, isReadOnly } = usePermissions()
  const canWrite = canWriteModule([...MODULE_WRITE_PERMISSIONS.produtos]) && !isReadOnly

  const produtosQuery = useProdutosQuery()
  const categoriasQuery = useCategoriasQuery()
  const lookupsQuery = useProdutoLookupsQueries()
  const createProdutoMutation = useCreateProdutoMutation()
  const updateProdutoMutation = useUpdateProdutoMutation()
  const updateStatusMutation = useUpdateProdutoStatusMutation()
  const removeProdutoMutation = useRemoveProdutoMutation()

  const produtos = useProdutosStore((s) => s.produtos)
  const categorias = useProdutosStore((s) => s.categorias)

  const [tab, setTab] = useState<ProdutosTab>('todos')
  const [busca, setBusca] = useState('')
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [tableFiltros, setTableFiltros] = useState<ProdutosTableFiltros>(EMPTY_PRODUTOS_TABLE_FILTROS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [produtoParaInativar, setProdutoParaInativar] = useState<Produto | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)

  const isLoading = produtosQuery.isLoading || categoriasQuery.isLoading || lookupsQuery.isLoading
  const isError = produtosQuery.isError || categoriasQuery.isError || lookupsQuery.isError
  const isSaving = createProdutoMutation.isPending || updateProdutoMutation.isPending

  const produtosBase = useMemo(
    () => getProdutosFiltrados(produtos, tab, busca, EMPTY_PRODUTOS_TABLE_FILTROS),
    [produtos, tab, busca],
  )

  const produtosFiltrados = useMemo(
    () => getProdutosFiltrados(produtos, tab, busca, tableFiltros),
    [produtos, tab, busca, tableFiltros],
  )

  const activeFilters = countActiveProdutosTableFiltros(tableFiltros)

  const kpi = useMemo(() => {
    const ativos = produtos.filter((p) => p.status === 'ativo').length
    const rascunhos = produtos.filter((p) => p.status === 'rascunho').length
    const alertaEstoque = countEstoqueAlerta(produtos.filter((p) => p.status === 'ativo'))
    return { total: produtos.length, ativos, rascunhos, alertaEstoque }
  }, [produtos])

  const drawerInitialValues = useMemo(
    () => (produtoEditando ? produtoToFormValues(produtoEditando) : undefined),
    [produtoEditando],
  )

  function handleOpenCreate() {
    setProdutoEditando(null)
    setDrawerOpen(true)
  }

  function handleOpenEdit(produto: Produto) {
    setProdutoEditando(produto)
    setDrawerOpen(true)
  }

  function handleCloseDrawer() {
    if (isSaving) return
    setDrawerOpen(false)
    setProdutoEditando(null)
  }

  function handleClearFiltros() {
    setTableFiltros(EMPTY_PRODUTOS_TABLE_FILTROS)
  }

  function handleRetry() {
    void produtosQuery.refetch()
    void categoriasQuery.refetch()
    lookupsQuery.refetchAll()
  }

  function handleOpenDetalhe(produtoId: string) {
    navigate(`${APP_PATHS.produtos}/${produtoId}`)
  }

  async function handleConfirmInativar() {
    if (!produtoParaInativar) return
    try {
      await updateStatusMutation.mutateAsync({ id: produtoParaInativar.id, status: 'inativo' })
      showToast({ message: 'Produto inativado com sucesso.', variant: 'success' })
      setProdutoParaInativar(null)
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível inativar o produto.'),
        variant: 'error',
      })
    }
  }

  async function handleConfirmExcluir() {
    if (!produtoParaExcluir) return
    try {
      await removeProdutoMutation.mutateAsync(produtoParaExcluir.id)
      showToast({ message: 'Produto excluído com sucesso.', variant: 'success' })
      setProdutoParaExcluir(null)
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível excluir o produto.'),
        variant: 'error',
      })
    }
  }

  async function handleReativar(produto: Produto) {
    try {
      await updateStatusMutation.mutateAsync({ id: produto.id, status: 'ativo' })
      showToast({ message: 'Produto reativado com sucesso.', variant: 'success' })
    } catch (error) {
      showToast({
        message: getProdutoSaveErrorMessage(error, 'Não foi possível reativar o produto.'),
        variant: 'error',
      })
    }
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Produtos</h1>

          <div className={styles.headerActions}>
            <div className={styles.searchField}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Buscar por nome, SKU ou NCM…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar produtos"
              />
            </div>

            <button type="button" className={styles.btnSecondary}>
              <Download size={13} /> Exportar
            </button>

            <PermissionGate permissions={[...MODULE_WRITE_PERMISSIONS.produtos]} requireWrite>
              <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
                <Plus size={13} /> Novo produto
              </button>
            </PermissionGate>
          </div>
        </div>

        <nav className={styles.tabs} aria-label="Filtros por status">
          {PRODUTOS_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.body}>
        <ProdutosQueryFeedback isLoading={isLoading} isError={isError} onRetry={handleRetry}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}><Package size={13} /> Total de produtos</p>
              <p className={styles.kpiValue}>{kpi.total}</p>
              <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>Catálogo completo</p>
              <div className={styles.kpiProgressTrack}>
                <div className={styles.kpiProgressFill} style={{ width: '72%' }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}><Package size={13} /> Ativos</p>
              <p className={styles.kpiValue}>{kpi.ativos}</p>
              <p className={`${styles.kpiTrend} ${styles.trendUp}`}>
                {kpi.total ? Math.round((kpi.ativos / kpi.total) * 100) : 0}% do catálogo
              </p>
              <div className={styles.kpiProgressTrack}>
                <div className={styles.kpiProgressFill} style={{ width: `${kpi.total ? (kpi.ativos / kpi.total) * 100 : 0}%` }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}><AlertTriangle size={13} /> Estoque em alerta</p>
              <p className={styles.kpiValue}>{kpi.alertaEstoque}</p>
              <p className={`${styles.kpiTrend} ${styles.colorOrange}`}>Baixo ou crítico</p>
              <div className={styles.kpiProgressTrack}>
                <div className={styles.kpiProgressFill} style={{ width: `${kpi.ativos ? Math.min((kpi.alertaEstoque / kpi.ativos) * 100, 100) : 0}%` }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <p className={styles.kpiLabel}><Package size={13} /> Rascunhos</p>
              <p className={styles.kpiValue}>{kpi.rascunhos}</p>
              <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>Aguardando publicação</p>
              <div className={styles.kpiProgressTrack}>
                <div className={styles.kpiProgressFill} style={{ width: `${kpi.total ? (kpi.rascunhos / kpi.total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <section className={styles.tableSection}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarLeft}>
                <p className={styles.tableToolbarTitle}>Catálogo de produtos</p>
                <p className={styles.tableToolbarSub}>
                  {hasActiveProdutosTableFiltros(tableFiltros)
                    ? `${produtosFiltrados.length} de ${produtosBase.length} produtos`
                    : `${produtosFiltrados.length} produtos`}
                </p>
              </div>

              <div className={styles.tableToolbarRight}>
                <button
                  type="button"
                  className={`${styles.btnSecondary} ${filtrosOpen ? styles.btnSecondaryActive : ''}`}
                  onClick={() => setFiltrosOpen((current) => !current)}
                >
                  <Filter size={13} />
                  Filtros{activeFilters > 0 ? ` (${activeFilters})` : ''}
                </button>
              </div>
            </div>

            {filtrosOpen ? (
              <div className={styles.tableFiltersPanel}>
                <div className={styles.tableFiltersHeader}>
                  <p className={styles.tableFiltersTitle}>Filtrar produtos</p>
                  {activeFilters > 0 ? (
                    <button type="button" className={styles.tableFiltersClear} onClick={handleClearFiltros}>
                      Limpar filtros
                    </button>
                  ) : null}
                </div>

                <div className={styles.tableFiltersGrid}>
                  <div className={styles.tableFilterGroup}>
                    <span className={styles.tableFilterLabel}>Categoria</span>
                    <select
                      className={styles.tableFilterSelect}
                      value={tableFiltros.categoriaId}
                      onChange={(e) => setTableFiltros((current) => ({ ...current, categoriaId: e.target.value }))}
                    >
                      <option value="">Todas</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.tableFilterGroup}>
                    <span className={styles.tableFilterLabel}>Tipo</span>
                    <select
                      className={styles.tableFilterSelect}
                      value={tableFiltros.tipo}
                      onChange={(e) =>
                        setTableFiltros((current) => ({
                          ...current,
                          tipo: e.target.value as ProdutosTableFiltros['tipo'],
                        }))
                      }
                    >
                      <option value="todos">Todos</option>
                      {Object.entries(TIPO_PRODUTO_LABEL).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.tableFilterGroup}>
                    <span className={styles.tableFilterLabel}>Estoque</span>
                    <select
                      className={styles.tableFilterSelect}
                      value={tableFiltros.estoque}
                      onChange={(e) =>
                        setTableFiltros((current) => ({
                          ...current,
                          estoque: e.target.value as ProdutosTableFiltros['estoque'],
                        }))
                      }
                    >
                      <option value="todos">Todos</option>
                      <option value="ok">Normal</option>
                      <option value="baixo">Baixo</option>
                      <option value="critico">Crítico</option>
                      <option value="sem_controle">Sem controle</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.tableFiltersClose}
                  onClick={() => setFiltrosOpen(false)}
                  aria-label="Fechar filtros"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            {produtosFiltrados.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th className={styles.thRight}>Preço</th>
                    <th>Estoque</th>
                    <th className={styles.thCenter}>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => {
                    const categoria = categorias.find((c) => c.id === produto.categoriaId)
                    const categoriaNome = categoria?.nome ?? produto.categoriaNome
                    const categoriaCor = categoria?.cor ?? '#6B7280'
                    const menuItems =
                      canWrite && produto.status === 'inativo'
                        ? [
                            {
                              id: 'reativar',
                              label: 'Reativar',
                              onClick: () => void handleReativar(produto),
                            },
                          ]
                        : canWrite
                          ? [
                              {
                                id: 'editar',
                                label: 'Editar',
                                onClick: () => handleOpenEdit(produto),
                              },
                              {
                                id: 'inativar',
                                label: 'Inativar',
                                onClick: () => setProdutoParaInativar(produto),
                              },
                              {
                                id: 'excluir',
                                label: 'Excluir',
                                danger: true,
                                onClick: () => setProdutoParaExcluir(produto),
                              },
                            ]
                          : []

                    return (
                      <tr
                        key={produto.id}
                        tabIndex={0}
                        onClick={() => handleOpenDetalhe(produto.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleOpenDetalhe(produto.id)
                          }
                        }}
                      >
                        <td>
                          <div className={styles.produtoCell}>
                            <div className={styles.produtoThumb}>
                              {produto.imagemUrl ? (
                                <img
                                  src={getApiAssetUrl(produto.imagemUrl) ?? produto.imagemUrl}
                                  alt=""
                                  className={styles.produtoThumbImg}
                                />
                              ) : (
                                produtoIniciais(produto.nome)
                              )}
                            </div>
                            <div>
                              <p className={styles.cellNome}>{produto.nome}</p>
                              <p className={styles.cellSub}>
                                {produto.codigo}
                                {produto.marcaNome ? ` · ${produto.marcaNome}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {categoriaNome ? (
                            <CategoriaChip nome={categoriaNome} cor={categoriaCor} />
                          ) : (
                            <span className={styles.cellMuted}>—</span>
                          )}
                        </td>
                        <td><TipoProdutoBadge tipo={produto.tipo} /></td>
                        <td>
                          {produto.precoPromocional ? (
                            <>
                              <span className={styles.cellValorSec}>{formatarMoeda(produto.precoVenda)}</span>
                              <span className={styles.cellValorPromo}>{formatarMoeda(produto.precoPromocional)}</span>
                            </>
                          ) : (
                            <span className={styles.cellValorPos}>{formatarMoeda(produto.precoVenda)}</span>
                          )}
                        </td>
                        <td><EstoqueBadge produto={produto} /></td>
                        <td className={styles.cellStatusCenter}>
                          <StatusProdutoBadge status={produto.status} />
                        </td>
                        <td>
                          {menuItems.length > 0 ? (
                            <ProdutoActionMenu
                              ariaLabel={`Ações de ${produto.nome}`}
                              items={menuItems}
                            />
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>Nenhum produto encontrado para os filtros selecionados.</p>
            )}

            <div className={styles.tableFooter}>
              <span className={styles.tableFooterInfo}>
                {hasActiveProdutosTableFiltros(tableFiltros)
                  ? `Mostrando ${produtosFiltrados.length} de ${produtosBase.length} produtos`
                  : `Mostrando ${produtosFiltrados.length} produtos`}
              </span>
            </div>
          </section>
        </ProdutosQueryFeedback>
      </div>

      <ProdutoDrawer
        open={drawerOpen}
        mode={produtoEditando ? 'edit' : 'create'}
        initialValues={drawerInitialValues}
        isSaving={isSaving}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (produtoEditando) {
              await updateProdutoMutation.mutateAsync({ id: produtoEditando.id, values })
              showToast({ message: 'Produto atualizado com sucesso.', variant: 'success' })
            } else {
              const produto = await createProdutoMutation.mutateAsync(values)
              showToast({
                message: `Produto "${produto.nome}" cadastrado com sucesso.`,
                variant: 'success',
              })
            }
            setDrawerOpen(false)
            setProdutoEditando(null)
          } catch (error) {
            showToast({
              message: getProdutoSaveErrorMessage(
                error,
                produtoEditando ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto',
              ),
              variant: 'error',
            })
            throw error
          }
        }}
      />

      <ConfirmModal
        open={Boolean(produtoParaInativar)}
        title="Inativar produto"
        description={
          produtoParaInativar
            ? `Tem certeza que deseja inativar “${produtoParaInativar.nome}”? Você poderá reativá-lo depois.`
            : ''
        }
        variant="warning"
        confirmLabel="Inativar"
        confirmingLabel="Inativando..."
        isConfirming={updateStatusMutation.isPending}
        onClose={() => {
          if (!updateStatusMutation.isPending) setProdutoParaInativar(null)
        }}
        onConfirm={() => void handleConfirmInativar()}
      />

      <ConfirmModal
        open={Boolean(produtoParaExcluir)}
        title="Excluir produto"
        description={
          produtoParaExcluir
            ? `Tem certeza que deseja excluir permanentemente “${produtoParaExcluir.nome}”? Esta ação não pode ser desfeita.`
            : ''
        }
        variant="danger"
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isConfirming={removeProdutoMutation.isPending}
        onClose={() => {
          if (!removeProdutoMutation.isPending) setProdutoParaExcluir(null)
        }}
        onConfirm={() => void handleConfirmExcluir()}
      />
    </div>
  )
}
