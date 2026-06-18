import { useEffect, useMemo, useState } from 'react'
import { Box, Package, Wrench, X } from 'lucide-react'

import {
  EMPTY_PRODUTO_FORM,
  ORIGEM_LABEL,
  TIPO_PRODUTO_LABEL,
  UNIDADE_LABEL,
  calcularMargem,
} from '@/features/produtos/data/shared'
import { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
import type { Produto, ProdutoFormValues, TipoProduto } from '@/features/produtos/types'
import { produtoToFormValues } from '@/features/produtos/utils'
import styles from '@/pages/produtos/ProdutosPage.module.css'

type DrawerTab = 'geral' | 'precos' | 'fiscal' | 'estoque'

interface ProdutoDrawerProps {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  produto?: Produto | null
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

function parseNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function ProdutoDrawer({ open, onClose, mode = 'create', produto }: ProdutoDrawerProps) {
  const categorias = useProdutosStore((s) => s.categorias)
  const addProduto = useProdutosStore((s) => s.addProduto)
  const updateProduto = useProdutosStore((s) => s.updateProduto)

  const [tab, setTab] = useState<DrawerTab>('geral')
  const [form, setForm] = useState<ProdutoFormValues>(EMPTY_PRODUTO_FORM)
  const [erro, setErro] = useState('')

  const isEdit = mode === 'edit' && produto

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

  useEffect(() => {
    if (!open) return
    setTab('geral')
    setErro('')
    setForm(isEdit ? produtoToFormValues(produto) : EMPTY_PRODUTO_FORM)
  }, [open, isEdit, produto])

  const margem = useMemo(() => calcularMargem(form.precoCusto, form.precoVenda), [form.precoCusto, form.precoVenda])

  function setField<K extends keyof ProdutoFormValues>(field: K, value: ProdutoFormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
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

    if (isEdit) {
      updateProduto(produto.id, form)
    } else {
      addProduto(form)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar formulário" />

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
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
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
                  <input
                    id="prod-custo"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.precoCusto}
                    onChange={(e) => setField('precoCusto', parseNumber(e.target.value))}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-venda">Preço de venda (R$) *</label>
                  <input
                    id="prod-venda"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.precoVenda}
                    onChange={(e) => setField('precoVenda', parseNumber(e.target.value))}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-promo">Preço promocional (R$)</label>
                  <input
                    id="prod-promo"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.precoPromocional ?? ''}
                    onChange={(e) =>
                      setField('precoPromocional', e.target.value ? parseNumber(e.target.value) : null)
                    }
                    placeholder="Opcional"
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
                  <input
                    id="prod-icms"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.aliquotaIcms}
                    onChange={(e) => setField('aliquotaIcms', parseNumber(e.target.value))}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-pis">PIS (%)</label>
                  <input
                    id="prod-pis"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.aliquotaPis}
                    onChange={(e) => setField('aliquotaPis', parseNumber(e.target.value))}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="prod-cofins">COFINS (%)</label>
                  <input
                    id="prod-cofins"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.aliquotaCofins}
                    onChange={(e) => setField('aliquotaCofins', parseNumber(e.target.value))}
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
                    <input
                      id="prod-estoque-atual"
                      type="number"
                      min={0}
                      value={form.estoqueAtual}
                      onChange={(e) => setField('estoqueAtual', parseNumber(e.target.value))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-estoque-min">Estoque mínimo</label>
                    <input
                      id="prod-estoque-min"
                      type="number"
                      min={0}
                      value={form.estoqueMinimo}
                      onChange={(e) => setField('estoqueMinimo', parseNumber(e.target.value))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="prod-estoque-max">Estoque máximo</label>
                    <input
                      id="prod-estoque-max"
                      type="number"
                      min={0}
                      value={form.estoqueMaximo ?? ''}
                      onChange={(e) =>
                        setField('estoqueMaximo', e.target.value ? parseNumber(e.target.value) : null)
                      }
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              ) : null}
            </fieldset>
          ) : null}

          {erro ? <span className={styles.fieldError}>{erro}</span> : null}

          <footer className={styles.drawerFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {isEdit ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  )
}
