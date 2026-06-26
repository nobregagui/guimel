import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, PenLine, Plus, Trash2, Zap } from 'lucide-react'

import { ConfirmacaoModal } from '@/features/conciliacaoBancaria/components/ConfirmacaoModal'
import { NovaRegraModal } from '@/features/conciliacaoBancaria/components/NovaRegraModal'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { RegraAutomatica } from '@/features/conciliacaoBancaria/types'
import { ORIGEM_LABEL } from '@/features/conciliacaoBancaria/utils'
import { useToast } from '@/components/ui/Toast'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export function RegrasTab() {
  const { showToast } = useToast()
  const regras = useConciliacaoStore((s) => s.regras)
  const toggleRegra = useConciliacaoStore((s) => s.toggleRegra)
  const criarRegra = useConciliacaoStore((s) => s.criarRegra)
  const editarRegra = useConciliacaoStore((s) => s.editarRegra)
  const excluirRegra = useConciliacaoStore((s) => s.excluirRegra)
  const aplicarRegras = useConciliacaoStore((s) => s.aplicarRegras)

  const [novaRegraAberta, setNovaRegraAberta] = useState(false)
  const [editandoRegra, setEditandoRegra] = useState<RegraAutomatica | undefined>(undefined)
  const [excluindoRegra, setExcluindoRegra] = useState<RegraAutomatica | undefined>(undefined)

  const ativas = useMemo(() => regras.filter((r) => r.ativo).length, [regras])
  const totalAplicacoes = useMemo(() => regras.reduce((acc, r) => acc + r.aplicacoes, 0), [regras])

  function handleAplicar() {
    const count = aplicarRegras()
    if (count > 0) {
      showToast({ message: `${count} conciliação(ões) automática(s) realizada(s).`, variant: 'success' })
    } else {
      showToast({ message: 'Nenhuma correspondência encontrada pelas regras ativas.', variant: 'info' })
    }
  }

  function handleSalvarRegra(dados: import('@/features/conciliacaoBancaria/components/NovaRegraModal').RegraFormData) {
    const payload: Parameters<typeof criarRegra>[0] = {
      nome: dados.nome,
      descricao: dados.descricao,
      palavrasChave: dados.palavrasChave,
      tipo: dados.tipo,
      origens: dados.origens,
      categoria: dados.categoria || undefined,
      centroCusto: dados.centroCusto || undefined,
      ativo: dados.ativo,
      prioridade: dados.prioridade,
    }
    if (editandoRegra) {
      editarRegra(editandoRegra.id, payload)
      showToast({ message: `Regra "${dados.nome}" atualizada.`, variant: 'success' })
    } else {
      criarRegra(payload)
      showToast({ message: `Regra "${dados.nome}" criada com sucesso.`, variant: 'success' })
    }
    setEditandoRegra(undefined)
  }

  function handleExcluirConfirmado() {
    if (!excluindoRegra) return
    excluirRegra(excluindoRegra.id)
    showToast({ message: `Regra "${excluindoRegra.nome}" excluída.`, variant: 'info' })
    setExcluindoRegra(undefined)
  }

  return (
    <>
      {/* KPIs + action */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardTop}>
            <p className={styles.kpiCardLabel}>Regras ativas</p>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconGreen}`}><CheckCircle2 size={16} /></div>
          </div>
          <p className={styles.kpiCardValue}>{ativas}</p>
          <p className={styles.kpiCardTrend}>{regras.length - ativas} desativadas · {regras.length} total</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardTop}>
            <p className={styles.kpiCardLabel}>Total de aplicações</p>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconBlue}`}><Zap size={16} /></div>
          </div>
          <p className={styles.kpiCardValue}>{totalAplicacoes}</p>
          <p className={styles.kpiCardTrend}>Conciliações automáticas realizadas</p>
        </div>

        <div className={styles.kpiCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
          <p className={styles.kpiCardLabel}>Ações</p>
          <button type="button" className={styles.btnSuccess} onClick={handleAplicar}>
            <Zap size={13} /> Executar regras ativas
          </button>
          <button type="button" className={styles.btnGhost} onClick={() => setNovaRegraAberta(true)}>
            <Plus size={13} /> Nova regra
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={styles.infoRow}>
        <AlertCircle size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
        <span>
          As regras são aplicadas automaticamente ao importar extratos. A prioridade é aplicada de cima para baixo.
        </span>
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {regras.map((regra) => (
          <div
            key={regra.id}
            className={`${styles.regraCard} ${!regra.ativo ? styles.regraCardInativa : ''}`}
          >
            <div className={styles.regraCardLeft}>
              <p className={styles.regraCardNome}>{regra.nome}</p>
              <p className={styles.regraCardDesc}>{regra.descricao}</p>
              <div className={styles.regraCardMeta}>
                {regra.palavrasChave.slice(0, 4).map((kw) => (
                  <span key={kw} className={`${styles.badge} ${styles.badgePendente}`}
                    style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                    {kw}
                  </span>
                ))}
                {regra.palavrasChave.length > 4 ? (
                  <span className={`${styles.badge} ${styles.badgeOutros}`}>+{regra.palavrasChave.length - 4}</span>
                ) : null}
                {regra.origens.map((o) => (
                  <span key={o} className={`${styles.badge} ${styles.badgeOutros}`}>{ORIGEM_LABEL[o]}</span>
                ))}
                {regra.categoria ? (
                  <span className={`${styles.badge} ${styles.badgeSugerido}`}>{regra.categoria}</span>
                ) : null}
                <span className={styles.regraCardCount}>
                  {regra.aplicacoes} aplicações
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                className={styles.rowAction}
                onClick={() => { setEditandoRegra(regra); setNovaRegraAberta(true) }}
                title="Editar regra"
              >
                <PenLine size={13} />
              </button>
              <button
                type="button"
                className={`${styles.rowAction} ${styles.rowActionDanger}`}
                onClick={() => setExcluindoRegra(regra)}
                title="Excluir regra"
              >
                <Trash2 size={13} />
              </button>

              <label className={styles.toggle} title={regra.ativo ? 'Desativar' : 'Ativar'}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={regra.ativo}
                  onChange={() => toggleRegra(regra.id)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
            </div>
          </div>
        ))}

        {regras.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><Zap size={24} /></div>
            <p className={styles.emptyStateTitle}>Nenhuma regra cadastrada</p>
            <p className={styles.emptyStateText}>Crie regras automáticas para acelerar a conciliação.</p>
            <button type="button" className={styles.btnSuccess} onClick={() => setNovaRegraAberta(true)}>
              <Plus size={13} /> Criar primeira regra
            </button>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      <NovaRegraModal
        open={novaRegraAberta}
        regra={editandoRegra}
        onClose={() => { setNovaRegraAberta(false); setEditandoRegra(undefined) }}
        onSalvar={handleSalvarRegra}
      />

      <ConfirmacaoModal
        open={excluindoRegra !== undefined}
        titulo={`Excluir regra "${excluindoRegra?.nome}"?`}
        descricao="A regra será removida permanentemente e não poderá ser recuperada."
        variante="danger"
        labelConfirmar="Excluir"
        onClose={() => setExcluindoRegra(undefined)}
        onConfirmar={handleExcluirConfirmado}
      />
    </>
  )
}
