import { useState } from 'react'
import axios from 'axios'
import { Link, Navigate, useParams } from 'react-router-dom'

import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import {
  FORMA_PAGAMENTO_LABEL,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_ORDEM,
  formatarData,
  formatarMoeda,
} from '@/features/vendas/data/shared'
import {
  useConfirmarPedidoMutation,
  useEmitirNfePedidoMutation,
  usePedidoQuery,
  useUpdatePedidoStatusMutation,
} from '@/features/vendas/hooks/useVendas'
import { useVendasStore } from '@/features/vendas/store/useVendasStore'
import type { StatusPedido } from '@/features/vendas/types'
import { formatarDataCurta } from '@/features/vendas/utils/pagamento'
import { getPedidoActionErrorMessage } from '@/features/vendas/utils'
import { APP_PATHS } from '@/routes/paths'
import styles from '@/pages/vendas/VendaDetalhePage.module.css'

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconFileText() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" /><path d="M16 8l6-3v13l-6-3" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
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

const STATUS_FLOW: StatusPedido[] = ['orcamento', 'confirmado', 'faturado', 'entregue']

function StatusTimeline({ current }: { current: StatusPedido }) {
  if (current === 'cancelado') {
    return <div className={styles.timelineCancelado}>Pedido cancelado</div>
  }

  const currentIdx = STATUS_FLOW.indexOf(current)

  return (
    <div className={styles.timeline}>
      {STATUS_FLOW.map((s, idx) => {
        const done = idx <= currentIdx
        const active = idx === currentIdx
        return (
          <div key={s} className={styles.timelineStep}>
            <div className={`${styles.timelineDot} ${done ? styles.timelineDotDone : ''} ${active ? styles.timelineDotActive : ''}`}>
              {done && !active ? <IconCheck /> : null}
            </div>
            <span className={`${styles.timelineLabel} ${active ? styles.timelineLabelActive : ''}`}>
              {STATUS_PEDIDO_LABEL[s]}
            </span>
            {idx < STATUS_FLOW.length - 1 ? (
              <div className={`${styles.timelineLine} ${idx < currentIdx ? styles.timelineLineDone : ''}`} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function VendaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [confirmandoNfe, setConfirmandoNfe] = useState(false)

  const pedidoQuery = usePedidoQuery(id)
  const confirmarPedidoMutation = useConfirmarPedidoMutation()
  const updateStatusMutation = useUpdatePedidoStatusMutation()
  const emitirNfeMutation = useEmitirNfePedidoMutation()

  const pedidoFromStore = useVendasStore((s) => (id ? s.pedidos.find((p) => p.id === id) : undefined))
  const pedido = pedidoQuery.data ?? pedidoFromStore

  const isActionPending =
    confirmarPedidoMutation.isPending ||
    updateStatusMutation.isPending ||
    emitirNfeMutation.isPending

  if (pedidoQuery.isLoading && !pedido) {
    return (
      <div className={styles.notFound}>
        <Loading label="Carregando pedido..." layout="fullscreen" />
      </div>
    )
  }

  if (pedidoQuery.isError && !pedido) {
    const status = axios.isAxiosError(pedidoQuery.error)
      ? pedidoQuery.error.response?.status
      : undefined

    if (status === 403 || status === 404) {
      return <Navigate to={APP_PATHS.forbidden} replace />
    }

    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Erro ao carregar pedido</h1>
        <p className={styles.notFoundText}>Não foi possível buscar os dados deste pedido.</p>
        <button type="button" className={styles.backLinkStandalone} onClick={() => pedidoQuery.refetch()}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Pedido não encontrado</h1>
        <p className={styles.notFoundText}>O pedido solicitado não existe ou foi removido.</p>
        <Link to="/vendas" className={styles.backLinkStandalone}>← Voltar para vendas</Link>
      </div>
    )
  }

  const proximoStatus = (): StatusPedido | null => {
    const idx = STATUS_PEDIDO_ORDEM.indexOf(pedido.status)
    const next = STATUS_PEDIDO_ORDEM[idx + 1]
    if (!next || next === 'cancelado') return null
    return next
  }

  const proximo = proximoStatus()

  async function handleEmitirNfe() {
    if (!confirmandoNfe) {
      setConfirmandoNfe(true)
      return
    }
    if (!id) return

    try {
      await emitirNfeMutation.mutateAsync(id)
      setConfirmandoNfe(false)
      showToast({ message: 'Pedido faturado com sucesso.', variant: 'success' })
    } catch (error) {
      showToast({
        message: getPedidoActionErrorMessage(error, 'Não foi possível faturar o pedido.'),
        variant: 'error',
      })
    }
  }

  async function handleConverterOrcamento() {
    if (!id) return

    try {
      const convertido = await confirmarPedidoMutation.mutateAsync(id)
      showToast({
        message: `Orçamento ${convertido.numero} transformado em venda confirmada.`,
        variant: 'success',
      })
    } catch (error) {
      showToast({
        message: getPedidoActionErrorMessage(error, 'Não foi possível confirmar o orçamento.'),
        variant: 'error',
      })
    }
  }

  async function handleUpdateStatus(status: StatusPedido) {
    if (!id) return

    try {
      await updateStatusMutation.mutateAsync({ id, status })
      showToast({
        message: `Status atualizado para "${STATUS_PEDIDO_LABEL[status]}".`,
        variant: 'success',
      })
    } catch (error) {
      showToast({
        message: getPedidoActionErrorMessage(error, 'Não foi possível atualizar o status.'),
        variant: 'error',
      })
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/vendas" className={styles.backLink}>
            <IconArrowLeft /> Voltar para vendas
          </Link>
          <div className={styles.headerActions}>
            {pedido.status === 'orcamento' ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => void handleConverterOrcamento()}
                disabled={isActionPending}
              >
                <IconCheck />
                Transformar em venda
              </button>
            ) : null}
            {pedido.status === 'confirmado' && !pedido.nfeChave ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => void handleEmitirNfe()}
                disabled={isActionPending}
              >
                <IconFileText />
                {confirmandoNfe ? 'Confirmar emissão?' : 'Emitir NF-e'}
              </button>
            ) : null}
            {proximo && pedido.status !== 'orcamento' ? (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => void handleUpdateStatus(proximo)}
                disabled={isActionPending}
              >
                <IconTruck />
                Avançar para &quot;{STATUS_PEDIDO_LABEL[proximo]}&quot;
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.profileRow}>
          <div className={styles.clienteAvatar}>
            {pedido.clienteNome.slice(0, 2).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileTitleRow}>
              <h1 className={styles.pageTitle}>{pedido.clienteNome}</h1>
              <StatusBadge status={pedido.status} />
            </div>
            <p className={styles.profileSubtitle}>{pedido.numero} · {pedido.clienteDocumento}</p>
            <div className={styles.profileMeta}>
              <span>Data: {formatarData(pedido.dataIso)}</span>
              {pedido.dataEntregaIso ? <span>Entrega: {formatarData(pedido.dataEntregaIso)}</span> : null}
              {pedido.vendedorNome ? <span>Vendedor: {pedido.vendedorNome}</span> : null}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Status do pedido</h2>
          </div>
          <StatusTimeline current={pedido.status} />
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Itens do pedido</h2>
              </div>

              {pedido.itens.length === 0 ? (
                <p className={styles.emptyState}>Nenhum item neste pedido.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th className={styles.thRight}>Qtd</th>
                      <th className={styles.thRight}>Vlr unit.</th>
                      <th className={styles.thRight}>Desconto</th>
                      <th className={styles.thRight}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <p className={styles.cellDescricao}>{item.descricao}</p>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={styles.cellMuted}>{item.quantidade}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={styles.cellMuted}>{formatarMoeda(item.valorUnitario)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={styles.cellMuted}>
                            {item.desconto > 0
                              ? item.tipoDesconto === 'percentual'
                                ? `${item.desconto}%`
                                : formatarMoeda(item.desconto)
                              : '—'}
                          </span>
                        </td>
                        <td>
                          <p className={styles.cellValorPos}>{formatarMoeda(item.subtotal)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Dados do pedido</h2>
              </div>
              <dl className={styles.dadosGrid}>
                <div className={styles.dadoItem}>
                  <dt>Forma de pagamento</dt>
                  <dd>{FORMA_PAGAMENTO_LABEL[pedido.formaPagamento]}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Condição de pagamento</dt>
                  <dd>{pedido.condicaoPagamentoDescricao || '—'}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Data do pedido</dt>
                  <dd>{formatarData(pedido.dataIso)}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Previsão de entrega</dt>
                  <dd>{pedido.dataEntregaIso ? formatarData(pedido.dataEntregaIso) : '—'}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Vendedor</dt>
                  <dd>{pedido.vendedorNome ?? '—'}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Chave NF-e</dt>
                  <dd className={styles.nfeChave}>{pedido.nfeChave ?? '—'}</dd>
                </div>
              </dl>

              {pedido.observacao ? (
                <div className={styles.observacaoBox}>
                  <span className={styles.observacaoLabel}>Observações</span>
                  <p>{pedido.observacao}</p>
                </div>
              ) : null}
            </section>
          </div>

          <div className={styles.sideStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Resumo financeiro</h2>
              </div>
              <div className={styles.resumoList}>
                <div className={styles.resumoItem}>
                  <span>Subtotal dos itens</span>
                  <strong>{formatarMoeda(pedido.subtotal)}</strong>
                </div>
                {pedido.descontoTotal > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Descontos nos itens</span>
                    <strong className={styles.descontoValor}>- {formatarMoeda(pedido.descontoTotal)}</strong>
                  </div>
                ) : null}
                {pedido.frete > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Frete</span>
                    <strong>{formatarMoeda(pedido.frete)}</strong>
                  </div>
                ) : null}
                {pedido.jurosAdicionais > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Juros / Encargos</span>
                    <strong className={styles.jurosValor}>+ {formatarMoeda(pedido.jurosAdicionais)}</strong>
                  </div>
                ) : null}
                {pedido.descontoAdicional > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Desconto global</span>
                    <strong className={styles.descontoValor}>- {formatarMoeda(pedido.descontoAdicional)}</strong>
                  </div>
                ) : null}
                {pedido.multa > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Multa</span>
                    <strong className={styles.jurosValor}>+ {formatarMoeda(pedido.multa)}</strong>
                  </div>
                ) : null}
                {pedido.totalJuros > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Juros</span>
                    <strong className={styles.jurosValor}>+ {formatarMoeda(pedido.totalJuros)}</strong>
                  </div>
                ) : null}
                <div className={`${styles.resumoItem} ${styles.resumoItemTotal}`}>
                  <span className={styles.resumoTotalLabel}>
                    {pedido.totalComJuros > pedido.total ? 'Total a pagar' : 'Total'}
                  </span>
                  <strong className={styles.colorGreen}>
                    {formatarMoeda(pedido.totalComJuros || pedido.total)}
                  </strong>
                </div>
              </div>
            </div>

            {pedido.cronograma.length > 0 ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Cronograma de vencimentos</h2>
                </div>
                <div className={styles.cronogramaList}>
                  {pedido.cronograma.map((parcela) => (
                    <div key={parcela.numero} className={styles.cronogramaItem}>
                      <span className={styles.cronogramaNum}>{parcela.numero}ª</span>
                      <span className={styles.cronogramaData}>{formatarDataCurta(parcela.vencimentoIso)}</span>
                      <strong className={styles.cronogramaValor}>{formatarMoeda(parcela.valorComJuros)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {pedido.status !== 'cancelado' && pedido.status !== 'entregue' ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Ações</h2>
                </div>
                <div className={styles.actionList}>
                  {pedido.status === 'orcamento' ? (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => void handleConverterOrcamento()}
                      disabled={isActionPending}
                    >
                      <IconCheck />
                      Transformar em venda
                    </button>
                  ) : null}
                  {pedido.status === 'confirmado' && !pedido.nfeChave ? (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => void handleEmitirNfe()}
                      disabled={isActionPending}
                    >
                      <IconFileText />
                      {confirmandoNfe ? 'Clique para confirmar a emissão' : 'Emitir NF-e'}
                    </button>
                  ) : null}
                  {pedido.status === 'faturado' ? (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => void handleUpdateStatus('entregue')}
                      disabled={isActionPending}
                    >
                      <IconTruck />
                      Marcar como entregue
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => void handleUpdateStatus('cancelado')}
                    disabled={isActionPending}
                  >
                    Cancelar pedido
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
