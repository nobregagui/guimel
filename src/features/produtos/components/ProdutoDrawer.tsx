import { useEffect, useMemo, useState } from 'react'
import { Box, Package, Wrench, X } from 'lucide-react'

import { LoadingButtonContent } from '@/components/ui/Loading'
import {
  EMPTY_PRODUTO_FORM,
  ORIGEM_LABEL,
  TIPO_PRODUTO_LABEL,
  UNIDADE_LABEL,
  calcularMargem,
} from '@/features/produtos/data/shared'
import { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
import type { ProdutoFormValues, TipoProduto } from '@/features/produtos/types'
import styles from '@/pages/produtos/ProdutosPage.module.css'

type DrawerTab = 'geral' | 'precos' | 'fiscal' | 'estoque'

interface ProdutoDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ProdutoFormValues) => void | Promise<void>
  mode?: 'create' | 'edit'
  initialValues?: ProdutoFormValues
  isSaving?: boolean
}

const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'precos', label: 'Preços' },
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'estoque', label: 'Estoque' },
]

const TIPO_OPTIONS: { id: TipoProduto; label: string; icon: typeof Package }[] = [
  { id: 'produto', label: 'Produto', icon: Package },
  { id: 'servico', label: 'Serviço', icon: Wrench },
  { id: 'kit', label: 'Kit', icon: Box },
]

type NumberFieldKey =
  | 'precoCusto'
  | 'precoVenda'
  | 'precoPromocional'
  | 'aliquotaIcms'
  | 'aliquotaPis'
  | 'aliquotaCofins'
  | 'estoqueAtual'
  | 'estoqueMinimo'
  | 'estoqueMaximo'

function numberToDraft(value: number | null | undefined): string {
  if (value == null || value === 0) return ''
  return String(value)
}

function parseDraftNumber(raw: string, fallback = 0): number {
  const trimmed = raw.trim()
  if (!trimmed || trimmed === '-' || trimmed === '.') return fallback
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : fallback
}

function buildNumberDrafts(values: ProdutoFormValues): Record<NumberFieldKey, string> {
  return {
    precoCusto: numberToDraft(values.precoCusto),
    precoVenda: numberToDraft(values.precoVenda),
    precoPromocional: numberToDraft(values.precoPromocional),
    aliquotaIcms: numberToDraft(values.aliquotaIcms),
    aliquotaPis: numberToDraft(values.aliquotaPis),
    aliquotaCofins: numberToDraft(values.aliquotaCofins),
    estoqueAtual: numberToDraft(values.estoqueAtual),
    estoqueMinimo: numberToDraft(values.estoqueMinimo),
    estoqueMaximo: numberToDraft(values.estoqueMaximo),
  }
}

interface FormNumberInputProps {
  id: string
  value: string
  onChange: (raw: string) => void
  min?: number
  step?: number
  placeholder?: string
}

function FormNumberInput({ id, value, onChange, min, step, placeholder }: FormNumberInputProps) {
  return (
    <input
      id={id}
      type="number"
      min={min}
      step={step}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function ProdutoDrawer({
  open,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues,
  isSaving = false,
}: ProdutoDrawerProps) {
  const categorias = useProdutosStore((s) => s.categorias)

  const [tab, setTab] = useState<DrawerTab>('geral')
  const [form, setForm] = useState<ProdutoFormValues>(EMPTY_PRODUTO_FORM)
  const [numberDrafts, setNumberDrafts] = useState<Record<NumberFieldKey, string>>(() =>
    buildNumberDrafts(EMPTY_PRODUTO_FORM),
  )
  const [erro, setErro] = useState('')

  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, isSaving, onClose])

  useEffect(() => {
    if (!open) return
    setTab('geral')
    setErro('')
    const nextForm = initialValues ?? EMPTY_PRODUTO_FORM
    setForm(nextForm)
    setNumberDrafts(buildNumberDrafts(nextForm))
  }, [open, initialValues])

  const margem = useMemo(() => calcularMargem(form.precoCusto, form.precoVenda), [form.precoCusto, form.precoVenda])

  function setField<K extends keyof ProdutoFormValues>(field: K, value: ProdutoFormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleNumberField(field: NumberFieldKey, raw: string, optional = false) {
    setNumberDrafts((current) => ({ ...current, [field]: raw }))

    if (optional && raw.trim() === '') {
      setField(field, null as ProdutoFormValues[typeof field])
      return
    }

    setField(field, parseDraftNumber(raw) as ProdutoFormValues[typeof field])
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.nome.trim()) {
      setErro('Informe o nome do produto.')
      setTab('geral')
      return
    }
    if (form.precoVenda <= 0) {
      setErro('Informe um preço de venda maior que zero.')
      setTab('precos')
      return
    }

    try {
      await onSubmit(form)
    } catch {
      // Erro tratado pela página (toast); mantém drawer aberto.
    }
  }

  if (!open) return null

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={isSaving ? undefined : onClose} aria-label="Fechar formulário" disabled={isSaving} />

      <aside className={styles.drawerPanel} role="dialog" aria-modal="true" aria-labelledby="produto-drawer-title">
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="produto-drawer-title" className={styles.drawerTitle}>
              {isEdit ? 'Editar produto' : 'Novo produto'}
            </h2>
            <p className={styles.drawerSubtitle}>
              {isEdit
                ? 'Atualize as informações comerciais, fiscais e de estoque.'
                : 'Cadastre um produto, serviço ou kit com dados completos.'}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar" disabled={isSaving}>
            <X size={18} />
          </button>
        </header>

        <nav className={styles.drawerTabs} aria-label="Seções do formulário">
          {DRAWER_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.drawerTab} ${tab === item.id ? styles.drawerTabActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <form className={styles.drawerBody} onSubmit={handleSubmit}>
          {tab === 'geral' ? (
            <>
              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Tipo</legend>
                <div className={styles.tipoGrid}>
                  {TIPO_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <label
                        key={option.id}
                        className={`${styles.tipoOption} ${form.tipo === option.id ? styles.tipoOptionActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="tipo"
                          value={option.id}
                          checked={form.tipo === option.id}
                          onChange={() => setField('tipo', option.id)}
                        />
                        <Icon size={16} />
                        {TIPO_PRODUTO_LABEL[option.id]}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Identificação</legend>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-codigo">Código / SKU</label>
                    <input
                      id="prod-codigo"
                      value={form.codigo}
                      onChange={(e) => setField('codigo', e.target.value)}
                      placeholder="Gerado automaticamente se vazio"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-barras">Código de barras</label>
                    <input
                      id="prod-barras"
                      value={form.codigoBarras}
                      onChange={(e) => setField('codigoBarras', e.target.value)}
                      placeholder="EAN / GTIN"
                    />
                  </div>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-nome">Nome *</label>
                    <input
                      id="prod-nome"
                      value={form.nome}
                      onChange={(e) => setField('nome', e.target.value)}
                      placeholder="Nome do produto ou serviço"
                    />
                  </div>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-descricao">Descrição</label>
                    <textarea
                      id="prod-descricao"
                      value={form.descricao}
                      onChange={(e) => setField('descricao', e.target.value)}
                      placeholder="Descrição comercial ou técnica"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-categoria">Categoria</label>
                    <select
                      id="prod-categoria"
                      value={form.categoriaId}
                      onChange={(e) => setField('categoriaId', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-unidade">Unidade de medida</label>
                    <select
                      id="prod-unidade"
                      value={form.unidadeMedida}
                      onChange={(e) => setField('unidadeMedida', e.target.value as ProdutoFormValues['unidadeMedida'])}
                    >
                      {Object.entries(UNIDADE_LABEL).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-status">Status</label>
                    <select
                      id="prod-status"
                      value={form.status}
                      onChange={(e) => setField('status', e.target.value as ProdutoFormValues['status'])}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="rascunho">Rascunho</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            </>
          ) : null}

          {tab === 'precos' ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formLegend}>Preços</legend>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="prod-custo">Preço de custo (R$)</label>
                  <FormNumberInput
                    id="prod-custo"
                    min={0}
                    step={0.01}
                    value={numberDrafts.precoCusto}
                    onChange={(raw) => handleNumberField('precoCusto', raw)}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-venda">Preço de venda (R$) *</label>
                  <FormNumberInput
                    id="prod-venda"
                    min={0}
                    step={0.01}
                    value={numberDrafts.precoVenda}
                    onChange={(raw) => handleNumberField('precoVenda', raw)}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-promo">Preço promocional (R$)</label>
                  <FormNumberInput
                    id="prod-promo"
                    min={0}
                    step={0.01}
                    value={numberDrafts.precoPromocional}
                    placeholder="Opcional"
                    onChange={(raw) => handleNumberField('precoPromocional', raw, true)}
                  />
                </div>
              </div>
              <div className={styles.margemPreview}>
                <span>Margem de lucro estimada</span>
                <strong className={styles.margemValor} style={{ color: margem >= 30 ? '#15803d' : '#b45309' }}>
                  {margem.toFixed(1)}%
                </strong>
              </div>
            </fieldset>
          ) : null}

          {tab === 'fiscal' ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formLegend}>Dados fiscais</legend>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="prod-ncm">NCM</label>
                  <input id="prod-ncm" value={form.ncm} onChange={(e) => setField('ncm', e.target.value)} placeholder="0000.00.00" />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-cfop">CFOP</label>
                  <input id="prod-cfop" value={form.cfop} onChange={(e) => setField('cfop', e.target.value)} placeholder="5102" />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-cst">CST</label>
                  <input id="prod-cst" value={form.cst} onChange={(e) => setField('cst', e.target.value)} placeholder="000" />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-origem">Origem</label>
                  <select
                    id="prod-origem"
                    value={form.origem}
                    onChange={(e) => setField('origem', e.target.value as ProdutoFormValues['origem'])}
                  >
                    {Object.entries(ORIGEM_LABEL).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-icms">ICMS (%)</label>
                  <FormNumberInput
                    id="prod-icms"
                    min={0}
                    step={0.01}
                    value={numberDrafts.aliquotaIcms}
                    onChange={(raw) => handleNumberField('aliquotaIcms', raw)}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-pis">PIS (%)</label>
                  <FormNumberInput
                    id="prod-pis"
                    min={0}
                    step={0.01}
                    value={numberDrafts.aliquotaPis}
                    onChange={(raw) => handleNumberField('aliquotaPis', raw)}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-cofins">COFINS (%)</label>
                  <FormNumberInput
                    id="prod-cofins"
                    min={0}
                    step={0.01}
                    value={numberDrafts.aliquotaCofins}
                    onChange={(raw) => handleNumberField('aliquotaCofins', raw)}
                  />
                </div>
              </div>
            </fieldset>
          ) : null}

          {tab === 'estoque' ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formLegend}>Controle de estoque</legend>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Controlar estoque</p>
                  <p className={styles.toggleSub}>Desative para serviços ou itens sem movimentação física.</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={form.controlaEstoque}
                    onChange={(e) => setField('controlaEstoque', e.target.checked)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              {form.controlaEstoque ? (
                <div className={styles.formGrid3}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-estoque-atual">Estoque atual</label>
                    <FormNumberInput
                      id="prod-estoque-atual"
                      min={0}
                      value={numberDrafts.estoqueAtual}
                      onChange={(raw) => handleNumberField('estoqueAtual', raw)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-estoque-min">Estoque mínimo</label>
                    <FormNumberInput
                      id="prod-estoque-min"
                      min={0}
                      value={numberDrafts.estoqueMinimo}
                      onChange={(raw) => handleNumberField('estoqueMinimo', raw)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-estoque-max">Estoque máximo</label>
                    <FormNumberInput
                      id="prod-estoque-max"
                      min={0}
                      value={numberDrafts.estoqueMaximo}
                      placeholder="Opcional"
                      onChange={(raw) => handleNumberField('estoqueMaximo', raw, true)}
                    />
                  </div>
                </div>
              ) : null}
            </fieldset>
          ) : null}

          {erro ? <span className={styles.fieldError}>{erro}</span> : null}

          <footer className={styles.drawerFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
              <LoadingButtonContent
                loading={isSaving}
                loadingLabel={isEdit ? 'Salvando...' : 'Cadastrando...'}
                idleLabel={isEdit ? 'Salvar alterações' : 'Cadastrar produto'}
              />
            </button>
          </footer>
        </form>
      </aside>
    </div>
  )
}
