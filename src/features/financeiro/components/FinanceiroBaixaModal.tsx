import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

import type { BaixaTituloFormValues, ContaTituloBase, TituloModulo } from '@/features/financeiro/types'
import { formatBRL } from '@/features/financeiro/utils'
import { useContasBancariasQuery } from '@/features/financeiro/hooks/useFinanceiro'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const HOJE_ISO = new Date().toISOString().slice(0, 10)

interface FinanceiroBaixaModalProps {
  open: boolean
  modulo: TituloModulo
  titulo: ContaTituloBase & { cliente?: string; fornecedor?: string; documento: string }
  onClose: () => void
  onConfirm: (baixa: BaixaTituloFormValues) => void
}

function valorRestante(titulo: ContaTituloBase): number {
  return Math.max(0, titulo.valor - (titulo.valorBaixado ?? 0))
}

export function FinanceiroBaixaModal({
  open,
  modulo,
  titulo,
  onClose,
  onConfirm,
}: FinanceiroBaixaModalProps) {
  const { data: contasBancarias = [] } = useContasBancariasQuery()
  const restante = useMemo(() => valorRestante(titulo), [titulo])

  const [valor, setValor] = useState(restante)
  const [dataIso, setDataIso] = useState(HOJE_ISO)
  const [contaBancariaId, setContaBancariaId] = useState(titulo.contaBancariaId ?? contasBancarias[0]?.id ?? '')
  const [juros, setJuros] = useState(0)
  const [desconto, setDesconto] = useState(0)
  const [multa, setMulta] = useState(0)
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    if (!open) return
    setValor(restante)
    setDataIso(HOJE_ISO)
    setContaBancariaId(titulo.contaBancariaId ?? contasBancarias[0]?.id ?? '')
    setJuros(0)
    setDesconto(0)
    setMulta(0)
    setObservacao('')
  }, [open, restante, titulo.contaBancariaId, contasBancarias])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const tituloLabel = 'cliente' in titulo && titulo.cliente
    ? titulo.cliente
    : 'fornecedor' in titulo && titulo.fornecedor
      ? titulo.fornecedor
      : titulo.descricao ?? 'Título'

  const actionLabel = modulo === 'receber' ? 'Confirmar recebimento' : 'Confirmar pagamento'
  const title = modulo === 'receber' ? 'Registrar recebimento' : 'Registrar pagamento'

  return (
    <div className={styles.modalRoot}>
      <button type="button" className={styles.modalOverlay} onClick={onClose} aria-label="Fechar" />
      <div className={styles.modalPanel} role="dialog" aria-modal="true">
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{title}</h2>
            <p className={styles.modalSubtitle}>
              {tituloLabel} · {titulo.documento} · Saldo: {formatBRL(restante)}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="baixa-valor">Valor {modulo === 'receber' ? 'recebido' : 'pago'} (R$)</label>
              <input
                id="baixa-valor"
                type="number"
                min={0}
                step={0.01}
                value={valor || ''}
                onChange={(e) => setValor(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="baixa-data">Data</label>
              <input id="baixa-data" type="date" value={dataIso} onChange={(e) => setDataIso(e.target.value)} />
            </div>
            <div className={`${styles.formField} ${styles.fieldFull}`}>
              <label htmlFor="baixa-conta">Conta bancária</label>
              <select
                id="baixa-conta"
                value={contaBancariaId}
                onChange={(e) => setContaBancariaId(e.target.value)}
              >
                {contasBancarias.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="baixa-juros">Juros (R$)</label>
              <input
                id="baixa-juros"
                type="number"
                min={0}
                step={0.01}
                value={juros || ''}
                onChange={(e) => setJuros(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="baixa-desconto">Desconto (R$)</label>
              <input
                id="baixa-desconto"
                type="number"
                min={0}
                step={0.01}
                value={desconto || ''}
                onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="baixa-multa">Multa (R$)</label>
              <input
                id="baixa-multa"
                type="number"
                min={0}
                step={0.01}
                value={multa || ''}
                onChange={(e) => setMulta(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className={`${styles.formField} ${styles.fieldFull}`}>
              <label htmlFor="baixa-obs">Observação</label>
              <textarea
                id="baixa-obs"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!contaBancariaId || valor <= 0}
            onClick={() =>
              onConfirm({
                valor,
                dataIso,
                contaBancariaId,
                juros,
                desconto,
                multa,
                observacao: observacao.trim(),
              })
            }
          >
            {actionLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
