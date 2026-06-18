import { useEffect, useState } from 'react'

import { CnpjConsultaStatus } from '@/features/clientes/components/CnpjConsultaStatus'
import { useCnpjConsulta } from '@/features/clientes/hooks/useCnpjConsulta'
import {
  FORMA_PAGAMENTO_LABEL,
  calcularSubtotalItem,
  formatarMoeda,
} from '@/features/vendas/data/shared'
import type { FormaPagamento, ItemPedido, PedidoFormValues } from '@/features/vendas/types'
import {
  getCnpjSaveBlockMessage,
  isCnpjComplete,
  isCnpjVerifiedForSave,
} from '@/services/opencnpj.service'
import { documentoMask, isCnpjDocument } from '@/utils/masks'
import styles from '@/pages/vendas/VendasPage.module.css'

interface PedidoDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: PedidoFormValues) => void
  mode?: 'create' | 'edit'
  initialValues?: Partial<PedidoFormValues>
}

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

export function PedidoDrawer({ open, onClose, onSubmit, mode = 'create', initialValues }: PedidoDrawerProps) {
  const [clienteNome, setClienteNome] = useState(initialValues?.clienteNome ?? '')
  const [clienteDocumento, setClienteDocumento] = useState(initialValues?.clienteDocumento ?? '')
  const [vendedorNome, setVendedorNome] = useState(initialValues?.vendedorNome ?? '')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    initialValues?.formaPagamento ?? 'boleto',
  )
  const [condicaoPagamento, setCondicaoPagamento] = useState(initialValues?.condicaoPagamento ?? '')
  const [dataEntrega, setDataEntrega] = useState(
    initialValues?.dataEntregaIso ? initialValues.dataEntregaIso.slice(0, 10) : '',
  )
  const [observacao, setObservacao] = useState(initialValues?.observacao ?? '')
  const [itens, setItens] = useState<Omit<ItemPedido, 'id'>[]>(
    initialValues?.itens ?? [itemVazio()],
  )
  const [documentoError, setDocumentoError] = useState('')

  const isCnpj = isCnpjDocument(clienteDocumento)
  const cnpjConsulta = useCnpjConsulta(clienteDocumento, isCnpj)
  const isCnpjSaveBlocked =
    isCnpj && isCnpjComplete(clienteDocumento) && !isCnpjVerifiedForSave(cnpjConsulta)

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

    setDocumentoError('')
  }, [isCnpj, cnpjConsulta, clienteDocumento])

  if (!open) return null

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

  function adicionarItem() {
    setItens((prev) => [...prev, itemVazio()])
  }

  function removerItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0)
  const descontoTotal = itens.reduce((acc, i) => {
    const bruto = i.quantidade * i.valorUnitario
    return acc + (bruto - i.subtotal)
  }, 0)
  const total = subtotal - descontoTotal

  function handleSubmit() {
    if (!clienteNome.trim()) return

    if (isCnpj && isCnpjComplete(clienteDocumento) && !isCnpjVerifiedForSave(cnpjConsulta)) {
      setDocumentoError(getCnpjSaveBlockMessage(cnpjConsulta))
      return
    }

    onSubmit({
      clienteId: `c_${clienteDocumento.replace(/\D/g, '')}`,
      clienteNome: clienteNome.trim(),
      clienteDocumento: clienteDocumento.trim(),
      vendedorId: vendedorNome ? `v_${vendedorNome.replace(/\s/g, '_').toLowerCase()}` : '',
      vendedorNome: vendedorNome.trim(),
      formaPagamento,
      condicaoPagamento: condicaoPagamento.trim(),
      dataEntregaIso: dataEntrega ? new Date(dataEntrega).toISOString() : '',
      itens,
      observacao: observacao.trim(),
    })
  }

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>
              {mode === 'create' ? 'Novo pedido de venda' : 'Editar pedido'}
            </h2>
            <p className={styles.drawerSubtitle}>
              {mode === 'create'
                ? 'Preencha os dados para criar um orçamento ou pedido'
                : 'Atualize as informações do pedido'}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <IconX />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Cliente</legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.fieldFull}`}>
                <label htmlFor="pedido-cliente-nome">Nome / Razão social *</label>
                <input
                  id="pedido-cliente-nome"
                  type="text"
                  placeholder="Nome do cliente"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="pedido-cliente-doc">{isCnpj ? 'CNPJ' : 'CPF / CNPJ'}</label>
                <input
                  id="pedido-cliente-doc"
                  type="text"
                  inputMode="numeric"
                  placeholder={isCnpj ? '00.000.000/0001-00' : '000.000.000-00'}
                  value={clienteDocumento}
                  onChange={(event) => setClienteDocumento(documentoMask(event.target.value))}
                />
                {documentoError ? <span className={styles.fieldError}>{documentoError}</span> : null}
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
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Condições comerciais</legend>

            <p className={styles.formHint}>Forma de pagamento</p>
            <div className={styles.formaPagamentoGrid}>
              {(Object.entries(FORMA_PAGAMENTO_LABEL) as [FormaPagamento, string][]).map(([k, v]) => (
                <label
                  key={k}
                  className={`${styles.formaPagamentoOption} ${formaPagamento === k ? styles.formaPagamentoOptionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="formaPagamento"
                    value={k}
                    checked={formaPagamento === k}
                    onChange={() => setFormaPagamento(k)}
                  />
                  {v}
                </label>
              ))}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="pedido-condicao">Condição de pagamento</label>
                <input
                  id="pedido-condicao"
                  type="text"
                  placeholder="ex: 30/60/90 dias"
                  value={condicaoPagamento}
                  onChange={(e) => setCondicaoPagamento(e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="pedido-entrega">Data de entrega</label>
                <input
                  id="pedido-entrega"
                  type="date"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Itens do pedido</legend>

            {itens.length > 0 ? (
              <div className={styles.itemRowHeader}>
                <span className={styles.itemHeaderLabel}>Descrição</span>
                <span className={styles.itemHeaderLabel}>Qtd</span>
                <span className={styles.itemHeaderLabel}>Vlr unit.</span>
                <span className={styles.itemHeaderLabel}>Desconto %</span>
                <span />
              </div>
            ) : null}

            <div className={styles.itensList}>
              {itens.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <input
                    type="text"
                    placeholder="Produto / serviço"
                    value={item.descricao}
                    onChange={(e) => atualizarItem(idx, 'descricao', e.target.value)}
                    className={styles.itemInput}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(idx, 'quantidade', Number(e.target.value))}
                    className={styles.itemInput}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0,00"
                    value={item.valorUnitario}
                    onChange={(e) => atualizarItem(idx, 'valorUnitario', Number(e.target.value))}
                    className={styles.itemInput}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={item.desconto}
                    onChange={(e) => atualizarItem(idx, 'desconto', Number(e.target.value))}
                    className={styles.itemInput}
                  />
                  <button
                    type="button"
                    className={styles.btnRemoveItem}
                    onClick={() => removerItem(idx)}
                    title="Remover item"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}

              <button type="button" className={styles.btnAddItem} onClick={adicionarItem}>
                <IconPlus /> Adicionar item
              </button>
            </div>
          </fieldset>

          {total > 0 ? (
            <div className={styles.drawerResumo}>
              <div className={styles.drawerResumoRow}>
                <span>Subtotal</span>
                <strong>{formatarMoeda(subtotal)}</strong>
              </div>
              {descontoTotal > 0 ? (
                <div className={styles.drawerResumoRow}>
                  <span>Desconto</span>
                  <strong className={styles.descontoValor}>- {formatarMoeda(descontoTotal)}</strong>
                </div>
              ) : null}
              <div className={`${styles.drawerResumoRow} ${styles.drawerResumoTotal}`}>
                <span>Total</span>
                <strong>{formatarMoeda(total)}</strong>
              </div>
            </div>
          ) : null}

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
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={!clienteNome.trim() || isCnpjSaveBlocked}
          >
            {mode === 'create' ? 'Criar orçamento' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
