import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  FORMA_PAGAMENTO_LABEL,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_ORDEM,
  formatarData,
  formatarMoeda,
} from '@/features/vendas/data/shared'
import { useVendasStore } from '@/features/vendas/store/useVendasStore'
import type { StatusPedido } from '@/features/vendas/types'
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
  const pedido = useVendasStore((s) => s.pedidos.find((p) => p.id === id))
  const updateStatus = useVendasStore((s) => s.updateStatus)
  const emitirNfe = useVendasStore((s) => s.emitirNfe)
  const [confirmandoNfe, setConfirmandoNfe] = useState(false)

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

  function handleEmitirNfe() {
    if (!confirmandoNfe) {
      setConfirmandoNfe(true)
      return
    }
    if (!id) return
    emitirNfe(id)
    setConfirmandoNfe(false)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/vendas" className={styles.backLink}>
            <IconArrowLeft /> Voltar para vendas
          </Link>
          <div className={styles.headerActions}>
            {pedido.status === 'confirmado' && !pedido.nfeChave ? (
              <button type="button" className={styles.btnPrimary} onClick={handleEmitirNfe}>
                <IconFileText />
                {confirmandoNfe ? 'Confirmar emissão?' : 'Emitir NF-e'}
              </button>
            ) : null}
            {proximo ? (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => updateStatus(pedido.id, proximo)}
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
                  <dd>{pedido.condicaoPagamento || '—'}</dd>
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
                  <span>Subtotal</span>
                  <strong>{formatarMoeda(pedido.subtotal)}</strong>
                </div>
                {pedido.descontoTotal > 0 ? (
                  <div className={styles.resumoItem}>
                    <span>Descontos</span>
                    <strong className={styles.descontoValor}>- {formatarMoeda(pedido.descontoTotal)}</strong>
                  </div>
                ) : null}
                <div className={`${styles.resumoItem} ${styles.resumoItemTotal}`}>
                  <span className={styles.resumoTotalLabel}>Total</span>
                  <strong className={styles.colorGreen}>{formatarMoeda(pedido.total)}</strong>
                </div>
              </div>
            </div>

            {pedido.status !== 'cancelado' && pedido.status !== 'entregue' ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Ações</h2>
                </div>
                <div className={styles.actionList}>
                  {pedido.status === 'orcamento' ? (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => updateStatus(pedido.id, 'confirmado')}
                    >
                      <IconCheck />
                      Confirmar pedido
                    </button>
                  ) : null}
                  {pedido.status === 'confirmado' && !pedido.nfeChave ? (
                    <button type="button" className={styles.actionBtn} onClick={handleEmitirNfe}>
                      <IconFileText />
                      {confirmandoNfe ? 'Clique para confirmar a emissão' : 'Emitir NF-e'}
                    </button>
                  ) : null}
                  {pedido.status === 'faturado' ? (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => updateStatus(pedido.id, 'entregue')}
                    >
                      <IconTruck />
                      Marcar como entregue
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => updateStatus(pedido.id, 'cancelado')}
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
