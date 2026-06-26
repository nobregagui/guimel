import { useEffect, useRef, useState } from 'react'
import { Plus, Save, Tag, X, Zap } from 'lucide-react'

import {
  ERP_CATEGORIAS_PAGAR,
  ERP_CATEGORIAS_RECEBER,
  ERP_CENTROS_CUSTO,
} from '@/features/conciliacaoBancaria/data/shared'
import type { ExtratoOrigemTipo, RegraAplicadaA, RegraAutomatica } from '@/features/conciliacaoBancaria/types'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export type RegraFormData = {
  nome: string
  descricao: string
  palavrasChave: string[]
  tipo: RegraAplicadaA
  origens: ExtratoOrigemTipo[]
  categoria: string
  centroCusto: string
  ativo: boolean
  prioridade: number
}

const EMPTY_FORM: RegraFormData = {
  nome: '',
  descricao: '',
  palavrasChave: [],
  tipo: 'ambos',
  origens: [],
  categoria: '',
  centroCusto: '',
  ativo: true,
  prioridade: 100,
}

const ORIGENS_OPTIONS: Array<{ id: ExtratoOrigemTipo; label: string }> = [
  { id: 'pix', label: 'PIX' },
  { id: 'ted', label: 'TED' },
  { id: 'doc', label: 'DOC' },
  { id: 'boleto', label: 'Boleto' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'tarifa', label: 'Tarifa' },
  { id: 'juros', label: 'Juros' },
  { id: 'iof', label: 'IOF' },
  { id: 'transferencia', label: 'Transferência' },
  { id: 'aplicacao', label: 'Aplicação' },
  { id: 'resgate', label: 'Resgate' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'outros', label: 'Outros' },
]

const ALL_CATEGORIAS = [...new Set([...ERP_CATEGORIAS_RECEBER, ...ERP_CATEGORIAS_PAGAR])].sort()

interface NovaRegraModalProps {
  open: boolean
  regra?: RegraAutomatica
  onClose: () => void
  onSalvar: (data: RegraFormData) => void
}

export function NovaRegraModal({ open, regra, onClose, onSalvar }: NovaRegraModalProps) {
  // Derive initial form from props — avoids setState-in-effect
  const initialForm: RegraFormData = regra
    ? {
        nome: regra.nome,
        descricao: regra.descricao,
        palavrasChave: [...regra.palavrasChave],
        tipo: regra.tipo,
        origens: [...regra.origens],
        categoria: regra.categoria ?? '',
        centroCusto: regra.centroCusto ?? '',
        ativo: regra.ativo,
        prioridade: regra.prioridade,
      }
    : EMPTY_FORM

  const [form, setForm] = useState<RegraFormData>(initialForm)
  const [kwInput, setKwInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof RegraFormData, string>>>({})

  // Sync when the modal opens with a different regra (e.g. switching between edits)
  const openRef = useRef(false)
  useEffect(() => {
    if (open && !openRef.current) {
      // Reset deferred to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setForm(initialForm)
        setErrors({})
        setKwInput('')
      }, 0)
      openRef.current = true
      return () => clearTimeout(timer)
    }
    if (!open) {
      openRef.current = false
    }
    return undefined
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, regra?.id])

  function set<K extends keyof RegraFormData>(key: K, value: RegraFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function addKeyword() {
    const kw = kwInput.trim().toUpperCase()
    if (!kw) return
    if (!form.palavrasChave.includes(kw)) {
      set('palavrasChave', [...form.palavrasChave, kw])
    }
    setKwInput('')
  }

  function removeKeyword(kw: string) {
    set('palavrasChave', form.palavrasChave.filter((k) => k !== kw))
  }

  function toggleOrigem(origem: ExtratoOrigemTipo) {
    const exists = form.origens.includes(origem)
    set('origens', exists ? form.origens.filter((o) => o !== origem) : [...form.origens, origem])
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório'
    if (form.palavrasChave.length === 0) errs.palavrasChave = 'Adicione ao menos uma palavra-chave'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSalvar() {
    if (!validate()) return
    onSalvar(form)
    onClose()
  }

  if (!open) return null

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 50 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        style={{ width: 600 }}
        role="dialog"
        aria-modal
        aria-labelledby="nova-regra-modal-title"
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconPurple}`}>
              <Zap size={16} />
            </div>
            <div>
              <h2 id="nova-regra-modal-title" className={styles.modalTitle}>
                {regra ? 'Editar regra automática' : 'Nova regra automática'}
              </h2>
              <p className={styles.modalSubtitle}>
                A regra será aplicada automaticamente aos movimentos correspondentes.
              </p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Nome */}
          <div className={styles.filterPanelField}>
            <label className={styles.filterPanelLabel} htmlFor="regra-nome">
              Nome da regra <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="regra-nome"
              type="text"
              placeholder="Ex: Tarifas Bancárias, PIX Recebido..."
              className={`${styles.filterInput} ${errors.nome ? styles.filterInputError : ''}`}
              style={{ width: '100%' }}
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              maxLength={60}
            />
            {errors.nome ? <p className={styles.fieldError}>{errors.nome}</p> : null}
          </div>

          {/* Descrição */}
          <div className={styles.filterPanelField}>
            <label className={styles.filterPanelLabel} htmlFor="regra-desc">Descrição</label>
            <input
              id="regra-desc"
              type="text"
              placeholder="Descrição opcional da regra"
              className={styles.filterInput}
              style={{ width: '100%' }}
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Palavras-chave */}
          <div className={styles.filterPanelField}>
            <label className={styles.filterPanelLabel}>
              Palavras-chave <span style={{ color: '#ef4444' }}>*</span>
              <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>
                (detectadas na descrição do movimento)
              </span>
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Ex: PIX, BOLETO, TARIFA..."
                className={`${styles.filterInput} ${errors.palavrasChave ? styles.filterInputError : ''}`}
                style={{ flex: 1 }}
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <button type="button" className={styles.btnSuccess} onClick={addKeyword} style={{ flexShrink: 0 }}>
                <Plus size={13} /> Adicionar
              </button>
            </div>
            {errors.palavrasChave ? <p className={styles.fieldError}>{errors.palavrasChave}</p> : null}
            {form.palavrasChave.length > 0 ? (
              <div className={styles.kwTagsContainer}>
                {form.palavrasChave.map((kw) => (
                  <span key={kw} className={styles.kwTag}>
                    <Tag size={10} />
                    {kw}
                    <button
                      type="button"
                      className={styles.kwTagRemove}
                      onClick={() => removeKeyword(kw)}
                      aria-label={`Remover ${kw}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Tipo + Origem */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>Tipo de lançamento</label>
              <select
                className={styles.filterSelect}
                style={{ width: '100%' }}
                value={form.tipo}
                onChange={(e) => set('tipo', e.target.value as RegraAplicadaA)}
              >
                <option value="ambos">Ambos (receber e pagar)</option>
                <option value="receber">Somente a receber</option>
                <option value="pagar">Somente a pagar</option>
              </select>
            </div>

            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>
                Origens do extrato
                <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>
                  ({form.origens.length === 0 ? 'todas' : `${form.origens.length} selecionadas`})
                </span>
              </label>
              <div className={styles.checkboxGrid}>
                {ORIGENS_OPTIONS.map((o) => (
                  <label key={o.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={form.origens.includes(o.id)}
                      onChange={() => toggleOrigem(o.id)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Categoria + Centro de custo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>Categoria sugerida</label>
              <select
                className={styles.filterSelect}
                style={{ width: '100%' }}
                value={form.categoria}
                onChange={(e) => set('categoria', e.target.value)}
              >
                <option value="">Nenhuma</option>
                {ALL_CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>Centro de custo sugerido</label>
              <select
                className={styles.filterSelect}
                style={{ width: '100%' }}
                value={form.centroCusto}
                onChange={(e) => set('centroCusto', e.target.value)}
              >
                <option value="">Nenhum</option>
                {ERP_CENTROS_CUSTO.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ativo toggle */}
          <label className={styles.colToggleRow} style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={form.ativo}
              onChange={(e) => set('ativo', e.target.checked)}
            />
            <span style={{ fontSize: '13px', color: '#374151' }}>
              Ativar regra imediatamente após salvar
            </span>
          </label>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.btnSuccess} onClick={handleSalvar}>
            <Save size={13} />
            {regra ? 'Salvar alterações' : 'Criar regra'}
          </button>
        </div>
      </div>
    </div>
  )
}
