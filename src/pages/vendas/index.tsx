import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useToast } from '@/components/ui/Toast'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import { PedidoDrawer } from '@/features/vendas/components/PedidoDrawer'
import { usePermissions } from '@/hooks/usePermissions'
import { canFilterVendasByVendedor } from '@/utils/financePermissions'
import { VendasQueryFeedback } from '@/features/vendas/components/VendasQueryFeedback'
import {
  FORMA_PAGAMENTO_LABEL,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_ORDEM,
  formatarData,
  formatarMoeda,
} from '@/features/vendas/data/shared'
import {
  useConfirmarPedidoMutation,
  useCreatePedidoMutation,
  usePedidosQuery,
} from '@/features/vendas/hooks/useVendas'
import { useVendasStore } from '@/features/vendas/store/useVendasStore'
import type { PedidoFormValues, StatusPedido } from '@/features/vendas/types'
import { getPedidoActionErrorMessage, getPedidoSaveErrorMessage } from '@/features/vendas/utils'
import { getBuscaFromState } from '@/routes/navigationState'
import styles from '@/pages/vendas/VendasPage.module.css'

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function StatusBadge({ status }: { status: StatusPedido }) {
  const cls: Record<StatusPedido, string> = {
    orcamento: styles.badgeOrcamento,
    confirmado: styles.badgeConfirmado,
    faturado: styles.badgeFaturado,
    entregue: styles.badgeEntregue,
    cancelado: styles.badgeCancelado,
  }
  return (
    <span className={`${styles.badge} ${cls[status]}`}>
      {STATUS_PEDIDO_LABEL[status]}
    </span>
  )
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(' ')
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

type Tab = 'todos' | StatusPedido

const TABS: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'orcamento', label: 'Orçamentos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'faturado', label: 'Faturados' },
  { id: 'entregue', label: 'Entregues' },
  { id: 'cancelado', label: 'Cancelados' },
]

export function VendasPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, userPermissions } = usePermissions()
  const showVendedorFilter = canFilterVendasByVendedor(userPermissions, user)

  const pedidosQuery = usePedidosQuery()
  const createPedidoMutation = useCreatePedidoMutation()
  const confirmarPedidoMutation = useConfirmarPedidoMutation()

  const pedidos = useVendasStore((s) => s.pedidos)

  const [tab, setTab] = useState<Tab>('todos')
  const [busca, setBusca] = useState('')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [filtroVendedor, setFiltroVendedor] = useState('')
  const [filtroForma, setFiltroForma] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const buscaFromState = getBuscaFromState(location.state)
    if (!buscaFromState) return

    setBusca(buscaFromState)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  const kpi = useMemo(() => {
    const total = pedidos.filter((p) => p.status !== 'cancelado').reduce((acc, p) => acc + p.total, 0)
    const abertos = pedidos.filter((p) => p.status === 'confirmado' || p.status === 'orcamento').length
    const faturados = pedidos.filter((p) => p.status === 'faturado' || p.status === 'entregue')
    const faturadoTotal = faturados.reduce((acc, p) => acc + p.total, 0)
    const ticket = faturados.length > 0 ? faturadoTotal / faturados.length : 0
    const metaMes = 50000
    return { total, abertos, ticket, faturadoTotal, metaMes, percentMeta: Math.min((total / metaMes) * 100, 100) }
  }, [pedidos])

  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter((p) => {
        if (tab !== 'todos' && p.status !== tab) return false
        if (busca) {
          const q = busca.toLowerCase()
          if (
            !p.numero.toLowerCase().includes(q) &&
            !p.clienteNome.toLowerCase().includes(q) &&
            !p.clienteDocumento.toLowerCase().includes(q)
          ) {
            return false
          }
        }
        if (filtroVendedor && p.vendedorNome !== filtroVendedor) return false
        if (filtroForma && p.formaPagamento !== filtroForma) return false
        return true
      })
      .sort((a, b) => b.dataIso.localeCompare(a.dataIso))
  }, [pedidos, tab, busca, filtroVendedor, filtroForma])

  const vendedores = useMemo(() => {
    const nomes = new Set(pedidos.map((p) => p.vendedorNome).filter(Boolean) as string[])
    return [...nomes].sort()
  }, [pedidos])

  const filtrosAtivos = !!(filtroVendedor || filtroForma)

  function limparFiltros() {
    setFiltroVendedor('')
    setFiltroForma('')
  }

  function handleSubmit(values: PedidoFormValues) {
    return createPedidoMutation
      .mutateAsync(values)
      .then((pedido) => {
        showToast({
          message: `Orçamento ${pedido.numero} criado com sucesso.`,
          variant: 'success',
        })
        setDrawerOpen(false)
        navigate(`/vendas/${pedido.id}`)
      })
      .catch((error) => {
        showToast({
          message: getPedidoSaveErrorMessage(error, 'Erro ao criar pedido'),
          variant: 'error',
        })
        throw error
      })
  }

  async function handleConverterOrcamento(pedidoId: string, numero: string, clienteNome: string) {
    try {
      await confirmarPedidoMutation.mutateAsync(pedidoId)
      showToast({
        message: `Orçamento ${numero} convertido em venda para ${clienteNome}.`,
        variant: 'success',
      })
    } catch (error) {
      showToast({
        message: getPedidoActionErrorMessage(error, 'Não foi possível confirmar o orçamento.'),
        variant: 'error',
      })
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Vendas</h1>

          <div className={styles.headerActions}>
            <div className={styles.searchField}>
              <span className={styles.searchIcon}><IconSearch /></span>
              <input
                type="search"
                placeholder="Buscar por nº, cliente ou documento…"
                className={styles.searchInput}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={`${styles.btnSecondary} ${filtrosAtivos ? styles.btnSecondaryActive : ''}`}
              onClick={() => setFiltrosAbertos((v) => !v)}
            >
              <IconFilter />
              Filtros{filtrosAtivos ? ' •' : ''}
            </button>

            <button type="button" className={styles.btnSecondary}>
              <IconDownload />
              Exportar
            </button>

            <PermissionGate permissions={[...MODULE_WRITE_PERMISSIONS.vendas]} requireWrite>
              <button type="button" className={styles.btnPrimary} onClick={() => setDrawerOpen(true)}>
                <IconPlus />
                Novo pedido
              </button>
            </PermissionGate>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id !== 'todos' ? (
                <span className={styles.tabCount}>
                  ({pedidos.filter((p) => p.status === t.id).length})
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <VendasQueryFeedback
          isLoading={pedidosQuery.isLoading}
          isError={pedidosQuery.isError}
          onRetry={() => pedidosQuery.refetch()}
        >
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 2v20M2 12h20" /></svg>
              Total do mês
            </p>
            <p className={styles.kpiValue}>{formatarMoeda(kpi.total)}</p>
            <p className={`${styles.kpiTrend} ${styles.trendUp}`}>↑ Meta: {formatarMoeda(kpi.metaMes)}</p>
            <div className={styles.kpiProgressTrack}>
              <div className={styles.kpiProgressFill} style={{ width: `${kpi.percentMeta}%` }} />
            </div>
          </div>

          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><path d="M16 8l6-3v13l-6-3" /></svg>
              Pedidos abertos
            </p>
            <p className={`${styles.kpiValue} ${styles.colorOrange}`}>{kpi.abertos}</p>
            <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>Orçamentos + confirmados</p>
          </div>

          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /></svg>
              Total faturado
            </p>
            <p className={`${styles.kpiValue} ${styles.colorGreen}`}>{formatarMoeda(kpi.faturadoTotal)}</p>
            <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>NF-e emitidas</p>
          </div>

          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              Ticket médio
            </p>
            <p className={styles.kpiValue}>{formatarMoeda(kpi.ticket)}</p>
            <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>Por pedido faturado</p>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableToolbar}>
            <div className={styles.tableToolbarLeft}>
              <p className={styles.tableToolbarTitle}>Pedidos de venda</p>
              <p className={styles.tableToolbarSub}>
                {pedidosFiltrados.length} registro{pedidosFiltrados.length !== 1 ? 's' : ''}
                {filtrosAtivos ? ' · filtros ativos' : ''}
              </p>
            </div>
            <div className={styles.tableToolbarRight}>
              {filtrosAtivos ? (
                <button type="button" className={styles.tableFiltersClear} onClick={limparFiltros}>
                  Limpar filtros
                </button>
              ) : null}
            </div>
          </div>

          {filtrosAbertos ? (
            <div className={styles.tableFiltersPanel}>
              <div className={styles.tableFiltersHeader}>
                <p className={styles.tableFiltersTitle}>Filtros avançados</p>
              </div>

              <div className={styles.tableFiltersGrid}>
                {showVendedorFilter ? (
                  <div className={styles.tableFilterGroup}>
                    <label className={styles.tableFilterLabel} htmlFor="filtro-vendedor">Vendedor</label>
                    <select
                      id="filtro-vendedor"
                      className={styles.tableFilterSelect}
                      value={filtroVendedor}
                      onChange={(e) => setFiltroVendedor(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {vendedores.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className={styles.tableFilterGroup}>
                  <label className={styles.tableFilterLabel} htmlFor="filtro-forma">Forma de pagamento</label>
                  <select
                    id="filtro-forma"
                    className={styles.tableFilterSelect}
                    value={filtroForma}
                    onChange={(e) => setFiltroForma(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {Object.entries(FORMA_PAGAMENTO_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.tableFilterGroup}>
                  <label className={styles.tableFilterLabel} htmlFor="filtro-status">Status</label>
                  <select
                    id="filtro-status"
                    className={styles.tableFilterSelect}
                    value={tab === 'todos' ? '' : tab}
                    onChange={(e) => setTab((e.target.value as Tab) || 'todos')}
                  >
                    <option value="">Todos</option>
                    {STATUS_PEDIDO_ORDEM.map((s) => (
                      <option key={s} value={s}>{STATUS_PEDIDO_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="button" className={styles.tableFiltersClose} onClick={() => setFiltrosAbertos(false)}>
                <IconX />
              </button>
            </div>
          ) : null}

          {pedidosFiltrados.length === 0 ? (
            <p className={styles.emptyState}>Nenhum pedido encontrado.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nº / Cliente</th>
                  <th>Vendedor</th>
                  <th>Data</th>
                  <th>Pagamento</th>
                  <th className={styles.thCenter}>Status</th>
                  <th className={styles.thRight}>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr
                    key={pedido.id}
                    tabIndex={0}
                    onClick={() => navigate(`/vendas/${pedido.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/vendas/${pedido.id}`)
                      }
                    }}
                  >
                    <td>
                      <div className={styles.clienteCell}>
                        <div className={styles.clienteAvatar}>
                          {iniciais(pedido.clienteNome)}
                        </div>
                        <div>
                          <p className={styles.cellDescricao}>{pedido.clienteNome}</p>
                          <p className={styles.cellSubDesc}>{pedido.numero} · {pedido.clienteDocumento}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.cellMuted}>
                        {pedido.vendedorNome ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.cellMuted}>{formatarData(pedido.dataIso)}</span>
                    </td>
                    <td>
                      <span className={styles.cellMuted}>
                        {FORMA_PAGAMENTO_LABEL[pedido.formaPagamento]}
                      </span>
                      <p className={styles.cellSubDesc}>{pedido.condicaoPagamentoDescricao}</p>
                    </td>
                    <td className={styles.cellStatusCenter}>
                      <StatusBadge status={pedido.status} />
                    </td>
                    <td>
                      <p className={pedido.status === 'cancelado' ? styles.cellValorMuted : styles.cellValorPos}>
                        {formatarMoeda(pedido.total)}
                      </p>
                    </td>
                    <td>
                      <div className={styles.cellActions}>
                        {pedido.status === 'orcamento' ? (
                          <button
                            type="button"
                            className={styles.btnConvert}
                            title="Transformar orçamento em venda"
                            disabled={confirmarPedidoMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleConverterOrcamento(pedido.id, pedido.numero, pedido.clienteNome)
                            }}
                          >
                            <IconCheck />
                            Confirmar venda
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={styles.tableFooter}>
            <span className={styles.tableFooterInfo}>
              Exibindo {pedidosFiltrados.length} de {pedidos.length} pedidos
            </span>
          </div>
        </div>
        </VendasQueryFeedback>
      </div>

      {drawerOpen ? (
        <PedidoDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSubmit={handleSubmit}
          isSaving={createPedidoMutation.isPending}
        />
      ) : null}
    </div>
  )
}
