import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { LoadingButtonContent } from '@/components/ui/Loading'
import { CnpjConsultaStatus } from '@/features/clientes/components/CnpjConsultaStatus'
import { useCnpjConsulta } from '@/features/clientes/hooks/useCnpjConsulta'
import { useClientesQuery } from '@/features/clientes/hooks/useClientes'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { Cliente } from '@/features/clientes/types'
import { filterClientesByNome } from '@/features/clientes/utils'
import { useProdutosQuery } from '@/features/produtos/hooks/useProdutos'
import { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
import type { Produto } from '@/features/produtos/types'
import { filterProdutosByBusca } from '@/features/produtos/utils'
import { CondicaoPagamentoFields } from '@/features/vendas/components/CondicaoPagamentoFields'
import {
  FORMA_PAGAMENTO_LABEL,
  calcularSubtotalItem,
  formatarMoeda,
} from '@/features/vendas/data/shared'
import type { FormaPagamento, ItemPedido, PedidoFormValues } from '@/features/vendas/types'
import { CONFIG_FORMA, defaultDiasVencimento } from '@/features/vendas/utils/pagamento'
import {
  getCnpjSaveBlockMessage,
  isCnpjComplete,
  isCnpjSaveBlocked,
  isCnpjVerifiedForSave,
} from '@/services/opencnpj.service'
import { documentoMask, isCnpjDocument } from '@/utils/masks'
import styles from '@/pages/vendas/VendasPage.module.css'

interface PedidoDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: PedidoFormValues) => void | Promise<void>
  mode?: 'create' | 'edit'
  initialValues?: Partial<PedidoFormValues>
  isSaving?: boolean
}

type DrawerTab = 'dados' | 'pagamento' | 'itens'

function itemVazio(): Omit<ItemPedido, 'id'> {
  return {
    produtoId: '',
    descricao: '',
    quantidade: 1,
    valorUnitario: 0,
    desconto: 0,
    tipoDesconto: 'percentual',
    subtotal: 0,
  }
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconCard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function formatClienteLookupDescription(cliente: Cliente): string {
  const partes: string[] = []

  if (cliente.nomeFantasia && cliente.nomeFantasia !== cliente.nome) {
    partes.push(cliente.nomeFantasia)
  }

  partes.push(cliente.documento, `${cliente.cidade}/${cliente.estado}`, cliente.condicaoPagamentoDescricao)

  return partes.join(' · ')
}

function formatProdutoLookupDescription(produto: Produto): string {
  const partes = [produto.codigo]

  if (produto.categoriaNome) partes.push(produto.categoriaNome)

  partes.push(
    formatarMoeda(produto.precoPromocional ?? produto.precoVenda),
    produto.unidadeMedida.toUpperCase(),
  )

  return partes.join(' · ')
}

function precoVendaProduto(produto: Produto): number {
  return produto.precoPromocional ?? produto.precoVenda
}

function quantidadeToDraft(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return String(value)
}

function parseQuantidadeDraft(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return 0
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

interface ItemQuantidadeInputProps {
  quantidade: number
  onChange: (quantidade: number) => void
}

function ItemQuantidadeInput({ quantidade, onChange }: ItemQuantidadeInputProps) {
  const [draft, setDraft] = useState(() => quantidadeToDraft(quantidade))

  useEffect(() => {
    setDraft(quantidadeToDraft(quantidade))
  }, [quantidade])

  return (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      placeholder="1"
      value={draft}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        onChange(parseQuantidadeDraft(raw))
      }}
      className={styles.itemInput}
    />
  )
}

interface ItemProdutoLookupFieldProps {
  descricao: string
  produtos: Produto[]
  getProdutoByNome: (nome: string) => Produto | undefined
  onDescricaoChange: (descricao: string) => void
  onApplyProduto: (produto: Produto) => void
  onClearProduto: () => void
}

function ItemProdutoLookupField({
  descricao,
  produtos,
  getProdutoByNome,
  onDescricaoChange,
  onApplyProduto,
  onClearProduto,
}: ItemProdutoLookupFieldProps) {
  const [lookupOpen, setLookupOpen] = useState(false)
  const lookupRef = useRef<HTMLDivElement>(null)
  const produtosListId = useId()
  const lastAppliedProdutoIdRef = useRef('')

  const produtosAtivos = useMemo(
    () => produtos.filter((produto) => produto.status === 'ativo'),
    [produtos],
  )

  const produtosFiltrados = useMemo(() => {
    const termo = descricao.trim()
    const base =
      termo.length >= 2
        ? filterProdutosByBusca(produtosAtivos, termo)
        : produtosAtivos

    return [...base].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, 8)
  }, [descricao, produtosAtivos])

  function aplicarProduto(produto: Produto) {
    onApplyProduto(produto)
    lastAppliedProdutoIdRef.current = produto.id
  }

  function limparProdutoCadastrado() {
    onClearProduto()
    lastAppliedProdutoIdRef.current = ''
  }

  function selecionarProduto(produto: Produto) {
    aplicarProduto(produto)
    setLookupOpen(false)
  }

  useEffect(() => {
    const termo = descricao.trim()
    if (termo.length < 2) {
      if (lastAppliedProdutoIdRef.current) limparProdutoCadastrado()
      return
    }

    const produto = getProdutoByNome(descricao)
    if (produto) {
      if (lastAppliedProdutoIdRef.current === produto.id) return
      aplicarProduto(produto)
      return
    }

    if (lastAppliedProdutoIdRef.current) limparProdutoCadastrado()
  }, [descricao, getProdutoByNome])

  useEffect(() => {
    if (!lookupOpen) return undefined

    function handleClickOutside(event: MouseEvent) {
      if (!lookupRef.current?.contains(event.target as Node)) {
        setLookupOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setLookupOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [lookupOpen])

  return (
    <div ref={lookupRef} className={`${styles.clienteLookupWrap} ${styles.itemProdutoLookupWrap}`}>
      <input
        type="text"
        placeholder="Digite ou selecione o produto cadastrado"
        value={descricao}
        role="combobox"
        aria-controls={produtosListId}
        aria-expanded={lookupOpen}
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(e) => {
          onDescricaoChange(e.target.value)
          setLookupOpen(true)
        }}
        onFocus={() => setLookupOpen(true)}
        className={styles.itemInput}
      />

      {lookupOpen && produtosFiltrados.length > 0 ? (
        <ul id={produtosListId} className={styles.clienteLookupResults} role="listbox">
          {produtosFiltrados.map((produto) => (
            <li key={produto.id} role="option">
              <button
                type="button"
                className={styles.clienteLookupResult}
                onClick={() => selecionarProduto(produto)}
              >
                <span className={styles.clienteLookupResultLabel}>{produto.nome}</span>
                <span className={styles.clienteLookupResultDescription}>
                  {formatProdutoLookupDescription(produto)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lookupOpen && descricao.trim().length >= 2 && produtosFiltrados.length === 0 ? (
        <div className={styles.clienteLookupEmpty}>Nenhum produto encontrado</div>
      ) : null}
    </div>
  )
}

export function PedidoDrawer({
  open,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues,
  isSaving = false,
}: PedidoDrawerProps) {
  useClientesQuery()
  useProdutosQuery()

  const [tab, setTab] = useState<DrawerTab>('dados')
  const [clienteNome, setClienteNome] = useState(initialValues?.clienteNome ?? '')
  const [clienteDocumento, setClienteDocumento] = useState(initialValues?.clienteDocumento ?? '')
  const [vendedorNome, setVendedorNome] = useState(initialValues?.vendedorNome ?? '')
  const [dataEntrega, setDataEntrega] = useState(initialValues?.dataEntregaIso?.slice(0, 10) ?? '')
  const [observacao, setObservacao] = useState(initialValues?.observacao ?? '')
  const [clienteFormaPref, setClienteFormaPref] = useState<FormaPagamento | ''>(
    initialValues?.clienteFormaPagamentoPreferida ?? '',
  )
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    initialValues?.formaPagamento ?? 'boleto',
  )
  const [parcelas, setParcelas] = useState(initialValues?.parcelas ?? 1)
  const [taxaMensal, setTaxaMensal] = useState(initialValues?.taxaJurosMensal ?? 0)
  const [diasVencimento, setDiasVencimento] = useState<number[]>(
    initialValues?.diasVencimento ?? defaultDiasVencimento(initialValues?.parcelas ?? 1, initialValues?.formaPagamento ?? 'boleto'),
  )
  const [itens, setItens] = useState<Omit<ItemPedido, 'id'>[]>(initialValues?.itens ?? [itemVazio()])
  const [frete, setFrete] = useState(initialValues?.frete ?? 0)
  const [jurosAdicionais, setJurosAdicionais] = useState(initialValues?.jurosAdicionais ?? 0)
  const [descontoAdicional, setDescontoAdicional] = useState(initialValues?.descontoAdicional ?? 0)
  const [multa, setMulta] = useState(initialValues?.multa ?? 0)
  const [documentoError, setDocumentoError] = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)
  const [clienteId, setClienteId] = useState(initialValues?.clienteId ?? '')
  const [clienteLookupOpen, setClienteLookupOpen] = useState(false)

  const clientesListId = useId()
  const clienteLookupRef = useRef<HTMLDivElement>(null)
  const getClienteByNome = useClientesStore((state) => state.getClienteByNome)
  const clientesCadastrados = useClientesStore((state) => state.clientes)
  const getProdutoByNome = useProdutosStore((state) => state.getProdutoByNome)
  const produtosCadastrados = useProdutosStore((state) => state.produtos)

  const clientesFiltrados = useMemo(() => {
    const termo = clienteNome.trim()
    const base =
      termo.length >= 2
        ? filterClientesByNome(clientesCadastrados, termo)
        : clientesCadastrados

    return [...base].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, 8)
  }, [clienteNome, clientesCadastrados])

  const isCnpj = isCnpjDocument(clienteDocumento)
  const cnpjConsulta = useCnpjConsulta(clienteDocumento, isCnpj)
  const isCnpjSaveDisabled =
    !clienteEncontrado && isCnpjSaveBlocked(clienteDocumento, cnpjConsulta, isCnpj)

  const subtotal = itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0)
  const descontoTotal = itens.reduce(
    (acc, item) => acc + (item.quantidade * item.valorUnitario - item.subtotal),
    0,
  )
  const total =
    subtotal - descontoTotal + frete + jurosAdicionais - descontoAdicional + multa

  const prevFormaRef = useRef(formaPagamento)
  const lastAppliedClienteIdRef = useRef('')

  function limparClienteCadastrado() {
    setClienteEncontrado(null)
    setClienteId('')
    setClienteFormaPref('')
    setClienteDocumento('')
    lastAppliedClienteIdRef.current = ''
  }

  function aplicarCliente(cliente: Cliente) {
    setClienteEncontrado(cliente)
    setClienteId(cliente.id)
    setClienteNome(cliente.nome)
    setClienteDocumento(cliente.documento)
    setClienteFormaPref(cliente.formaPagamentoPreferida)
    prevFormaRef.current = cliente.formaPagamentoPreferida
    setFormaPagamento(cliente.formaPagamentoPreferida)
    setParcelas(cliente.parcelasPreferidas)
    setTaxaMensal(cliente.taxaJurosMensalPreferida)
    setDiasVencimento(
      cliente.diasVencimentoPreferidos.length > 0
        ? cliente.diasVencimentoPreferidos
        : defaultDiasVencimento(cliente.parcelasPreferidas, cliente.formaPagamentoPreferida),
    )
    lastAppliedClienteIdRef.current = cliente.id
  }

  function selecionarCliente(cliente: Cliente) {
    aplicarCliente(cliente)
    setClienteLookupOpen(false)
  }

  useEffect(() => {
    if (!open) setClienteLookupOpen(false)
  }, [open])

  useEffect(() => {
    if (!open || !clienteLookupOpen) return undefined

    function handleClickOutside(event: MouseEvent) {
      if (!clienteLookupRef.current?.contains(event.target as Node)) {
        setClienteLookupOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setClienteLookupOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, clienteLookupOpen])

  useEffect(() => {
    if (prevFormaRef.current === formaPagamento) return
    prevFormaRef.current = formaPagamento
    const primeiraOpcao = CONFIG_FORMA[formaPagamento].opcoesParcelas[0]
    setParcelas(primeiraOpcao.parcelas)
    setTaxaMensal(primeiraOpcao.taxaMensal)
    setDiasVencimento(defaultDiasVencimento(primeiraOpcao.parcelas, formaPagamento))
  }, [formaPagamento])

  useEffect(() => {
    const termo = clienteNome.trim()
    if (termo.length < 2) {
      if (lastAppliedClienteIdRef.current) limparClienteCadastrado()
      return
    }

    const cliente = getClienteByNome(clienteNome)
    if (cliente) {
      if (lastAppliedClienteIdRef.current === cliente.id) return
      aplicarCliente(cliente)
      return
    }

    if (lastAppliedClienteIdRef.current) limparClienteCadastrado()
  }, [clienteNome, getClienteByNome])

  useEffect(() => {
    if (!isCnpj) {
      setDocumentoError('')
      return
    }

    if (isCnpjVerifiedForSave(cnpjConsulta)) {
      setDocumentoError('')
      return
    }

    if (cnpjConsulta.status === 'not_found' && isCnpjComplete(clienteDocumento)) {
      setDocumentoError(getCnpjSaveBlockMessage(cnpjConsulta))
      return
    }

    if (cnpjConsulta.status === 'error' && isCnpjComplete(clienteDocumento)) {
      setDocumentoError(getCnpjSaveBlockMessage(cnpjConsulta))
      return
    }

    setDocumentoError('')
  }, [isCnpj, cnpjConsulta, clienteDocumento])

  useEffect(() => {
    if (!open) return undefined
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose()
    }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [open, isSaving, onClose])

  function handleOpcaoParcela(p: number, t: number) {
    setParcelas(p)
    setTaxaMensal(t)
    setDiasVencimento(defaultDiasVencimento(p, formaPagamento))
  }

  function atualizarItem(idx: number, campo: keyof Omit<ItemPedido, 'id'>, valor: string | number) {
    setItens((prev) => {
      const next = [...prev]
      const item = { ...next[idx], [campo]: valor }
      item.subtotal = calcularSubtotalItem(
        item.quantidade,
        item.valorUnitario,
        item.desconto,
        item.tipoDesconto,
      )
      next[idx] = item
      return next
    })
  }

  function aplicarProdutoNoItem(idx: number, produto: Produto) {
    setItens((prev) => {
      const next = [...prev]
      const item = {
        ...next[idx],
        produtoId: produto.id,
        descricao: produto.nome,
        valorUnitario: precoVendaProduto(produto),
      }
      item.subtotal = calcularSubtotalItem(
        item.quantidade,
        item.valorUnitario,
        item.desconto,
        item.tipoDesconto,
      )
      next[idx] = item
      return next
    })
  }

  function limparProdutoNoItem(idx: number) {
    setItens((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], produtoId: '' }
      return next
    })
  }

  const formValidation = useMemo(() => {
    const errors = {
      cliente: '',
      documento: '',
      itens: '',
    }

    if (clienteNome.trim() && !clienteId) {
      errors.cliente = 'Selecione um cliente cadastrado para criar o pedido.'
    }

    if (documentoError) {
      errors.documento = documentoError
    } else if (isCnpjSaveDisabled && !clienteEncontrado) {
      errors.documento = getCnpjSaveBlockMessage(cnpjConsulta)
    }

    const itensIncompletos = itens.some((item) => !item.produtoId)
    const itensComConteudo = itens.some(
      (item) => item.descricao.trim() || item.valorUnitario > 0 || Boolean(item.produtoId),
    )

    if (itensIncompletos && itensComConteudo) {
      errors.itens = 'Selecione um produto cadastrado para cada item do pedido.'
    }

    const hasFieldErrors = Boolean(errors.cliente || errors.documento || errors.itens)
    const hasInvalidItens =
      itens.length === 0 ||
      itens.some((item) => !item.produtoId) ||
      itens.some((item) => item.quantidade <= 0) ||
      itens.every((item) => item.subtotal === 0)

    const submitDisabled =
      isSaving ||
      !clienteNome.trim() ||
      !clienteId ||
      isCnpjSaveDisabled ||
      hasInvalidItens ||
      hasFieldErrors

    return { errors, hasFieldErrors, submitDisabled }
  }, [
    clienteNome,
    clienteId,
    clienteEncontrado,
    cnpjConsulta,
    documentoError,
    isCnpjSaveDisabled,
    isSaving,
    itens,
  ])

  async function handleSubmit() {
    if (formValidation.submitDisabled) {
      if (formValidation.errors.cliente || formValidation.errors.documento) {
        setTab('dados')
      } else if (formValidation.errors.itens || itens.some((item) => !item.produtoId)) {
        setTab('itens')
      }
      return
    }

    try {
      await onSubmit({
        clienteId,
        clienteNome: clienteNome.trim(),
        clienteDocumento: clienteDocumento.trim(),
        clienteFormaPagamentoPreferida: clienteFormaPref,
        vendedorId: vendedorNome ? `v_${vendedorNome.replace(/\s/g, '_').toLowerCase()}` : '',
        vendedorNome: vendedorNome.trim(),
        formaPagamento,
        parcelas,
        taxaJurosMensal: taxaMensal,
        diasVencimento,
        dataEntregaIso: dataEntrega ? new Date(dataEntrega).toISOString() : '',
        itens,
        frete,
        jurosAdicionais,
        descontoAdicional,
        multa,
        observacao: observacao.trim(),
      })
    } catch {
      // Erro tratado pela página (toast).
    }
  }

  if (!open) return null

  const { errors: fieldErrors, submitDisabled } = formValidation

  return (
    <div className={styles.drawerRoot}>
      <button
        type="button"
        className={styles.drawerOverlay}
        onClick={isSaving ? undefined : onClose}
        aria-label="Fechar"
        disabled={isSaving}
      />
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>
              {mode === 'create' ? 'Novo pedido de venda' : 'Editar pedido'}
            </h2>
            <p className={styles.drawerSubtitle}>
              {mode === 'create'
                ? 'Preencha os dados, itens e condições de pagamento'
                : 'Atualize as informações do pedido'}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar" disabled={isSaving}>
            <IconX />
          </button>
        </div>

        <div className={styles.drawerTabs}>
          {(
            [
              { id: 'dados', label: '1. Cliente' },
              { id: 'itens', label: '2. Itens' },
              { id: 'pagamento', label: '3. Pagamento' },
            ] as { id: DrawerTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.drawerTab} ${tab === t.id ? styles.drawerTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.drawerBody}>
          {tab === 'dados' ? (
            <>
              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Cliente</legend>
                <div className={styles.formGrid}>
                  <div
                    ref={clienteLookupRef}
                    className={`${styles.formField} ${styles.fieldFull} ${styles.clienteLookupWrap}`}
                  >
                    <label htmlFor="pedido-cliente-nome">Nome / Razão social *</label>
                    <input
                      id="pedido-cliente-nome"
                      type="text"
                      placeholder="Digite ou selecione o cliente cadastrado"
                      value={clienteNome}
                      role="combobox"
                      aria-controls={clientesListId}
                      aria-expanded={clienteLookupOpen}
                      aria-autocomplete="list"
                      autoComplete="off"
                      onChange={(e) => {
                        setClienteNome(e.target.value)
                        setClienteLookupOpen(true)
                      }}
                      onFocus={() => setClienteLookupOpen(true)}
                    />

                    {clienteLookupOpen && clientesFiltrados.length > 0 ? (
                      <ul id={clientesListId} className={styles.clienteLookupResults} role="listbox">
                        {clientesFiltrados.map((cliente) => (
                          <li key={cliente.id} role="option">
                            <button
                              type="button"
                              className={styles.clienteLookupResult}
                              onClick={() => selecionarCliente(cliente)}
                            >
                              <span className={styles.clienteLookupResultLabel}>{cliente.nome}</span>
                              <span className={styles.clienteLookupResultDescription}>
                                {formatClienteLookupDescription(cliente)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {clienteLookupOpen && clienteNome.trim().length >= 2 && clientesFiltrados.length === 0 ? (
                      <div className={styles.clienteLookupEmpty}>Nenhum cliente encontrado</div>
                    ) : null}
                    {fieldErrors.cliente ? <span className={styles.fieldError}>{fieldErrors.cliente}</span> : null}
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-cliente-doc">{isCnpj ? 'CNPJ' : 'CPF / CNPJ'}</label>
                    <input
                      id="pedido-cliente-doc"
                      type="text"
                      inputMode="numeric"
                      placeholder={isCnpj ? '00.000.000/0001-00' : '000.000.000-00'}
                      value={clienteDocumento}
                      onChange={(e) => setClienteDocumento(documentoMask(e.target.value))}
                      readOnly={!!clienteEncontrado}
                    />
                    {fieldErrors.documento ? <span className={styles.fieldError}>{fieldErrors.documento}</span> : null}
                    {isCnpj ? <CnpjConsultaStatus result={cnpjConsulta} /> : null}
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-vendedor">Vendedor</label>
                    <input
                      id="pedido-vendedor"
                      type="text"
                      placeholder="Nome do vendedor"
                      value={vendedorNome}
                      onChange={(e) => setVendedorNome(e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-entrega">Previsão de entrega</label>
                    <input
                      id="pedido-entrega"
                      type="date"
                      value={dataEntrega}
                      onChange={(e) => setDataEntrega(e.target.value)}
                    />
                  </div>
                </div>

                {clienteEncontrado ? (
                  <div className={styles.clientePrefBanner}>
                    <span className={styles.clientePrefIcon}>
                      <IconUser />
                    </span>
                    <p className={styles.clientePrefText}>
                      Cliente cadastrado encontrado pelo nome: <strong>{clienteEncontrado.nome}</strong>.
                      Documento e condição de pagamento foram carregados do cadastro.
                      Forma preferida: <strong>{FORMA_PAGAMENTO_LABEL[clienteEncontrado.formaPagamentoPreferida]}</strong>.
                      Condição: <strong>{clienteEncontrado.condicaoPagamentoDescricao}</strong>.
                    </p>
                  </div>
                ) : null}
              </fieldset>

              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Observações</legend>
                <div className={styles.formField}>
                  <textarea
                    placeholder="Informações adicionais sobre o pedido…"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </fieldset>

              <button type="button" className={styles.btnTabNext} onClick={() => setTab('itens')}>
                Próximo: Itens →
              </button>
            </>
          ) : null}

          {tab === 'itens' ? (
            <>
              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Itens do pedido</legend>

                {itens.length > 0 ? (
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemHeaderLabel}>Produto / Serviço</span>
                    <span className={styles.itemHeaderLabel}>Qtd</span>
                    <span className={styles.itemHeaderLabel}>Vlr unit.</span>
                    <span className={styles.itemHeaderLabel}>Desc. %</span>
                    <span />
                  </div>
                ) : null}

                <div className={styles.itensList}>
                  {itens.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <ItemProdutoLookupField
                        descricao={item.descricao}
                        produtos={produtosCadastrados}
                        getProdutoByNome={getProdutoByNome}
                        onDescricaoChange={(descricao) => atualizarItem(idx, 'descricao', descricao)}
                        onApplyProduto={(produto) => aplicarProdutoNoItem(idx, produto)}
                        onClearProduto={() => limparProdutoNoItem(idx)}
                      />
                      <ItemQuantidadeInput
                        quantidade={item.quantidade}
                        onChange={(quantidade) => atualizarItem(idx, 'quantidade', quantidade)}
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        value={item.valorUnitario || ''}
                        onChange={(e) => atualizarItem(idx, 'valorUnitario', Number(e.target.value))}
                        className={styles.itemInput}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        value={item.desconto || ''}
                        onChange={(e) => atualizarItem(idx, 'desconto', Number(e.target.value))}
                        className={styles.itemInput}
                      />
                      <button
                        type="button"
                        className={styles.btnRemoveItem}
                        onClick={() => setItens((prev) => prev.filter((_, i) => i !== idx))}
                        title="Remover"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className={styles.btnAddItem}
                    onClick={() => setItens((prev) => [...prev, itemVazio()])}
                  >
                    <IconPlus /> Adicionar item
                  </button>
                </div>
                {fieldErrors.itens ? <span className={styles.fieldError}>{fieldErrors.itens}</span> : null}
              </fieldset>

              <fieldset className={styles.formSection}>
                <legend className={styles.formLegend}>Acréscimos e descontos do pedido</legend>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-frete">Frete (R$)</label>
                    <input
                      id="pedido-frete"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={frete || ''}
                      onChange={(e) => setFrete(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-juros-adicionais">Juros / Encargos (R$)</label>
                    <input
                      id="pedido-juros-adicionais"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={jurosAdicionais || ''}
                      onChange={(e) => setJurosAdicionais(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-desconto-adicional">Desconto global (R$)</label>
                    <input
                      id="pedido-desconto-adicional"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={descontoAdicional || ''}
                      onChange={(e) => setDescontoAdicional(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="pedido-multa">Multa (R$)</label>
                    <input
                      id="pedido-multa"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={multa || ''}
                      onChange={(e) => setMulta(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </fieldset>

              {subtotal > 0 ? (
                <div className={styles.drawerResumo}>
                  <div className={styles.drawerResumoRow}>
                    <span>Subtotal dos itens</span>
                    <strong>{formatarMoeda(subtotal)}</strong>
                  </div>
                  {descontoTotal > 0 ? (
                    <div className={styles.drawerResumoRow}>
                      <span>Descontos nos itens</span>
                      <strong className={styles.descontoValor}>− {formatarMoeda(descontoTotal)}</strong>
                    </div>
                  ) : null}
                  {frete > 0 ? (
                    <div className={styles.drawerResumoRow}>
                      <span>Frete</span>
                      <strong>{formatarMoeda(frete)}</strong>
                    </div>
                  ) : null}
                  {jurosAdicionais > 0 ? (
                    <div className={styles.drawerResumoRow}>
                      <span>Juros / Encargos</span>
                      <strong className={styles.jurosValor}>{formatarMoeda(jurosAdicionais)}</strong>
                    </div>
                  ) : null}
                  {descontoAdicional > 0 ? (
                    <div className={styles.drawerResumoRow}>
                      <span>Desconto global</span>
                      <strong className={styles.descontoValor}>− {formatarMoeda(descontoAdicional)}</strong>
                    </div>
                  ) : null}
                  {multa > 0 ? (
                    <div className={styles.drawerResumoRow}>
                      <span>Multa</span>
                      <strong className={styles.jurosValor}>{formatarMoeda(multa)}</strong>
                    </div>
                  ) : null}
                  <div className={`${styles.drawerResumoRow} ${styles.drawerResumoTotal}`}>
                    <span>Total do pedido</span>
                    <strong>{formatarMoeda(total)}</strong>
                  </div>
                </div>
              ) : null}

              <button type="button" className={styles.btnTabNext} onClick={() => setTab('pagamento')}>
                Próximo: Pagamento →
              </button>
            </>
          ) : null}

          {tab === 'pagamento' ? (
            <>
              {clienteEncontrado ? (
                <div className={styles.clientePrefBanner}>
                  <span className={styles.clientePrefIcon}>
                    <IconCard />
                  </span>
                  <p className={styles.clientePrefText}>
                    Condição preferencial do cadastro:
                    <strong> {clienteEncontrado.condicaoPagamentoDescricao}</strong>
                    ({FORMA_PAGAMENTO_LABEL[clienteEncontrado.formaPagamentoPreferida]}).
                    Você pode ajustar abaixo se necessário.
                  </p>
                </div>
              ) : null}

              <CondicaoPagamentoFields
                formaPagamento={formaPagamento}
                parcelas={parcelas}
                taxaMensal={taxaMensal}
                diasVencimento={diasVencimento}
                total={total}
                formaPreferida={clienteFormaPref}
                onFormaChange={setFormaPagamento}
                onOpcaoChange={handleOpcaoParcela}
                onDiasVencimentoChange={setDiasVencimento}
                showResumo={total > 0}
                showCronograma={total > 0}
              />

              {total <= 0 ? (
                <p className={styles.formHint}>
                  Adicione itens na aba anterior para calcular o resumo financeiro e o cronograma de
                  vencimentos com valores reais.
                </p>
              ) : null}
            </>
          ) : null}
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => void handleSubmit()}
            disabled={submitDisabled}
          >
            <LoadingButtonContent
              loading={isSaving}
              loadingLabel={mode === 'create' ? 'Criando...' : 'Salvando...'}
              idleLabel={mode === 'create' ? 'Criar orçamento' : 'Salvar alterações'}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
