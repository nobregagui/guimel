import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Building2,
  FileStack,
  Layers3,
  Package,
  Percent,
  Scale,
  ShoppingCart,
  Upload,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react'

import { LoadingButtonContent } from '@/components/ui/Loading'
import { ProdutoFileUpload } from '@/features/produtos/components/ProdutoFileUpload'
import { SearchableSelect } from '@/features/produtos/components/SearchableSelect'
import {
  EMPTY_PRODUTO_FORM,
  ORIGEM_LABEL,
  TIPO_PRODUTO_LABEL,
  UNIDADE_LABEL,
  calcularMargem,
} from '@/features/produtos/data/shared'
import { LOOKUP_KIND_LABEL } from '@/features/produtos/data/lookups'
import { useProdutoLookupsStore } from '@/features/produtos/store/useProdutoLookupsStore'
import { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
import type {
  ProdutoFieldErrors,
  ProdutoFormValues,
  ProdutoLookupKind,
  ProdutoLookupOption,
  TipoProduto,
} from '@/features/produtos/types'
import {
  calcProdutoProgresso,
  firstInvalidTab,
  isProdutoFormValid,
  validateProdutoField,
  validateProdutoForm,
} from '@/features/produtos/utils/produtoFormValidation'
import { getProdutoSaveErrorMessage } from '@/features/produtos/utils'
import { categoriaService } from '@/services/categoria.service'
import { produtoLookupServices } from '@/services/produtoLookup.service'
import { cestMask, ncmMask } from '@/utils/masks'
import styles from '@/pages/produtos/ProdutosPage.module.css'

type DrawerTab = 'geral' | 'precos' | 'fiscal' | 'estoque' | 'complementos'

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
  { id: 'complementos', label: 'Complementos' },
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
  | 'aliquotaIpi'
  | 'aliquotaPis'
  | 'aliquotaCofins'
  | 'aliquotaIss'
  | 'aliquotaFcp'
  | 'estoqueAtual'
  | 'estoqueMinimo'
  | 'estoqueMaximo'
  | 'pesoLiquido'
  | 'pesoBruto'
  | 'altura'
  | 'largura'
  | 'comprimento'
  | 'volume'
  | 'prazoMedioCompra'
  | 'loteEconomico'
  | 'quantidadeMinimaCompra'
  | 'comissao'

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
    aliquotaIpi: numberToDraft(values.aliquotaIpi),
    aliquotaPis: numberToDraft(values.aliquotaPis),
    aliquotaCofins: numberToDraft(values.aliquotaCofins),
    aliquotaIss: numberToDraft(values.aliquotaIss),
    aliquotaFcp: numberToDraft(values.aliquotaFcp),
    estoqueAtual: numberToDraft(values.estoqueAtual),
    estoqueMinimo: numberToDraft(values.estoqueMinimo),
    estoqueMaximo: numberToDraft(values.estoqueMaximo),
    pesoLiquido: numberToDraft(values.pesoLiquido),
    pesoBruto: numberToDraft(values.pesoBruto),
    altura: numberToDraft(values.altura),
    largura: numberToDraft(values.largura),
    comprimento: numberToDraft(values.comprimento),
    volume: numberToDraft(values.volume),
    prazoMedioCompra: numberToDraft(values.prazoMedioCompra),
    loteEconomico: numberToDraft(values.loteEconomico),
    quantidadeMinimaCompra: numberToDraft(values.quantidadeMinimaCompra),
    comissao: numberToDraft(values.comissao),
  }
}

interface FormNumberInputProps {
  id: string
  value: string
  onChange: (raw: string) => void
  onBlur?: () => void
  min?: number
  step?: number
  placeholder?: string
  disabled?: boolean
}

function FormNumberInput({ id, value, onChange, onBlur, min, step, placeholder, disabled }: FormNumberInputProps) {
  return (
    <input
      id={id}
      type="number"
      min={min}
      step={step}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  )
}

interface FormCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function FormCard({ title, icon, children }: FormCardProps) {
  return (
    <section className={styles.formCard}>
      <header className={styles.formCardHeader}>
        {icon ? <span className={styles.formCardIcon}>{icon}</span> : null}
        <h3 className={styles.formCardTitle}>{title}</h3>
      </header>
      <div className={styles.formCardBody}>{children}</div>
    </section>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className={styles.fieldError}>{message}</span>
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
  const setCategorias = useProdutosStore((s) => s.setCategorias)
  const marcas = useProdutoLookupsStore((s) => s.marca)
  const fabricantes = useProdutoLookupsStore((s) => s.fabricante)
  const linhas = useProdutoLookupsStore((s) => s.linha)
  const colecoes = useProdutoLookupsStore((s) => s.colecao)
  const modelos = useProdutoLookupsStore((s) => s.modelo)
  const fornecedores = useProdutoLookupsStore((s) => s.fornecedor)
  const upsertLookup = useProdutoLookupsStore((s) => s.upsertLookup)

  const [tab, setTab] = useState<DrawerTab>('geral')
  const [form, setForm] = useState<ProdutoFormValues>(EMPTY_PRODUTO_FORM)
  const [numberDrafts, setNumberDrafts] = useState<Record<NumberFieldKey, string>>(() =>
    buildNumberDrafts(EMPTY_PRODUTO_FORM),
  )
  const [fieldErrors, setFieldErrors] = useState<ProdutoFieldErrors>({})
  const [lookupLoading, setLookupLoading] = useState<Partial<Record<ProdutoLookupKind, boolean>>>({})

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
    setFieldErrors({})
    const nextForm = initialValues ?? EMPTY_PRODUTO_FORM
    setForm(nextForm)
    setNumberDrafts(buildNumberDrafts(nextForm))
  }, [open, initialValues])

  const margem = useMemo(() => calcularMargem(form.precoCusto, form.precoVenda), [form.precoCusto, form.precoVenda])
  const progresso = useMemo(() => calcProdutoProgresso(form), [form])
  const canSubmit = useMemo(() => isProdutoFormValid(form), [form])
  const tabIndex = DRAWER_TABS.findIndex((item) => item.id === tab)
  const prevTab = DRAWER_TABS[tabIndex - 1]
  const nextTab = DRAWER_TABS[tabIndex + 1]

  const categoriaOptions = useMemo<ProdutoLookupOption[]>(
    () => categorias.map((categoria) => ({ id: categoria.id, nome: categoria.nome })),
    [categorias],
  )

  const setField = useCallback(<K extends keyof ProdutoFormValues>(field: K, value: ProdutoFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const clearFieldError = useCallback((field: keyof ProdutoFormValues) => {
    setFieldErrors((current) => {
      if (!(field in current)) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const touchField = useCallback((field: keyof ProdutoFormValues, nextForm?: ProdutoFormValues) => {
    const source = nextForm ?? form
    const message = validateProdutoField(field, source)
    setFieldErrors((current) => {
      if (!message) {
        if (!(field in current)) return current
        const next = { ...current }
        delete next[field]
        return next
      }
      return { ...current, [field]: message }
    })
  }, [form])

  useEffect(() => {
    setFieldErrors((current) => {
      let changed = false
      const next = { ...current }

      for (const field of Object.keys(current) as Array<keyof ProdutoFormValues>) {
        if (!validateProdutoField(field, form)) {
          delete next[field]
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [form])

  const handleTextField = useCallback(
    (field: keyof ProdutoFormValues, value: string) => {
      const nextForm = { ...form, [field]: value } as ProdutoFormValues
      setForm(nextForm)
      if (!validateProdutoField(field, nextForm)) {
        clearFieldError(field)
      }
    },
    [form, clearFieldError],
  )

  const handleNumberField = useCallback(
    (field: NumberFieldKey, raw: string, optional = false) => {
      setNumberDrafts((current) => ({ ...current, [field]: raw }))

      let nextValue: number | null
      if (optional && raw.trim() === '') {
        nextValue = null
      } else {
        nextValue = parseDraftNumber(raw)
      }

      setForm((current) => {
        const nextForm = { ...current, [field]: nextValue } as ProdutoFormValues
        if (!validateProdutoField(field, nextForm)) {
          queueMicrotask(() => clearFieldError(field))
        }
        return nextForm
      })
    },
    [clearFieldError],
  )

  const promptCreateLookup = useCallback(
    async (kind: ProdutoLookupKind) => {
      const label = LOOKUP_KIND_LABEL[kind]
      const nome = window.prompt(`Informe o nome d${kind === 'marca' ? 'a' : 'o'} ${label.toLowerCase()}:`)
      if (!nome?.trim()) return

      setLookupLoading((current) => ({ ...current, [kind]: true }))
      try {
        if (kind === 'categoria') {
          const created = await categoriaService.create({ nome: nome.trim(), cor: '#16a34a' })
          setCategorias([created, ...useProdutosStore.getState().categorias.filter((item) => item.id !== created.id)])
          setField('categoriaId', created.id)
          clearFieldError('categoriaId')
          return
        }

        const created = await produtoLookupServices[kind].create({ nome: nome.trim() })
        upsertLookup(kind, created)

        const fieldMap: Record<Exclude<ProdutoLookupKind, 'categoria'>, keyof ProdutoFormValues> = {
          marca: 'marcaId',
          fabricante: 'fabricanteId',
          linha: 'linhaId',
          colecao: 'colecaoId',
          modelo: 'modeloId',
          fornecedor: 'fornecedorPrincipalId',
        }
        const field = fieldMap[kind]
        setField(field, created.id as ProdutoFormValues[typeof field])
        if (field === 'marcaId') clearFieldError('marcaId')
      } catch (error) {
        window.alert(getProdutoSaveErrorMessage(error, `Erro ao cadastrar ${label.toLowerCase()}`))
      } finally {
        setLookupLoading((current) => ({ ...current, [kind]: false }))
      }
    },
    [clearFieldError, setCategorias, setField, upsertLookup],
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const errors = validateProdutoForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setTab(firstInvalidTab(errors))
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
      <button
        type="button"
        className={styles.drawerOverlay}
        onClick={isSaving ? undefined : onClose}
        aria-label="Fechar formulário"
        disabled={isSaving}
      />

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

        <div className={styles.progressBlock} aria-label="Progresso do cadastro">
          <div className={styles.progressMeta}>
            <span>Dados Gerais (obrigatórios)</span>
            <strong>{progresso}%</strong>
          </div>
          <p className={styles.progressRequiredHint}>
            Campos obrigatórios: Nome, Categoria, Marca, NCM e Preço de venda
          </p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progresso}%` }} />
          </div>
        </div>

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

        <form className={styles.drawerForm} onSubmit={handleSubmit}>
          <div className={styles.drawerBody}>
          {tab === 'geral' ? (
            <>
              <FormCard title="Tipo" icon={<Package size={14} />}>
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
              </FormCard>

              <FormCard title="Identificação" icon={<Layers3 size={14} />}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-codigo">Código / SKU</label>
                    <input
                      id="prod-codigo"
                      value={form.codigo}
                      onChange={(e) => handleTextField('codigo', e.target.value)}
                      placeholder="Gerado automaticamente se vazio"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-barras">Código de barras</label>
                    <input
                      id="prod-barras"
                      value={form.codigoBarras}
                      onChange={(e) => handleTextField('codigoBarras', e.target.value)}
                      onBlur={() => touchField('codigoBarras')}
                      placeholder="EAN / GTIN"
                      disabled={isSaving}
                    />
                    <FieldError message={fieldErrors.codigoBarras} />
                  </div>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-nome">Nome *</label>
                    <input
                      id="prod-nome"
                      value={form.nome}
                      onChange={(e) => handleTextField('nome', e.target.value)}
                      onBlur={() => touchField('nome')}
                      placeholder="Nome do produto ou serviço"
                      disabled={isSaving}
                      aria-invalid={Boolean(fieldErrors.nome)}
                    />
                    <FieldError message={fieldErrors.nome} />
                  </div>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-descricao">Descrição</label>
                    <textarea
                      id="prod-descricao"
                      value={form.descricao}
                      onChange={(e) => handleTextField('descricao', e.target.value)}
                      placeholder="Descrição comercial ou técnica"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-unidade">Unidade de medida</label>
                    <select
                      id="prod-unidade"
                      value={form.unidadeMedida}
                      onChange={(e) => setField('unidadeMedida', e.target.value as ProdutoFormValues['unidadeMedida'])}
                      disabled={isSaving}
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
                      disabled={isSaving}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="rascunho">Rascunho</option>
                    </select>
                  </div>
                </div>
              </FormCard>

              <FormCard title="Organização · Classificação Comercial" icon={<Building2 size={14} />}>
                <div className={styles.formGrid}>
                  <SearchableSelect
                    id="prod-categoria"
                    label="Categoria"
                    required
                    value={form.categoriaId}
                    options={categoriaOptions}
                    loading={lookupLoading.categoria}
                    placeholder="Buscar categoria"
                    error={fieldErrors.categoriaId}
                    disabled={isSaving}
                    onChange={(value) => {
                      setField('categoriaId', value)
                      if (value) clearFieldError('categoriaId')
                    }}
                    onBlur={() => touchField('categoriaId')}
                    onCreate={() => void promptCreateLookup('categoria')}
                  />
                  <SearchableSelect
                    id="prod-marca"
                    label="Marca"
                    required
                    value={form.marcaId}
                    options={marcas}
                    loading={lookupLoading.marca}
                    placeholder="Buscar marca"
                    error={fieldErrors.marcaId}
                    disabled={isSaving}
                    onChange={(value) => {
                      setField('marcaId', value)
                      if (value) clearFieldError('marcaId')
                    }}
                    onBlur={() => touchField('marcaId')}
                    onCreate={() => void promptCreateLookup('marca')}
                  />
                  <SearchableSelect
                    id="prod-fabricante"
                    label="Fabricante"
                    value={form.fabricanteId}
                    options={fabricantes}
                    loading={lookupLoading.fabricante}
                    placeholder="Buscar fabricante"
                    disabled={isSaving}
                    onChange={(value) => setField('fabricanteId', value)}
                    onCreate={() => void promptCreateLookup('fabricante')}
                  />
                  <SearchableSelect
                    id="prod-linha"
                    label="Linha"
                    value={form.linhaId}
                    options={linhas}
                    loading={lookupLoading.linha}
                    placeholder="Buscar linha"
                    disabled={isSaving}
                    onChange={(value) => setField('linhaId', value)}
                    onCreate={() => void promptCreateLookup('linha')}
                  />
                  <SearchableSelect
                    id="prod-colecao"
                    label="Coleção"
                    value={form.colecaoId}
                    options={colecoes}
                    loading={lookupLoading.colecao}
                    placeholder="Buscar coleção"
                    disabled={isSaving}
                    onChange={(value) => setField('colecaoId', value)}
                    onCreate={() => void promptCreateLookup('colecao')}
                  />
                  <SearchableSelect
                    id="prod-modelo"
                    label="Modelo"
                    value={form.modeloId}
                    options={modelos}
                    loading={lookupLoading.modelo}
                    placeholder="Buscar modelo"
                    disabled={isSaving}
                    onChange={(value) => setField('modeloId', value)}
                    onCreate={() => void promptCreateLookup('modelo')}
                  />
                  <SearchableSelect
                    id="prod-fornecedor"
                    label="Fornecedor Principal"
                    value={form.fornecedorPrincipalId}
                    options={fornecedores}
                    loading={lookupLoading.fornecedor}
                    placeholder="Buscar fornecedor"
                    disabled={isSaving}
                    onChange={(value) => setField('fornecedorPrincipalId', value)}
                    onCreate={() => void promptCreateLookup('fornecedor')}
                  />
                </div>
              </FormCard>
            </>
          ) : null}

          {tab === 'precos' ? (
            <FormCard title="Preços" icon={<Percent size={14} />}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="prod-custo">Preço de custo (R$)</label>
                  <FormNumberInput
                    id="prod-custo"
                    min={0}
                    step={0.01}
                    value={numberDrafts.precoCusto}
                    onChange={(raw) => handleNumberField('precoCusto', raw)}
                    disabled={isSaving}
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
                    onBlur={() => touchField('precoVenda')}
                    disabled={isSaving}
                  />
                  <FieldError message={fieldErrors.precoVenda} />
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
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className={styles.margemPreview}>
                <span>Margem de lucro estimada</span>
                <strong className={styles.margemValor} style={{ color: margem >= 30 ? '#15803d' : '#b45309' }}>
                  {margem.toFixed(1)}%
                </strong>
              </div>
            </FormCard>
          ) : null}

          {tab === 'fiscal' ? (
            <>
              <FormCard title="Tributação" icon={<FileStack size={14} />}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-ncm">NCM *</label>
                    <input
                      id="prod-ncm"
                      value={form.ncm}
                      onChange={(e) => handleTextField('ncm', ncmMask(e.target.value))}
                      onBlur={() => touchField('ncm')}
                      placeholder="0000.00.00"
                      inputMode="numeric"
                      disabled={isSaving}
                    />
                    <FieldError message={fieldErrors.ncm} />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cest">CEST</label>
                    <input
                      id="prod-cest"
                      value={form.cest}
                      onChange={(e) => handleTextField('cest', cestMask(e.target.value))}
                      placeholder="00.000.00"
                      inputMode="numeric"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-origem">Origem</label>
                    <select
                      id="prod-origem"
                      value={form.origem}
                      onChange={(e) => setField('origem', e.target.value as ProdutoFormValues['origem'])}
                      disabled={isSaving}
                    >
                      {Object.entries(ORIGEM_LABEL).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cfop">CFOP Padrão</label>
                    <input
                      id="prod-cfop"
                      value={form.cfop}
                      onChange={(e) => handleTextField('cfop', e.target.value)}
                      placeholder="5102"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cst">Situação Tributária</label>
                    <input
                      id="prod-cst"
                      value={form.cst}
                      onChange={(e) => handleTextField('cst', e.target.value)}
                      placeholder="000"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-beneficio">Código de Benefício Fiscal</label>
                    <input
                      id="prod-beneficio"
                      value={form.codigoBeneficioFiscal}
                      onChange={(e) => handleTextField('codigoBeneficioFiscal', e.target.value)}
                      placeholder="Opcional"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-anp">Código ANP</label>
                    <input
                      id="prod-anp"
                      value={form.codigoAnp}
                      onChange={(e) => handleTextField('codigoAnp', e.target.value)}
                      placeholder="Opcional"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </FormCard>

              <FormCard title="Impostos" icon={<Percent size={14} />}>
                <div className={styles.formGrid}>
                  {(
                    [
                      ['aliquotaIcms', 'ICMS (%)', 'prod-icms'],
                      ['aliquotaIpi', 'IPI (%)', 'prod-ipi'],
                      ['aliquotaPis', 'PIS (%)', 'prod-pis'],
                      ['aliquotaCofins', 'COFINS (%)', 'prod-cofins'],
                      ['aliquotaIss', 'ISS (%)', 'prod-iss'],
                      ['aliquotaFcp', 'FCP (%)', 'prod-fcp'],
                    ] as const
                  ).map(([field, label, id]) => (
                    <div key={field} className={styles.formField}>
                      <label htmlFor={id}>{label}</label>
                      <FormNumberInput
                        id={id}
                        min={0}
                        step={0.01}
                        value={numberDrafts[field]}
                        onChange={(raw) => handleNumberField(field, raw)}
                        disabled={isSaving}
                      />
                    </div>
                  ))}
                </div>
              </FormCard>
            </>
          ) : null}

          {tab === 'estoque' ? (
            <>
              <FormCard title="Controle de estoque" icon={<Warehouse size={14} />}>
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
                      disabled={isSaving}
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
                        disabled={isSaving}
                      />
                    </div>
                    <div className={styles.formField}>
                      <label htmlFor="prod-estoque-min">Estoque mínimo</label>
                      <FormNumberInput
                        id="prod-estoque-min"
                        min={0}
                        value={numberDrafts.estoqueMinimo}
                        onChange={(raw) => handleNumberField('estoqueMinimo', raw)}
                        disabled={isSaving}
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
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                ) : null}
              </FormCard>

              <FormCard title="Controle Logístico" icon={<Scale size={14} />}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-peso-liq">Peso Líquido</label>
                    <FormNumberInput
                      id="prod-peso-liq"
                      min={0}
                      step={0.001}
                      value={numberDrafts.pesoLiquido}
                      onChange={(raw) => handleNumberField('pesoLiquido', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-peso-bruto">Peso Bruto</label>
                    <FormNumberInput
                      id="prod-peso-bruto"
                      min={0}
                      step={0.001}
                      value={numberDrafts.pesoBruto}
                      onChange={(raw) => handleNumberField('pesoBruto', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-altura">Altura</label>
                    <FormNumberInput
                      id="prod-altura"
                      min={0}
                      step={0.01}
                      value={numberDrafts.altura}
                      onChange={(raw) => handleNumberField('altura', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-largura">Largura</label>
                    <FormNumberInput
                      id="prod-largura"
                      min={0}
                      step={0.01}
                      value={numberDrafts.largura}
                      onChange={(raw) => handleNumberField('largura', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-comprimento">Comprimento</label>
                    <FormNumberInput
                      id="prod-comprimento"
                      min={0}
                      step={0.01}
                      value={numberDrafts.comprimento}
                      onChange={(raw) => handleNumberField('comprimento', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-volume">Volume</label>
                    <FormNumberInput
                      id="prod-volume"
                      min={0}
                      step={0.01}
                      value={numberDrafts.volume}
                      onChange={(raw) => handleNumberField('volume', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-localizacao">Localização no Estoque</label>
                    <input
                      id="prod-localizacao"
                      value={form.localizacaoEstoque}
                      onChange={(e) => handleTextField('localizacaoEstoque', e.target.value)}
                      placeholder="Ex.: A-01-02"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-codigo-interno">Código Interno</label>
                    <input
                      id="prod-codigo-interno"
                      value={form.codigoInterno}
                      onChange={(e) => handleTextField('codigoInterno', e.target.value)}
                      placeholder="Opcional"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </FormCard>

              <FormCard title="Compra" icon={<ShoppingCart size={14} />}>
                <div className={styles.formGrid}>
                  <SearchableSelect
                    id="prod-fornecedor-compra"
                    label="Fornecedor Principal"
                    value={form.fornecedorPrincipalId}
                    options={fornecedores}
                    loading={lookupLoading.fornecedor}
                    placeholder="Buscar fornecedor"
                    disabled={isSaving}
                    onChange={(value) => setField('fornecedorPrincipalId', value)}
                    onCreate={() => void promptCreateLookup('fornecedor')}
                  />
                  <div className={styles.formField}>
                    <label htmlFor="prod-prazo-compra">Prazo Médio Compra</label>
                    <FormNumberInput
                      id="prod-prazo-compra"
                      min={0}
                      value={numberDrafts.prazoMedioCompra}
                      placeholder="Dias"
                      onChange={(raw) => handleNumberField('prazoMedioCompra', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-lote">Lote Econômico</label>
                    <FormNumberInput
                      id="prod-lote"
                      min={0}
                      value={numberDrafts.loteEconomico}
                      onChange={(raw) => handleNumberField('loteEconomico', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-qtd-min-compra">Quantidade Mínima Compra</label>
                    <FormNumberInput
                      id="prod-qtd-min-compra"
                      min={0}
                      value={numberDrafts.quantidadeMinimaCompra}
                      onChange={(raw) => handleNumberField('quantidadeMinimaCompra', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </FormCard>
            </>
          ) : null}

          {tab === 'complementos' ? (
            <>
              <FormCard title="Informações Comerciais" icon={<ShoppingCart size={14} />}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-garantia">Garantia</label>
                    <input
                      id="prod-garantia"
                      value={form.garantia}
                      onChange={(e) => handleTextField('garantia', e.target.value)}
                      placeholder="Ex.: 12 meses"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-comissao">Comissão %</label>
                    <FormNumberInput
                      id="prod-comissao"
                      min={0}
                      step={0.01}
                      value={numberDrafts.comissao}
                      onChange={(raw) => handleNumberField('comissao', raw, true)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cod-fab">Código do Fabricante</label>
                    <input
                      id="prod-cod-fab"
                      value={form.codigoFabricante}
                      onChange={(e) => handleTextField('codigoFabricante', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cod-ref">Código de Referência</label>
                    <input
                      id="prod-cod-ref"
                      value={form.codigoReferencia}
                      onChange={(e) => handleTextField('codigoReferencia', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-ean">EAN</label>
                    <input
                      id="prod-ean"
                      value={form.ean}
                      onChange={(e) => handleTextField('ean', e.target.value)}
                      onBlur={() => touchField('ean')}
                      disabled={isSaving}
                    />
                    <FieldError message={fieldErrors.ean} />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-gtin">GTIN Tributável</label>
                    <input
                      id="prod-gtin"
                      value={form.gtinTributavel}
                      onChange={(e) => handleTextField('gtinTributavel', e.target.value)}
                      onBlur={() => touchField('gtinTributavel')}
                      disabled={isSaving}
                    />
                    <FieldError message={fieldErrors.gtinTributavel} />
                  </div>
                </div>
              </FormCard>

              <FormCard title="Marketplace" icon={<Layers3 size={14} />}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="prod-sku-mkt">SKU Marketplace</label>
                    <input
                      id="prod-sku-mkt"
                      value={form.skuMarketplace}
                      onChange={(e) => handleTextField('skuMarketplace', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-titulo-mkt">Título Marketplace</label>
                    <input
                      id="prod-titulo-mkt"
                      value={form.tituloMarketplace}
                      onChange={(e) => handleTextField('tituloMarketplace', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-cat-mkt">Categoria Marketplace</label>
                    <input
                      id="prod-cat-mkt"
                      value={form.categoriaMarketplace}
                      onChange={(e) => handleTextField('categoriaMarketplace', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-marca-mkt">Marca Marketplace</label>
                    <input
                      id="prod-marca-mkt"
                      value={form.marcaMarketplace}
                      onChange={(e) => handleTextField('marcaMarketplace', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </FormCard>

              <FormCard title="Observações" icon={<FileStack size={14} />}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-obs-int">Observações Internas</label>
                    <textarea
                      id="prod-obs-int"
                      value={form.observacoesInternas}
                      onChange={(e) => handleTextField('observacoesInternas', e.target.value)}
                      placeholder="Notas internas da equipe"
                      disabled={isSaving}
                    />
                  </div>
                  <div className={`${styles.formField} ${styles.fieldFull}`}>
                    <label htmlFor="prod-obs-nf">Observações para Nota Fiscal</label>
                    <textarea
                      id="prod-obs-nf"
                      value={form.observacoesNotaFiscal}
                      onChange={(e) => handleTextField('observacoesNotaFiscal', e.target.value)}
                      placeholder="Texto adicional na NF"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </FormCard>

              <FormCard title="Arquivos" icon={<Upload size={14} />}>
                <div className={styles.uploadGrid}>
                  <ProdutoFileUpload
                    label="Imagem Principal"
                    accept="image/*"
                    value={form.imagemPrincipal}
                    onChange={(file) => setField('imagemPrincipal', file)}
                    disabled={isSaving}
                  />
                  <ProdutoFileUpload
                    label="Imagens Secundárias"
                    accept="image/*"
                    multiple
                    value={null}
                    values={form.imagensSecundarias}
                    onChange={() => undefined}
                    onChangeMultiple={(files) => setField('imagensSecundarias', files)}
                    disabled={isSaving}
                  />
                  <ProdutoFileUpload
                    label="Ficha Técnica (PDF)"
                    accept=".pdf,application/pdf"
                    value={form.fichaTecnica}
                    onChange={(file) => setField('fichaTecnica', file)}
                    disabled={isSaving}
                  />
                  <ProdutoFileUpload
                    label="Manual"
                    accept=".pdf,.doc,.docx"
                    value={form.manual}
                    onChange={(file) => setField('manual', file)}
                    disabled={isSaving}
                  />
                  <ProdutoFileUpload
                    label="Catálogo"
                    accept=".pdf,.doc,.docx"
                    value={form.catalogo}
                    onChange={(file) => setField('catalogo', file)}
                    disabled={isSaving}
                  />
                </div>
              </FormCard>
            </>
          ) : null}
          </div>

          <footer className={styles.drawerFooter}>
            <div className={styles.drawerFooterLeft}>
              <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSaving}>
                Cancelar
              </button>
              {prevTab ? (
                <button
                  type="button"
                  className={styles.btnTabNext}
                  onClick={() => setTab(prevTab.id)}
                  disabled={isSaving}
                >
                  ← {prevTab.label}
                </button>
              ) : null}
              {nextTab ? (
                <button
                  type="button"
                  className={styles.btnTabNext}
                  onClick={() => setTab(nextTab.id)}
                  disabled={isSaving}
                >
                  {nextTab.label} →
                </button>
              ) : null}
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={isSaving || !canSubmit}>
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
