import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'

import {
  ALIQUOTA_COFINS,
  ALIQUOTA_ICMS,
  ALIQUOTA_PIS,
  createEmptyDevolucaoForm,
} from '@/features/notasFiscais/data/shared'
import {
  ESTADO_OPTIONS,
  FORMA_PAGAMENTO_NF_LABEL,
  MOTIVO_DEVOLUCAO_LABEL,
  TIPO_DEVOLUCAO_LABEL,
  type FormaPagamentoNF,
  type MotivoDevolucao,
  type NotaFiscal,
  type NotaFiscalDevolucaoFormValues,
  type NotaFiscalDevolucaoItemFormValues,
  type TipoDevolucao,
} from '@/features/notasFiscais/types'
import {
  buildDevolucaoFormFromNota,
  calcTotalItens,
  calcTributosEstimados,
  formatBRL,
  formatDate,
  getNotasElegiveisParaDevolucao,
} from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotaFiscalDevolucaoDrawerProps {
  notas: NotaFiscal[]
  notaOriginalId?: string
  tipoDevolucaoInicial?: TipoDevolucao
  onClose: () => void
  onSubmit: (values: NotaFiscalDevolucaoFormValues) => void
}

export function NotaFiscalDevolucaoDrawer({
  notas,
  notaOriginalId,
  tipoDevolucaoInicial = 'devolucao_venda',
  onClose,
  onSubmit,
}: NotaFiscalDevolucaoDrawerProps) {
  const [tipoDevolucao, setTipoDevolucao] = useState<TipoDevolucao>(tipoDevolucaoInicial)
  const [values, setValues] = useState<NotaFiscalDevolucaoFormValues>(() =>
    createEmptyDevolucaoForm(tipoDevolucaoInicial),
  )

  const notasElegiveis = useMemo(
    () => getNotasElegiveisParaDevolucao(notas, tipoDevolucao),
    [notas, tipoDevolucao],
  )

  const notaOriginal = useMemo(
    () => notas.find((nota) => nota.id === values.notaOriginalId),
    [notas, values.notaOriginalId],
  )

  const itensAtivos = values.itens.filter((item) => item.selecionado && item.quantidade > 0)
  const totalItens = calcTotalItens(itensAtivos)
  const totalGeral =
    totalItens + values.valorFrete + values.valorSeguro + values.valorOutrasDespesas
  const tributos = calcTributosEstimados(totalItens)
  const isDevolucaoVenda = tipoDevolucao === 'devolucao_venda'

  const podeEmitir =
    values.notaOriginalId &&
    values.referenciaChaveAcesso.trim().length >= 44 &&
    values.destinatarioNome.trim() &&
    values.destinatarioCnpj.trim() &&
    itensAtivos.length > 0

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

  useEffect(() => {
    if (!notaOriginalId) return
    const nota = notas.find((item) => item.id === notaOriginalId)
    if (!nota) return

    const tipo = tipoDevolucaoInicial
    setTipoDevolucao(tipo)
    setValues(buildDevolucaoFormFromNota(nota, tipo))
  }, [notaOriginalId, notas, tipoDevolucaoInicial])

  function set<K extends keyof NotaFiscalDevolucaoFormValues>(
    key: K,
    val: NotaFiscalDevolucaoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function setItem(
    index: number,
    key: keyof NotaFiscalDevolucaoItemFormValues,
    val: unknown,
  ) {
    setValues((prev) => {
      const itens = [...prev.itens]
      itens[index] = { ...itens[index], [key]: val }
      return { ...prev, itens }
    })
  }

  function handleTipoDevolucaoChange(tipo: TipoDevolucao) {
    setTipoDevolucao(tipo)
    setValues(createEmptyDevolucaoForm(tipo))
  }

  function handleNotaOriginalChange(notaId: string) {
    const nota = notas.find((item) => item.id === notaId)
    if (!nota) {
      setValues(createEmptyDevolucaoForm(tipoDevolucao))
      return
    }
    setValues(buildDevolucaoFormFromNota(nota, tipoDevolucao))
  }

  return (
    <div className={styles.drawerRoot} role="dialog" aria-modal="true">
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <div className={`${styles.drawerPanel} ${styles.drawerPanelWide}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <div className={`${styles.drawerHeaderIcon} ${styles.drawerHeaderIconDevolucao}`}>
              <RotateCcw size={18} />
            </div>
            <div>
              <h2 className={styles.drawerTitle}>Nota fiscal de devolução</h2>
              <p className={styles.drawerSubtitle}>
                {isDevolucaoVenda
                  ? 'Registre a entrada de mercadorias devolvidas pelo cliente'
                  : 'Emita a devolução de mercadorias ao fornecedor'}
              </p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Tipo de devolução</legend>
            <div className={styles.devolucaoTipoRow}>
              {(['devolucao_venda', 'devolucao_compra'] as TipoDevolucao[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  className={`${styles.devolucaoTipoPill} ${
                    tipoDevolucao === tipo ? styles.devolucaoTipoPillActive : ''
                  } ${tipo === 'devolucao_compra' ? styles.devolucaoTipoPillSaida : ''}`}
                  onClick={() => handleTipoDevolucaoChange(tipo)}
                >
                  {TIPO_DEVOLUCAO_LABEL[tipo]}
                </button>
              ))}
            </div>
            <p className={styles.devolucaoHint}>
              {isDevolucaoVenda
                ? 'Gera NF-e de entrada (CFOP 1.202). Referencie a nota de venda original autorizada.'
                : 'Gera NF-e de saída (CFOP 5.411). Referencie a nota de compra original autorizada.'}
            </p>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Nota fiscal de referência</legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="nf-original">Selecionar nota original</label>
                <select
                  id="nf-original"
                  value={values.notaOriginalId}
                  onChange={(event) => handleNotaOriginalChange(event.target.value)}
                >
                  <option value="">
                    {notasElegiveis.length
                      ? 'Escolha a NF-e que será devolvida…'
                      : 'Nenhuma nota elegível encontrada'}
                  </option>
                  {notasElegiveis.map((nota) => (
                    <option key={nota.id} value={nota.id}>
                      Nº {nota.numero} · Série {nota.serie} ·{' '}
                      {isDevolucaoVenda ? nota.destinatario.nome : nota.emitente.nome} ·{' '}
                      {formatBRL(nota.valorTotal)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {notaOriginal ? (
              <div className={styles.devolucaoRefCard}>
                <p className={styles.devolucaoRefTitle}>Resumo da nota original</p>
                <dl className={styles.dadosGrid}>
                  <div className={styles.dadoItem}>
                    <dt>Número / Série</dt>
                    <dd>
                      Nº {notaOriginal.numero} · Série {notaOriginal.serie}
                    </dd>
                  </div>
                  <div className={styles.dadoItem}>
                    <dt>Data de emissão</dt>
                    <dd>{formatDate(notaOriginal.dataEmissao)}</dd>
                  </div>
                  <div className={`${styles.dadoItem} ${styles.formFieldFull}`}>
                    <dt>Chave de acesso</dt>
                    <dd>{notaOriginal.chaveAcesso}</dd>
                  </div>
                  <div className={styles.dadoItem}>
                    <dt>Valor total</dt>
                    <dd>{formatBRL(notaOriginal.valorTotal)}</dd>
                  </div>
                  <div className={styles.dadoItem}>
                    <dt>{isDevolucaoVenda ? 'Cliente' : 'Fornecedor'}</dt>
                    <dd>
                      {isDevolucaoVenda
                        ? notaOriginal.destinatario.nome
                        : notaOriginal.emitente.nome}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}

            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="ref-chave">Chave de acesso da NF referenciada</label>
                <input
                  id="ref-chave"
                  type="text"
                  maxLength={44}
                  placeholder="44 dígitos da chave de acesso"
                  value={values.referenciaChaveAcesso}
                  onChange={(event) => set('referenciaChaveAcesso', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="ref-numero">Número</label>
                <input
                  id="ref-numero"
                  type="text"
                  value={values.referenciaNumero}
                  onChange={(event) => set('referenciaNumero', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="ref-serie">Série</label>
                <input
                  id="ref-serie"
                  type="text"
                  value={values.referenciaSerie}
                  onChange={(event) => set('referenciaSerie', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="ref-data">Data de emissão da NF original</label>
                <input
                  id="ref-data"
                  type="date"
                  value={values.referenciaDataEmissao}
                  onChange={(event) => set('referenciaDataEmissao', event.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Motivo da devolução</legend>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="motivo-devolucao">Motivo</label>
                <select
                  id="motivo-devolucao"
                  value={values.motivoDevolucao}
                  onChange={(event) =>
                    set('motivoDevolucao', event.target.value as MotivoDevolucao)
                  }
                >
                  {Object.entries(MOTIVO_DEVOLUCAO_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label htmlFor="data-emissao-dev">Data de emissão</label>
                <input
                  id="data-emissao-dev"
                  type="date"
                  value={values.dataEmissao}
                  onChange={(event) => set('dataEmissao', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="data-saida-dev">
                  {isDevolucaoVenda ? 'Data de entrada' : 'Data de saída'}
                </label>
                <input
                  id="data-saida-dev"
                  type="date"
                  value={values.dataSaida ?? ''}
                  onChange={(event) => set('dataSaida', event.target.value)}
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="motivo-descricao">Descrição complementar (opcional)</label>
                <textarea
                  id="motivo-descricao"
                  rows={2}
                  placeholder="Detalhes adicionais sobre a devolução…"
                  value={values.motivoDescricao ?? ''}
                  onChange={(event) => set('motivoDescricao', event.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>
              {isDevolucaoVenda ? 'Emitente (cliente que devolve)' : 'Destinatário (fornecedor)'}
            </legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="dev-nome">Razão social</label>
                <input
                  id="dev-nome"
                  type="text"
                  value={values.destinatarioNome}
                  onChange={(event) => set('destinatarioNome', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="dev-cnpj">CNPJ</label>
                <input
                  id="dev-cnpj"
                  type="text"
                  value={values.destinatarioCnpj}
                  onChange={(event) => set('destinatarioCnpj', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="dev-ie">Inscrição estadual</label>
                <input
                  id="dev-ie"
                  type="text"
                  value={values.destinatarioIe ?? ''}
                  onChange={(event) => set('destinatarioIe', event.target.value)}
                />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="dev-endereco">Endereço</label>
                <input
                  id="dev-endereco"
                  type="text"
                  value={values.destinatarioEndereco}
                  onChange={(event) => set('destinatarioEndereco', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="dev-cidade">Cidade</label>
                <input
                  id="dev-cidade"
                  type="text"
                  value={values.destinatarioCidade}
                  onChange={(event) => set('destinatarioCidade', event.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="dev-estado">Estado</label>
                <select
                  id="dev-estado"
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
              <div className={styles.formField}>
                <label htmlFor="dev-pagamento">Forma de pagamento</label>
                <select
                  id="dev-pagamento"
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
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Itens a devolver</legend>
            {values.itens.length === 0 ? (
              <p className={styles.devolucaoHint}>
                Selecione uma nota original para carregar os itens automaticamente.
              </p>
            ) : (
              <>
                <div className={styles.devolucaoItensHeader}>
                  <span />
                  <span>Descrição</span>
                  <span>Qtd orig.</span>
                  <span>Qtd devolver</span>
                  <span>CFOP</span>
                  <span>Valor unit.</span>
                </div>
                <div className={styles.itensList}>
                  {values.itens.map((item, index) => (
                    <div key={item.itemOriginalId} className={styles.devolucaoItemRow}>
                      <label className={styles.devolucaoCheckbox}>
                        <input
                          type="checkbox"
                          checked={item.selecionado}
                          onChange={(event) => setItem(index, 'selecionado', event.target.checked)}
                        />
                      </label>
                      <div className={styles.formField}>
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(event) => setItem(index, 'descricao', event.target.value)}
                        />
                      </div>
                      <span className={styles.devolucaoQtdOrig}>{item.quantidadeOriginal}</span>
                      <div className={styles.formField}>
                        <input
                          type="number"
                          min={0}
                          max={item.quantidadeOriginal}
                          value={item.quantidade}
                          onChange={(event) =>
                            setItem(
                              index,
                              'quantidade',
                              Math.min(
                                item.quantidadeOriginal,
                                Math.max(0, Number(event.target.value)),
                              ),
                            )
                          }
                        />
                      </div>
                      <div className={styles.formField}>
                        <input
                          type="text"
                          value={item.cfop}
                          onChange={(event) => setItem(index, 'cfop', event.target.value)}
                        />
                      </div>
                      <div className={styles.formField}>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.valorUnitario || ''}
                          onChange={(event) =>
                            setItem(index, 'valorUnitario', Number(event.target.value))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className={styles.subtotalRow}>
              <span>Subtotal dos itens devolvidos</span>
              <span className={styles.subtotalValue}>{formatBRL(totalItens)}</span>
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
            </div>
          </fieldset>

          <div className={`${styles.totalRow} ${styles.totalValueDevolucao}`}>
            <span>Valor total da devolução</span>
            <span>{formatBRL(totalGeral)}</span>
          </div>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Informações adicionais</legend>
            <div className={styles.formField}>
              <label htmlFor="dev-obs">Observações</label>
              <textarea
                id="dev-obs"
                rows={3}
                value={values.informacoesAdicionais ?? ''}
                onChange={(event) => set('informacoesAdicionais', event.target.value)}
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
            disabled={!podeEmitir}
            onClick={() => onSubmit(values)}
          >
            {isDevolucaoVenda ? 'Registrar devolução' : 'Emitir nota de devolução'}
          </button>
        </div>
      </div>
    </div>
  )
}
