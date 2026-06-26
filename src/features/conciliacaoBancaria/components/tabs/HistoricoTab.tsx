import { useMemo, useState } from 'react'
import { CheckCircle2, Link2, RotateCcw, Search } from 'lucide-react'

import { ConfirmacaoModal } from '@/features/conciliacaoBancaria/components/ConfirmacaoModal'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ConciliacaoRegistro } from '@/features/conciliacaoBancaria/types'
import { formatBRL } from '@/features/conciliacaoBancaria/utils'
import { useToast } from '@/components/ui/Toast'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export function HistoricoTab() {
  const { showToast } = useToast()
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)
  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)
  const desfazerConciliacao = useConciliacaoStore((s) => s.desfazerConciliacao)

  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'manual' | 'automatica' | 'sugestao'>('todos')
  const [desfazerAlvo, setDesfazerAlvo] = useState<ConciliacaoRegistro | null>(null)

  const enriched = useMemo(() => {
    return conciliacoes.map((c) => {
      const extratoIds = c.extratoIds ?? (c.extratoItemId ? [c.extratoItemId] : [])
      const erpIds = c.erpIds ?? (c.erpLancamentoId ? [c.erpLancamentoId] : [])
      const extratoList = extratoIds.map((id) => extratoItems.find((i) => i.id === id)).filter(Boolean)
      const erpList = erpIds.map((id) => erpLancamentos.find((e) => e.id === id)).filter(Boolean)
      return { ...c, extratoList, erpList }
    })
  }, [conciliacoes, extratoItems, erpLancamentos])

  const filtrados = useMemo(() => {
    return enriched.filter((c) => {
      const matchTipo = tipoFiltro === 'todos' || c.tipo === tipoFiltro
      if (!matchTipo) return false
      if (!busca) return true
      const text = busca.toLowerCase()
      return (
        c.extratoList.some((e) => e?.descricao.toLowerCase().includes(text)) ||
        c.erpList.some((e) => e?.descricao.toLowerCase().includes(text)) ||
        c.criadoPor.toLowerCase().includes(text)
      )
    })
  }, [enriched, tipoFiltro, busca])

  function handleDesfazer(c: ConciliacaoRegistro) {
    setDesfazerAlvo(c)
  }

  function handleConfirmarDesfazer() {
    if (!desfazerAlvo) return
    desfazerConciliacao(desfazerAlvo.id)
    showToast({ message: 'Conciliação desfeita. Os itens voltaram ao status pendente.', variant: 'info' })
    setDesfazerAlvo(null)
  }

  if (enriched.length === 0) {
    return (
      <div className={styles.tableSection}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Link2 size={24} />
          </div>
          <p className={styles.emptyStateTitle}>Nenhuma conciliação realizada ainda</p>
          <p className={styles.emptyStateText}>
            Vá para a aba Conciliação e vincule movimentos bancários aos lançamentos do ERP.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableToolbar}>
        <div className={styles.tableToolbarLeft}>
          <p className={styles.tableToolbarTitle}>Histórico de conciliações</p>
          <p className={styles.tableToolbarSub}>{filtrados.length} de {enriched.length} conciliações</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar..."
              className={styles.filterInput}
              style={{ paddingLeft: 28, width: 180 }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as typeof tipoFiltro)}
          >
            <option value="todos">Todos os tipos</option>
            <option value="manual">Manual</option>
            <option value="automatica">Automática</option>
            <option value="sugestao">Por sugestão</option>
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Search size={20} /></div>
          <p className={styles.emptyStateTitle}>Nenhum resultado</p>
          <p className={styles.emptyStateText}>Ajuste os filtros para encontrar conciliações.</p>
        </div>
      ) : null}

      {filtrados.map((c) => {
        const primeiroExtrato = c.extratoList[0]
        const isMultipla = c.extratoList.length > 1 || c.erpList.length > 1
        const tipoLabel =
          c.tipo === 'manual' ? 'Manual' : c.tipo === 'automatica' ? 'Automática' : 'Por sugestão'

        const tipoColorClass =
          c.tipo === 'manual'
            ? styles.kpiCardIconGreen
            : c.tipo === 'automatica'
              ? styles.kpiCardIconBlue
              : styles.kpiCardIconPurple

        return (
          <div key={c.id} className={styles.historicoItem}>
            <div className={`${styles.historicoIcon} ${tipoColorClass}`}>
              <CheckCircle2 size={16} />
            </div>

            <div className={styles.historicoBody}>
              {isMultipla ? (
                <p className={styles.historicoDescricao}>
                  Conciliação {c.extratoList.length}:{c.erpList.length} — {c.extratoList[0]?.descricao ?? '—'}
                  {c.extratoList.length > 1 ? ` +${c.extratoList.length - 1} outros` : ''}
                  {' → '}
                  {c.erpList[0]?.descricao ?? '—'}
                  {c.erpList.length > 1 ? ` +${c.erpList.length - 1} outros` : ''}
                </p>
              ) : (
                <p className={styles.historicoDescricao}>
                  {c.extratoList[0]?.descricao ?? '—'}
                  {' → '}
                  {c.erpList[0]?.descricao ?? '—'}
                </p>
              )}
              <p className={styles.historicoMeta}>
                {tipoLabel}
                {c.score ? ` · ${c.score}% confiança` : ''}
                {' · '}
                {c.criadoPor}
                {' · '}
                {c.criadoEm}
                {c.observacao ? ` · "${c.observacao}"` : ''}
              </p>
            </div>

            {primeiroExtrato ? (
              <span className={`${primeiroExtrato.tipo === 'credito' ? styles.cellValorPos : styles.cellValorNeg} ${styles.historicoValor}`}>
                {primeiroExtrato.tipo === 'credito' ? '+' : '−'} {formatBRL(primeiroExtrato.valor)}
                {isMultipla ? <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '4px' }}>+{c.extratoList.length - 1}</span> : null}
              </span>
            ) : null}

            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => handleDesfazer(c)}
              title="Desfazer conciliação"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )
      })}

      {/* Confirmação de desfazer */}
      <ConfirmacaoModal
        open={desfazerAlvo !== null}
        titulo="Desfazer esta conciliação?"
        descricao="Os movimentos voltarão ao status pendente e poderão ser conciliados novamente. Esta ação não pode ser refeita automaticamente."
        variante="danger"
        labelConfirmar="Desfazer"
        onClose={() => setDesfazerAlvo(null)}
        onConfirmar={handleConfirmarDesfazer}
      />
    </div>
  )
}
