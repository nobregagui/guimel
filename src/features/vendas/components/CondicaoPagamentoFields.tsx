import { useEffect, useState } from 'react'

import type { FormaPagamento } from '@/features/vendas/types'
import { FORMA_PAGAMENTO_LABEL, formatarMoeda } from '@/features/vendas/data/shared'
import {
  CONFIG_FORMA,
  calcularCondicao,
  dataVencimentoPorDias,
  formatarDataCurta,
  normalizarDiasVencimento,
} from '@/features/vendas/utils/pagamento'
import styles from '@/features/vendas/components/CondicaoPagamentoFields.module.css'

export function valorParcelaPreview(total: number, parcelas: number, taxaMensal: number): number {
  if (total <= 0 || parcelas <= 0) return 0
  if (taxaMensal === 0) return total / parcelas
  const taxa = taxaMensal / 100
  const fator = Math.pow(1 + taxa, parcelas)
  return (total * (taxa * fator)) / (fator - 1)
}

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export interface CondicaoPagamentoFieldsProps {
  formaPagamento: FormaPagamento
  parcelas: number
  taxaMensal: number
  diasVencimento?: number[]
  total: number
  onFormaChange: (forma: FormaPagamento) => void
  onOpcaoChange: (parcelas: number, taxaMensal: number) => void
  onDiasVencimentoChange?: (dias: number[]) => void
  formaPreferida?: FormaPagamento | ''
  previewTotal?: number
  previewHint?: string
  showResumo?: boolean
  showCronograma?: boolean
  dataReferencia?: Date
}

function parseDiasInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const parsed = parseInt(trimmed, 10)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 365) return null
  return parsed
}

export function CondicaoPagamentoFields({
  formaPagamento,
  parcelas,
  taxaMensal,
  diasVencimento = [],
  total,
  onFormaChange,
  onOpcaoChange,
  onDiasVencimentoChange,
  formaPreferida = '',
  previewTotal,
  previewHint,
  showResumo = true,
  showCronograma = true,
  dataReferencia,
}: CondicaoPagamentoFieldsProps) {
  const configForma = CONFIG_FORMA[formaPagamento]
  const temJuros = taxaMensal > 0
  const valorBase = total > 0 ? total : (previewTotal ?? 0)
  const isBoletoPrazo = formaPagamento === 'boleto_prazo'
  const diasNorm = isBoletoPrazo
    ? normalizarDiasVencimento(diasVencimento, parcelas, formaPagamento)
    : []
  const [diasDraft, setDiasDraft] = useState<string[]>(() => diasNorm.map(String))

  useEffect(() => {
    setDiasDraft(diasNorm.map(String))
  }, [diasNorm.join('|')])

  const dataBase = dataReferencia ?? new Date()
  const condicao = calcularCondicao(
    valorBase,
    formaPagamento,
    parcelas,
    taxaMensal,
    isBoletoPrazo ? diasNorm : undefined,
    dataBase,
  )

  function handleDiaInputChange(index: number, raw: string) {
    if (raw !== '' && !/^\d+$/.test(raw)) return
    setDiasDraft((current) => {
      const next = [...current]
      next[index] = raw
      return next
    })
  }

  function handleDiaBlur(index: number) {
    if (!onDiasVencimentoChange) return

    const parsed = parseDiasInput(diasDraft[index] ?? '')
    const valor = parsed ?? diasNorm[index] ?? 1
    const next = [...diasNorm]
    next[index] = valor
    onDiasVencimentoChange(next)
    setDiasDraft((current) => {
      const updated = [...current]
      updated[index] = String(valor)
      return updated
    })
  }

  return (
    <>
      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Forma de pagamento</legend>
        <div className={styles.formaPagamentoGrid}>
          {(Object.entries(FORMA_PAGAMENTO_LABEL) as [FormaPagamento, string][]).map(([k, v]) => (
            <label
              key={k}
              className={`${styles.formaPagamentoOption} ${formaPagamento === k ? styles.formaPagamentoOptionActive : ''} ${formaPreferida === k ? styles.formaPagamentoOptionPref : ''}`}
            >
              <input
                type="radio"
                name="condicao-forma"
                value={k}
                checked={formaPagamento === k}
                onChange={() => onFormaChange(k)}
              />
              {v}
              {formaPreferida === k ? <span className={styles.prefTag}>★ preferido</span> : null}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.formLegend}>Parcelamento</legend>
        <div className={styles.parcelasGrid}>
          {configForma.opcoesParcelas.map((opcao) => {
            const ativa = opcao.parcelas === parcelas && opcao.taxaMensal === taxaMensal
            return (
              <label
                key={`${opcao.parcelas}-${opcao.taxaMensal}`}
                className={`${styles.parcelaOption} ${ativa ? styles.parcelaOptionActive : ''} ${opcao.taxaMensal > 0 ? styles.parcelaOptionJuros : ''}`}
              >
                <input
                  type="radio"
                  name="condicao-parcelas"
                  checked={ativa}
                  onChange={() => onOpcaoChange(opcao.parcelas, opcao.taxaMensal)}
                />
                <span className={styles.parcelaOptionLabel}>{opcao.label}</span>
                {valorBase > 0 ? (
                  <span className={styles.parcelaOptionValor}>
                    {opcao.parcelas}×{' '}
                    {formatarMoeda(valorParcelaPreview(valorBase, opcao.parcelas, opcao.taxaMensal))}
                  </span>
                ) : null}
              </label>
            )
          })}
        </div>
      </fieldset>

      {isBoletoPrazo && onDiasVencimentoChange ? (
        <fieldset className={styles.formSection}>
          <legend className={styles.formLegend}>Vencimentos (dias após a venda)</legend>
          <p className={styles.diasHint}>
            Informe em quantos dias cada parcela vence a partir da data da venda. Ex.: venda no dia 19,
            com 10 e 12 dias → vencimentos nos dias 29 e 31.
          </p>
          <div className={styles.diasVencimentoList}>
            {diasNorm.map((dias, index) => {
              const diasPreview = parseDiasInput(diasDraft[index] ?? '') ?? dias
              const vencimento = dataVencimentoPorDias(diasPreview, dataBase)
              return (
                <div key={index} className={styles.diasVencimentoRow}>
                  <label htmlFor={`dias-venc-${index}`} className={styles.diasVencimentoLabel}>
                    {index + 1}ª parcela
                  </label>
                  <div className={styles.diasVencimentoInputWrap}>
                    <input
                      id={`dias-venc-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className={styles.diasVencimentoInput}
                      value={diasDraft[index] ?? String(dias)}
                      onChange={(e) => handleDiaInputChange(index, e.target.value)}
                      onBlur={() => handleDiaBlur(index)}
                    />
                    <span className={styles.diasVencimentoSuffix}>dias</span>
                  </div>
                  <span className={styles.diasVencimentoPreview}>
                    <IconCalendar />
                    {formatarDataCurta(vencimento.toISOString())}
                  </span>
                </div>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {previewHint && valorBase > 0 && total <= 0 ? (
        <p className={styles.previewHint}>{previewHint}</p>
      ) : null}

      {showResumo && valorBase > 0 ? (
        <fieldset className={styles.formSection}>
          <legend className={styles.formLegend}>Resumo financeiro</legend>
          <div className={styles.resumoFinanceiro}>
            <div className={styles.resumoFinanceiroRow}>
              <span>{total > 0 ? 'Total dos itens' : 'Valor de referência'}</span>
              <strong>{formatarMoeda(valorBase)}</strong>
            </div>
            {condicao.totalJuros > 0 ? (
              <div className={styles.resumoFinanceiroRow}>
                <span>
                  Juros ({taxaMensal}% a.m. · {parcelas} parcelas)
                </span>
                <strong className={styles.colorOrange}>+ {formatarMoeda(condicao.totalJuros)}</strong>
              </div>
            ) : null}
            <div className={`${styles.resumoFinanceiroRow} ${styles.resumoFinanceiroTotal}`}>
              <span>Total a pagar</span>
              <strong className={temJuros ? styles.colorOrangeStrong : styles.colorGreenStrong}>
                {formatarMoeda(condicao.totalComJuros)}
              </strong>
            </div>
            <div className={styles.resumoFinanceiroRow}>
              <span>Condição</span>
              <strong className={styles.condicaoLabel}>{condicao.descricao}</strong>
            </div>
          </div>

          {temJuros ? (
            <div className={styles.jurosAlert}>
              <IconInfo />
              <p>
                Esta opção inclui <strong>{formatarMoeda(condicao.totalJuros)}</strong> de juros.
                O cliente pagará <strong>{formatarMoeda(condicao.totalComJuros)}</strong> no total.
              </p>
            </div>
          ) : null}
        </fieldset>
      ) : null}

      {showCronograma && condicao.cronograma.length > 0 && valorBase > 0 ? (
        <fieldset className={styles.formSection}>
          <legend className={styles.formLegend}>Cronograma de vencimentos</legend>
          <div className={styles.cronogramaList}>
            {condicao.cronograma.map((parcela) => (
              <div key={parcela.numero} className={styles.cronogramaItem}>
                <div className={styles.cronogramaNum}>{parcela.numero}ª</div>
                <div className={styles.cronogramaInfo}>
                  <span className={styles.cronogramaData}>
                    <IconCalendar />
                    {formatarDataCurta(parcela.vencimentoIso)}
                  </span>
                  {isBoletoPrazo ? (
                    <span className={styles.cronogramaDias}>
                      {diasNorm[parcela.numero - 1]} dias após a venda
                    </span>
                  ) : null}
                  {parcela.juros > 0 ? (
                    <span className={styles.cronogramaJuros}>juros: {formatarMoeda(parcela.juros)}</span>
                  ) : null}
                </div>
                <div className={styles.cronogramaValor}>{formatarMoeda(parcela.valorComJuros)}</div>
              </div>
            ))}

            {condicao.cronograma.length > 1 ? (
              <div className={`${styles.cronogramaItem} ${styles.cronogramaItemTotal}`}>
                <div className={styles.cronogramaNum} />
                <div className={styles.cronogramaInfo}>
                  <span className={styles.cronogramaTotalLabel}>
                    {condicao.cronograma.length} vencimentos
                  </span>
                </div>
                <div
                  className={`${styles.cronogramaValor} ${temJuros ? styles.colorOrangeStrong : styles.colorGreenStrong}`}
                >
                  {formatarMoeda(condicao.totalComJuros)}
                </div>
              </div>
            ) : null}
          </div>
        </fieldset>
      ) : null}
    </>
  )
}
