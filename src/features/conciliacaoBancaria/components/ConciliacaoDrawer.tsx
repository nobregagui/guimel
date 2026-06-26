import { useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  EyeOff,
  Link2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'

import {
  ExtratoStatusBadge,
  ErpStatusBadge,
  ErpTipoBadge,
  ExtratoMovTipoBadge,
  OrigemChip,
} from '@/features/conciliacaoBancaria/components/ConciliacaoStatusBadge'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ConciliacaoHistoricoEvento } from '@/features/conciliacaoBancaria/types'
import { formatBRL, scoreColor, scoreLabel, calcularSugestoes } from '@/features/conciliacaoBancaria/utils'
import { useToast } from '@/components/ui/Toast'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

const EVENTO_CONFIG: Record<
  ConciliacaoHistoricoEvento,
  { dotClass: string; icon: React.ReactNode }
> = {
  importado: { dotClass: styles.timelineDotBlue, icon: <Clock size={10} /> },
  sugerido: { dotClass: styles.timelineDotOrange, icon: <Sparkles size={10} /> },
  conciliado: { dotClass: styles.timelineDotGreen, icon: <CheckCircle2 size={10} /> },
  editado: { dotClass: styles.timelineDotBlue, icon: <Clock size={10} /> },
  desfeito: { dotClass: styles.timelineDotRed, icon: <RotateCcw size={10} /> },
  ignorado: { dotClass: styles.timelineDotGray, icon: <EyeOff size={10} /> },
  aprovado: { dotClass: styles.timelineDotGreen, icon: <CheckCircle2 size={10} /> },
}

export function ConciliacaoDrawer() {
  const { showToast } = useToast()

  const drawerExtratoId = useConciliacaoStore((s) => s.drawerExtratoId)
  const drawerErpId = useConciliacaoStore((s) => s.drawerErpId)
  const getExtratoById = useConciliacaoStore((s) => s.getExtratoById)
  const getErpById = useConciliacaoStore((s) => s.getErpById)
  const getConciliacaoByExtratoId = useConciliacaoStore((s) => s.getConciliacaoByExtratoId)
  const closeDrawer = useConciliacaoStore((s) => s.closeDrawer)
  const desfazerConciliacao = useConciliacaoStore((s) => s.desfazerConciliacao)
  const ignorarExtrato = useConciliacaoStore((s) => s.ignorarExtrato)
  const conciliarAutomatica = useConciliacaoStore((s) => s.conciliarAutomatica)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)

  const isOpen = Boolean(drawerExtratoId ?? drawerErpId)
  const extrato = drawerExtratoId ? getExtratoById(drawerExtratoId) : undefined
  const erp = drawerErpId ? getErpById(drawerErpId) : undefined
  const conciliacao = extrato ? getConciliacaoByExtratoId(extrato.id) : undefined

  const sugestoes =
    extrato && extrato.status === 'pendente'
      ? calcularSugestoes(
          extrato,
          erpLancamentos.filter((e) => e.status === 'pendente'),
        )
      : []

  useEffect(() => {
    if (!isOpen) return undefined
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeDrawer])

  if (!isOpen) return null

  const title = extrato ? 'Detalhe do extrato bancário' : 'Detalhe do lançamento ERP'
  const subtitle = extrato
    ? `${extrato.descricao}`
    : erp
      ? `${erp.descricao}`
      : ''

  return (
    <div className={styles.drawerRoot}>
      <button
        type="button"
        className={styles.drawerOverlay}
        onClick={closeDrawer}
        aria-label="Fechar"
      />
      <aside
        className={styles.drawerPanel}
        role="dialog"
        aria-modal
        aria-labelledby="conciliacao-drawer-title"
      >
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="conciliacao-drawer-title" className={styles.drawerTitle}>{title}</h2>
            <p className={styles.drawerSubtitle}>{subtitle}</p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label="Fechar">
            <X size={16} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          {/* Extrato details */}
          {extrato ? (
            <>
              <div className={styles.drawerSection}>
                <p className={styles.drawerSectionTitle}>Informações do movimento</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <DrawerField label="Data" value={extrato.data} />
                  <DrawerField label="Valor" value={extrato.tipo === 'credito' ? `+ ${formatBRL(extrato.valor)}` : `− ${formatBRL(extrato.valor)}`} />
                  <DrawerField label="Tipo" value={<ExtratoMovTipoBadge tipo={extrato.tipo} />} />
                  <DrawerField label="Origem" value={<OrigemChip origem={extrato.origem} />} />
                  <DrawerField label="Status" value={<ExtratoStatusBadge status={extrato.status} />} />
                  <DrawerField label="Saldo após" value={formatBRL(extrato.saldo)} />
                </div>
                {extrato.documento ? <DrawerField label="Documento" value={extrato.documento} /> : null}
                {extrato.observacao ? <DrawerField label="Observação" value={extrato.observacao} /> : null}
                <DrawerField label="Importado em" value={extrato.importadoEm} />
              </div>

              {/* Sugestões inteligentes */}
              {sugestoes.length > 0 ? (
                <div className={styles.drawerSection}>
                  <p className={styles.drawerSectionTitle}>Sugestões inteligentes ({sugestoes.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sugestoes.map((s) => {
                      const erpCandidato = erpLancamentos.find((e) => e.id === s.erpLancamentoId)
                      if (!erpCandidato) return null
                      const cor = scoreColor(s.score)
                      return (
                        <div key={s.erpLancamentoId} className={styles.sugestaoCard}>
                          <div className={styles.sugestaoCardTop}>
                            <div>
                              <p className={styles.cellDescricao}>{erpCandidato.descricao}</p>
                              <p className={styles.cellSubDesc}>
                                {erpCandidato.cliente ?? erpCandidato.fornecedor ?? '—'} · {formatBRL(erpCandidato.valor)} · Venc: {erpCandidato.vencimento}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span
                                className={styles.sugestaoScore}
                                style={{ color: cor }}
                              >
                                {s.score}%
                              </span>
                              <span
                                className={`${styles.sugestaoLabel} ${s.score >= 80 ? styles.sugestaoLabelHigh : s.score >= 60 ? styles.sugestaoLabelMid : styles.sugestaoLabelLow}`}
                              >
                                {scoreLabel(s.score)}
                              </span>
                            </div>
                          </div>
                          <div className={styles.sugestaoCriterios}>
                            {s.criterios.map((c) => (
                              <span
                                key={c.nome}
                                title={c.descricao}
                                className={`${styles.sugestaoCriterioChip} ${c.match ? styles.sugestaoCriterioMatch : styles.sugestaoCriterioNoMatch}`}
                              >
                                {c.match ? '✓' : '✗'} {c.nome} ({c.peso}pts)
                              </span>
                            ))}
                          </div>
                          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.btnSuccess}
                              onClick={() => {
                                conciliarAutomatica(extrato.id, s.erpLancamentoId, s.score)
                                closeDrawer()
                                showToast({
                                  message: `Conciliação realizada com ${s.score}% de confiança.`,
                                  variant: 'success',
                                })
                              }}
                            >
                              <Link2 size={13} /> Aceitar sugestão
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {/* Timeline */}
              {conciliacao ? (
                <div className={styles.drawerSection}>
                  <p className={styles.drawerSectionTitle}>Timeline</p>
                  <div className={styles.timeline}>
                    {conciliacao.historico.map((item, idx) => {
                      const cfg = EVENTO_CONFIG[item.evento] ?? EVENTO_CONFIG.editado
                      return (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={styles.timelineLine} />
                          <div className={`${styles.timelineDot} ${cfg.dotClass}`}>{cfg.icon}</div>
                          <div className={styles.timelineContent}>
                            <p className={styles.timelineEvent}>{item.descricao}</p>
                            <p className={styles.timelineMeta}>{item.em} · {item.por}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className={styles.drawerSection}>
                  <p className={styles.drawerSectionTitle}>Timeline</p>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineLine} />
                      <div className={`${styles.timelineDot} ${styles.timelineDotBlue}`}><Clock size={10} /></div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineEvent}>Importado do extrato bancário</p>
                        <p className={styles.timelineMeta}>{extrato.importadoEm} · Sistema</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* ERP details */}
          {erp ? (
            <div className={styles.drawerSection}>
              <p className={styles.drawerSectionTitle}>Informações do lançamento</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <DrawerField label="Tipo" value={<ErpTipoBadge tipo={erp.tipo} />} />
                <DrawerField label="Status" value={<ErpStatusBadge status={erp.status} />} />
                <DrawerField label="Vencimento" value={erp.vencimento} />
                <DrawerField label="Valor" value={formatBRL(erp.valor)} />
                <DrawerField label="Categoria" value={erp.categoria} />
                {erp.centroCusto ? <DrawerField label="Centro de custo" value={erp.centroCusto} /> : null}
                <DrawerField label="Competência" value={erp.competencia} />
                {erp.documento ? <DrawerField label="Documento" value={erp.documento} /> : null}
              </div>
              {erp.cliente ? <DrawerField label="Cliente" value={erp.cliente} /> : null}
              {erp.fornecedor ? <DrawerField label="Fornecedor" value={erp.fornecedor} /> : null}
              {erp.observacao ? <DrawerField label="Observação" value={erp.observacao} /> : null}
            </div>
          ) : null}
        </div>

        <footer className={styles.drawerFooter}>
          {extrato?.status === 'pendente' ? (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => {
                ignorarExtrato(extrato.id)
                closeDrawer()
                showToast({ message: 'Movimento marcado como ignorado.', variant: 'info' })
              }}
            >
              <EyeOff size={13} /> Ignorar
            </button>
          ) : null}

          {extrato?.conciliacaoId ? (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                if (extrato.conciliacaoId) desfazerConciliacao(extrato.conciliacaoId)
                closeDrawer()
                showToast({ message: 'Conciliação desfeita com sucesso.', variant: 'info' })
              }}
            >
              <RotateCcw size={13} /> Desfazer conciliação
            </button>
          ) : null}

          <button type="button" className={styles.btnSecondary} onClick={closeDrawer} style={{ marginLeft: 'auto' }}>
            Fechar
          </button>
        </footer>
      </aside>
    </div>
  )
}

function DrawerField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.drawerField}>
      <p className={styles.drawerFieldLabel}>{label}</p>
      <div className={styles.drawerFieldValue}>{value}</div>
    </div>
  )
}
