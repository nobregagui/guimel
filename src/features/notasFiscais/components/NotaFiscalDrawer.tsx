import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'

import {
  ALIQUOTA_COFINS,
  ALIQUOTA_ICMS,
  ALIQUOTA_PIS,
  createEmptyNotaFiscalForm,
  emptyNotaFiscalItem,
  NATUREZAS_ENTRADA,
  NATUREZAS_SAIDA,
} from '@/features/notasFiscais/data/shared'
import {
  ESTADO_OPTIONS,
  FORMA_PAGAMENTO_NF_LABEL,
  NATUREZA_OPERACAO_LABEL,
  type FormaPagamentoNF,
  type NaturezaOperacao,
  type NotaFiscalFormValues,
  type TipoNota,
} from '@/features/notasFiscais/types'
import { calcTotalItens, calcTributosEstimados, formatBRL } from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotaFiscalDrawerProps {
  tipo: TipoNota
  onClose: () => void
  onSubmit: (values: NotaFiscalFormValues) => void
}

export function NotaFiscalDrawer({ tipo, onClose, onSubmit }: NotaFiscalDrawerProps) {
  const isEntrada = tipo === 'entrada'
  const naturezas = isEntrada ? NATUREZAS_ENTRADA : NATUREZAS_SAIDA

  const [values, setValues] = useState<NotaFiscalFormValues>(() => createEmptyNotaFiscalForm(tipo))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function set<K extends keyof NotaFiscalFormValues>(key: K, val: NotaFiscalFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function setItem(
    index: number,
    key: keyof NotaFiscalFormValues['itens'][number],
    val: unknown,
  ) {
    setValues((prev) => {
      const itens = [...prev.itens]
      itens[index] = { ...itens[index], [key]: val }
      return { ...prev, itens }
    })
  }

  function addItem() {
    setValues((prev) => ({ ...prev, itens: [...prev.itens, emptyNotaFiscalItem()] }))
  }

  function removeItem(index: number) {
    setValues((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const totalItens = calcTotalItens(values.itens)
  const totalGeral =
    totalItens + values.valorFrete + values.valorSeguro + values.valorOutrasDespesas
  const tributos = calcTributosEstimados(totalItens)

  return (
    <div className={styles.drawerRoot} role="dialog" aria-modal="true">
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <div
              className={`${styles.drawerHeaderIcon} ${
                isEntrada ? styles.drawerHeaderIconEntrada : styles.drawerHeaderIconSaida
              }`}
            >
              {isEntrada ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
            </div>
            <div>
              <h2 className={styles.drawerTitle}>
                {isEntrada ? 'Nova nota de entrada' : 'Nova nota de saída'}
              </h2>
              <p className={styles.drawerSubtitle}>
                {isEntrada
                  ? 'Registre uma NF-e recebida de fornecedor'
                  : 'Emita uma NF-e para seu cliente'}
              </p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Identificação</legend>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="nf-natureza">Natureza da operação</label>
                <select
                  id="nf-natureza"
                  value={values.naturezaOperacao}
                  onChange={(event) =>
                    set('naturezaOperacao', event.target.value as NaturezaOperacao)
                  }
                >
                  {naturezas.map((natureza) => (
                    <option key={natureza} value={natureza}>
                      {NATUREZA_OPERACAO_LABEL[natureza]}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-pagamento">Forma de pagamento</label>
                <select
                  id="nf-pagamento"
                  value={values.formaPagamento}
                  onChange={(event) =>
                    set('formaPagamento', event.target.value as FormaPagamentoNF)
                  }
                >
                  {Object.entries(FORMA_PAGAMENTO_NF_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-emissao">Data de emissão</label>
                <input
                  id="nf-emissao"
                  type="date"
                  value={values.dataEmissao}
                  onChange={(event) => set('dataEmissao', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-saida">
                  {isEntrada ? 'Data de entrada' : 'Data de saída'}
                </label>
                <input
                  id="nf-saida"
                  type="date"
                  value={values.dataSaida ?? ''}
                  onChange={(event) => set('dataSaida', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-vencimento">Vencimento (opcional)</label>
                <input
                  id="nf-vencimento"
                  type="date"
                  value={values.vencimento ?? ''}
                  onChange={(event) => set('vencimento', event.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>
              {isEntrada ? 'Emitente (fornecedor)' : 'Destinatário (cliente)'}
            </legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="nf-nome">
                  {isEntrada ? 'Razão social do fornecedor' : 'Razão social do cliente'}
                </label>
                <input
                  id="nf-nome"
                  type="text"
                  placeholder={
                    isEntrada ? 'Ex: Fornecedor ABC Ltda' : 'Ex: Tech Solutions Informática'
                  }
                  value={values.destinatarioNome}
                  onChange={(event) => set('destinatarioNome', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-cnpj">CNPJ</label>
                <input
                  id="nf-cnpj"
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={values.destinatarioCnpj}
                  onChange={(event) => set('destinatarioCnpj', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-ie">Inscrição estadual</label>
                <input
                  id="nf-ie"
                  type="text"
                  placeholder="000.000.000.000"
                  value={values.destinatarioIe ?? ''}
                  onChange={(event) => set('destinatarioIe', event.target.value)}
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="nf-endereco">Endereço</label>
                <input
                  id="nf-endereco"
                  type="text"
                  placeholder="Rua, número, complemento, bairro"
                  value={values.destinatarioEndereco}
                  onChange={(event) => set('destinatarioEndereco', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-cidade">Cidade</label>
                <input
                  id="nf-cidade"
                  type="text"
                  placeholder="São Paulo"
                  value={values.destinatarioCidade}
                  onChange={(event) => set('destinatarioCidade', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-estado">Estado</label>
                <select
                  id="nf-estado"
                  value={values.destinatarioEstado}
                  onChange={(event) => set('destinatarioEstado', event.target.value)}
                >
                  {ESTADO_OPTIONS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Produtos / Serviços</legend>

            <div className={styles.itemRowHeader}>
              <span className={styles.itemRowHeaderLabel}>Descrição</span>
              <span className={styles.itemRowHeaderLabel}>Qtd</span>
              <span className={styles.itemRowHeaderLabel}>Valor unit.</span>
              <span className={styles.itemRowHeaderLabel}>Desconto</span>
              <span />
            </div>

            <div className={styles.itensList}>
              {values.itens.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="Descrição do item"
                      value={item.descricao}
                      onChange={(event) => setItem(index, 'descricao', event.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(event) =>
                        setItem(index, 'quantidade', Number(event.target.value))
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={item.valorUnitario || ''}
                      onChange={(event) =>
                        setItem(index, 'valorUnitario', Number(event.target.value))
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0,00"
                      value={item.desconto || ''}
                      onChange={(event) =>
                        setItem(index, 'desconto', Number(event.target.value))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.itemRemoveBtn}
                    onClick={() => removeItem(index)}
                    title="Remover item"
                    disabled={values.itens.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className={styles.addItemBtn} onClick={addItem}>
              <Plus size={14} /> Adicionar item
            </button>

            <div className={styles.subtotalRow}>
              <span>Subtotal dos itens</span>
              <span className={styles.subtotalValue}>{formatBRL(totalItens)}</span>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Outras despesas</legend>
            <div className={styles.formGridThree}>
              <div className={styles.formField}>
                <label htmlFor="nf-frete">Frete (R$)</label>
                <input
                  id="nf-frete"
                  type="number"
                  min={0}
                  step={0.01}
                  value={values.valorFrete || ''}
                  onChange={(event) => set('valorFrete', Number(event.target.value))}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-seguro">Seguro (R$)</label>
                <input
                  id="nf-seguro"
                  type="number"
                  min={0}
                  step={0.01}
                  value={values.valorSeguro || ''}
                  onChange={(event) => set('valorSeguro', Number(event.target.value))}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="nf-outras">Outras despesas (R$)</label>
                <input
                  id="nf-outras"
                  type="number"
                  min={0}
                  step={0.01}
                  value={values.valorOutrasDespesas || ''}
                  onChange={(event) => set('valorOutrasDespesas', Number(event.target.value))}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Tributos estimados</legend>
            <div className={styles.tributosGrid}>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>ICMS</span>
                <span className={styles.tributoValue}>{formatBRL(tributos.valorIcms)}</span>
                <span className={styles.tributoRate}>{ALIQUOTA_ICMS}% sobre base</span>
              </div>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>PIS</span>
                <span className={styles.tributoValue}>{formatBRL(tributos.valorPis)}</span>
                <span className={styles.tributoRate}>{ALIQUOTA_PIS}% sobre base</span>
              </div>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>COFINS</span>
                <span className={styles.tributoValue}>{formatBRL(tributos.valorCofins)}</span>
                <span className={styles.tributoRate}>{ALIQUOTA_COFINS}% sobre base</span>
              </div>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>IPI</span>
                <span className={styles.tributoValue}>{formatBRL(0)}</span>
                <span className={styles.tributoRate}>0% (isento)</span>
              </div>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>ISS</span>
                <span className={styles.tributoValue}>{formatBRL(0)}</span>
                <span className={styles.tributoRate}>Não aplicável</span>
              </div>
              <div className={styles.tributoCard}>
                <span className={styles.tributoLabel}>Total trib.</span>
                <span className={styles.tributoValue}>
                  {formatBRL(tributos.valorTotalTributos)}
                </span>
                <span className={styles.tributoRate}>Estimativa</span>
              </div>
            </div>
          </fieldset>

          <div className={`${styles.totalRow} ${!isEntrada ? '' : styles.totalValueOrange}`}>
            <span>Valor total da nota</span>
            <span>{formatBRL(totalGeral)}</span>
          </div>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Informações adicionais</legend>
            <div className={styles.formField}>
              <label htmlFor="nf-obs">Observações (opcional)</label>
              <textarea
                id="nf-obs"
                placeholder="Dados adicionais de interesse do fisco ou do contribuinte…"
                value={values.informacoesAdicionais ?? ''}
                onChange={(event) => set('informacoesAdicionais', event.target.value)}
                rows={3}
              />
            </div>
          </fieldset>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={styles.btnSecondary}>
            Salvar rascunho
          </button>
          <button type="button" className={styles.btnPrimary} onClick={() => onSubmit(values)}>
            {isEntrada ? 'Registrar nota' : 'Emitir nota fiscal'}
          </button>
        </div>
      </div>
    </div>
  )
}
