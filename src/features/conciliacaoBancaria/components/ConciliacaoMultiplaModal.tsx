import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Link2, X } from 'lucide-react'

import { ExtratoStatusBadge, ErpTipoBadge } from '@/features/conciliacaoBancaria/components/ConciliacaoStatusBadge'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import { formatBRL } from '@/features/conciliacaoBancaria/utils'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ConciliacaoMultiplaModalProps {
  open: boolean
  extratoIds: string[]
  erpIds: string[]
  onClose: () => void
  onConfirmar: (observacao: string) => void
}

export function ConciliacaoMultiplaModal({
  open,
  extratoIds,
  erpIds,
  onClose,
  onConfirmar,
}: ConciliacaoMultiplaModalProps) {
  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)

  const [observacao, setObservacao] = useState('')

  const extratoSelecionados = extratoItems.filter((e) => extratoIds.includes(e.id))
  const erpSelecionados = erpLancamentos.filter((e) => erpIds.includes(e.id))

  const totalExtrato = extratoSelecionados.reduce((acc, e) => {
    return e.tipo === 'credito' ? acc + e.valor : acc - e.valor
  }, 0)

  const totalErp = erpSelecionados.reduce((acc, e) => {
    return e.tipo === 'receber' ? acc + e.valor : acc - e.valor
  }, 0)

  const diferenca = totalExtrato - totalErp
  const diferencaAbs = Math.abs(diferenca)
  const valoresIguais = diferencaAbs < 0.01

  const tipoLabel =
    extratoIds.length === 1 && erpIds.length === 1
      ? 'Conciliação 1:1'
      : extratoIds.length === 1
        ? `Conciliação 1:N (1 extrato → ${erpIds.length} lançamentos)`
        : erpIds.length === 1
          ? `Conciliação N:1 (${extratoIds.length} extratos → 1 lançamento)`
          : `Conciliação N:N (${extratoIds.length} extratos → ${erpIds.length} lançamentos)`

  if (!open) return null

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 50 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        style={{ width: 680 }}
        role="dialog"
        aria-modal
        aria-labelledby="multipla-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconGreen}`}>
              <Link2 size={16} />
            </div>
            <div>
              <h2 id="multipla-modal-title" className={styles.modalTitle}>
                Revisar conciliação
              </h2>
              <p className={styles.modalSubtitle}>{tipoLabel}</p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Split preview */}
          <div className={styles.multiplaGrid}>
            {/* Extrato */}
            <div className={styles.multiplaPanel}>
              <p className={styles.multiplaPanelTitle}>
                Extrato Bancário
                <span className={styles.multiplaPanelCount}>{extratoIds.length}</span>
              </p>
              <div className={styles.multiplaPanelItems}>
                {extratoSelecionados.map((item) => (
                  <div key={item.id} className={styles.multiplaItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.multiplaItemDesc}>{item.descricao}</p>
                      <p className={styles.multiplaItemSub}>{item.data}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span className={item.tipo === 'credito' ? styles.cellValorPos : styles.cellValorNeg}>
                        {item.tipo === 'credito' ? '+' : '−'} {formatBRL(item.valor)}
                      </span>
                      <ExtratoStatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.multiplaPanelTotal}>
                <span>Total extrato</span>
                <span className={totalExtrato >= 0 ? styles.cellValorPos : styles.cellValorNeg}>
                  {formatBRL(Math.abs(totalExtrato))}
                </span>
              </div>
            </div>

            {/* Link icon */}
            <div className={styles.multiplaArrow}>
              <Link2 size={20} color="#16a34a" />
            </div>

            {/* ERP */}
            <div className={styles.multiplaPanel}>
              <p className={styles.multiplaPanelTitle}>
                Financeiro ERP
                <span className={styles.multiplaPanelCount}>{erpIds.length}</span>
              </p>
              <div className={styles.multiplaPanelItems}>
                {erpSelecionados.map((erp) => (
                  <div key={erp.id} className={styles.multiplaItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.multiplaItemDesc}>{erp.descricao}</p>
                      <p className={styles.multiplaItemSub}>
                        {erp.cliente ?? erp.fornecedor ?? '—'} · Venc. {erp.vencimento}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span className={erp.tipo === 'receber' ? styles.cellValorPos : styles.cellValorNeg}>
                        {formatBRL(erp.valor)}
                      </span>
                      <ErpTipoBadge tipo={erp.tipo} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.multiplaPanelTotal}>
                <span>Total ERP</span>
                <span className={totalErp >= 0 ? styles.cellValorPos : styles.cellValorNeg}>
                  {formatBRL(Math.abs(totalErp))}
                </span>
              </div>
            </div>
          </div>

          {/* Difference summary */}
          <div className={`${styles.multiplaResumo} ${valoresIguais ? styles.multiplaResumoOk : styles.multiplaResumoWarn}`}>
            {valoresIguais ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertTriangle size={15} />
            )}
            <span>
              {valoresIguais
                ? 'Valores correspondentes — conciliação perfeita.'
                : `Diferença de ${formatBRL(diferencaAbs)} entre extrato e ERP. A conciliação parcial será registrada.`}
            </span>
            {!valoresIguais ? (
              <span className={styles.multiplaResumoValor}>{formatBRL(diferencaAbs)}</span>
            ) : null}
          </div>

          {/* Observation */}
          <div className={styles.filterPanelField}>
            <label className={styles.filterPanelLabel} htmlFor="obs-conciliacao">
              Observação <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="obs-conciliacao"
              className={styles.filterTextarea}
              placeholder="Ex: Pagamento referente à NF-e 1045 do cliente Omega SA..."
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={250}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnSuccess}
            onClick={() => {
              onConfirmar(observacao)
              setObservacao('')
            }}
          >
            <Link2 size={13} />
            Confirmar conciliação
          </button>
        </div>
      </div>
    </div>
  )
}
