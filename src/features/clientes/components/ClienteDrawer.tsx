import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, User, X } from 'lucide-react'

import { EnderecoFields } from '@/components/form/EnderecoFields'
import { CnpjConsultaStatus } from '@/features/clientes/components/CnpjConsultaStatus'
import { EMPTY_CLIENTE_FORM, CLIENTE_SEGMENTOS } from '@/features/clientes/data/shared'
import { useCnpjConsulta } from '@/features/clientes/hooks/useCnpjConsulta'
import { clienteFormSchema } from '@/features/clientes/schemas/clienteFormSchema'
import type { ClienteFormValues } from '@/features/clientes/types'
import { CondicaoPagamentoFields } from '@/features/vendas/components/CondicaoPagamentoFields'
import { CONFIG_FORMA, defaultDiasVencimento } from '@/features/vendas/utils/pagamento'
import {
  getCnpjSaveBlockMessage,
  isCnpjComplete,
  isCnpjSaveBlocked,
  isCnpjVerifiedForSave,
} from '@/services/opencnpj.service'
import { cnpjMask, cpfMask, phoneMask } from '@/utils/masks'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ClienteDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ClienteFormValues) => void
  mode?: 'create' | 'edit'
  initialValues?: ClienteFormValues
}

export function ClienteDrawer({
  open,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues,
}: ClienteDrawerProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<ClienteFormValues>({
    defaultValues: EMPTY_CLIENTE_FORM,
  })

  // Register address fields so react-hook-form tracks them on submit
  register('cep')
  register('logradouro')
  register('numero')
  register('complemento')
  register('bairro')
  register('cidade')
  register('estado')

  const tipo = watch('tipo')
  const documento = watch('documento')
  const formaPagamento = watch('formaPagamentoPreferida')
  const parcelasPreferidas = watch('parcelasPreferidas')
  const taxaJurosMensalPreferida = watch('taxaJurosMensalPreferida')
  const diasVencimentoPreferidos = watch('diasVencimentoPreferidos')
  const endereco = watch(['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'])
  const isEdit = mode === 'edit'
  const wasOpenRef = useRef(false)
  const prevFormaRef = useRef(formaPagamento)
  const shouldConsultCnpj = !isEdit && tipo === 'pj'
  const cnpjConsulta = useCnpjConsulta(documento, shouldConsultCnpj)
  const isCnpjSaveDisabled = isCnpjSaveBlocked(documento, cnpjConsulta, shouldConsultCnpj)

  const { onChange: onDocumentoChange, ...documentoRegister } = register('documento')
  const { onChange: onTelefoneChange, ...telefoneRegister } = register('telefone')

  useEffect(() => {
    if (!shouldConsultCnpj) return

    if (isCnpjVerifiedForSave(cnpjConsulta)) {
      clearErrors('documento')
      return
    }

    if (cnpjConsulta.status === 'not_found' && isCnpjComplete(documento)) {
      setError('documento', { message: getCnpjSaveBlockMessage(cnpjConsulta) })
      return
    }

    if (cnpjConsulta.status === 'error' && isCnpjComplete(documento)) {
      setError('documento', { message: getCnpjSaveBlockMessage(cnpjConsulta) })
      return
    }

    clearErrors('documento')
  }, [shouldConsultCnpj, cnpjConsulta, documento, clearErrors, setError])

  useEffect(() => {
    if (prevFormaRef.current === formaPagamento) return
    prevFormaRef.current = formaPagamento
    const primeiraOpcao = CONFIG_FORMA[formaPagamento].opcoesParcelas[0]
    setValue('parcelasPreferidas', primeiraOpcao.parcelas)
    setValue('taxaJurosMensalPreferida', primeiraOpcao.taxaMensal)
    setValue(
      'diasVencimentoPreferidos',
      defaultDiasVencimento(primeiraOpcao.parcelas, formaPagamento),
    )
  }, [formaPagamento, setValue])

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
    if (open && !wasOpenRef.current) {
      const values = isEdit && initialValues ? initialValues : EMPTY_CLIENTE_FORM
      reset(values)
      prevFormaRef.current = values.formaPagamentoPreferida
    }

    wasOpenRef.current = open
  }, [open, isEdit, initialValues, reset])

  if (!open) return null

  const submit = handleSubmit((values) => {
    const parsed = clienteFormSchema.safeParse(values)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof ClienteFormValues, { message: issue.message })
        }
      }
      return
    }

    if (isCnpjSaveDisabled) {
      setError('documento', { message: getCnpjSaveBlockMessage(cnpjConsulta) })
      return
    }

    onSubmit(parsed.data)
    if (!isEdit) reset(EMPTY_CLIENTE_FORM)
    onClose()
  })

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar formulário" />

      <aside className={styles.drawerPanel} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="drawer-title" className={styles.drawerTitle}>
              {isEdit ? 'Editar cliente' : 'Novo cliente'}
            </h2>
            <p className={styles.drawerSubtitle}>
              {isEdit
                ? 'Atualize os dados comerciais e de contato do cliente.'
                : 'Cadastre PF ou PJ com dados comerciais básicos.'}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <form id="cliente-drawer-form" className={styles.drawerBody} onSubmit={submit}>
          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Tipo de pessoa</legend>
            <div className={styles.tipoSelector}>
              <label className={`${styles.tipoOption} ${tipo === 'pj' ? styles.tipoOptionActive : ''}`}>
                <input type="radio" value="pj" {...register('tipo')} />
                <Building2 size={16} />
                Pessoa jurídica
              </label>
              <label className={`${styles.tipoOption} ${tipo === 'pf' ? styles.tipoOptionActive : ''}`}>
                <input type="radio" value="pf" {...register('tipo')} />
                <User size={16} />
                Pessoa física
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Identificação</legend>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="cliente-nome">
                  {tipo === 'pj' ? 'Razão social' : 'Nome completo'} *
                </label>
                <input id="cliente-nome" {...register('nome')} placeholder={tipo === 'pj' ? 'Empresa LTDA' : 'Nome completo'} />
                {errors.nome ? <span className={styles.fieldError}>{errors.nome.message}</span> : null}
              </div>

              {tipo === 'pj' ? (
                <div className={styles.formField}>
                  <label htmlFor="cliente-fantasia">Nome fantasia *</label>
                  <input id="cliente-fantasia" {...register('nomeFantasia')} placeholder="Nome comercial" />
                  {errors.nomeFantasia ? (
                    <span className={styles.fieldError}>{errors.nomeFantasia.message}</span>
                  ) : null}
                </div>
              ) : null}

              <div className={styles.formField}>
                <label htmlFor="cliente-documento">{tipo === 'pj' ? 'CNPJ' : 'CPF'} *</label>
                <input
                  id="cliente-documento"
                  {...documentoRegister}
                  inputMode="numeric"
                  placeholder={tipo === 'pj' ? '00.000.000/0001-00' : '000.000.000-00'}
                  onChange={(event) => {
                    const maskedValue = tipo === 'pj' ? cnpjMask(event.target.value) : cpfMask(event.target.value)
                    event.target.value = maskedValue
                    onDocumentoChange(event)
                  }}
                />
                {errors.documento ? <span className={styles.fieldError}>{errors.documento.message}</span> : null}
                {shouldConsultCnpj ? <CnpjConsultaStatus result={cnpjConsulta} /> : null}
              </div>

              <div className={styles.formField}>
                <label htmlFor="cliente-segmento">Segmento *</label>
                <select id="cliente-segmento" {...register('segmento')}>
                  <option value="">Selecione</option>
                  {CLIENTE_SEGMENTOS.map((segmento) => (
                    <option key={segmento} value={segmento}>{segmento}</option>
                  ))}
                </select>
                {errors.segmento ? <span className={styles.fieldError}>{errors.segmento.message}</span> : null}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Contato</legend>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="cliente-email">E-mail *</label>
                <input
                  id="cliente-email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="contato@empresa.com"
                />
                {errors.email ? <span className={styles.fieldError}>{errors.email.message}</span> : null}
              </div>
              <div className={styles.formField}>
                <label htmlFor="cliente-telefone">Telefone *</label>
                <input
                  id="cliente-telefone"
                  {...telefoneRegister}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  onChange={(event) => {
                    event.target.value = phoneMask(event.target.value)
                    onTelefoneChange(event)
                  }}
                />
                {errors.telefone ? <span className={styles.fieldError}>{errors.telefone.message}</span> : null}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Endereço *</legend>
            <p className={styles.formHint}>
              Informe o CEP para preencher logradouro, bairro, cidade e estado automaticamente.
            </p>
            <EnderecoFields
              idPrefix="cliente"
              values={{
                cep: endereco[0] ?? '',
                logradouro: endereco[1] ?? '',
                numero: endereco[2] ?? '',
                complemento: endereco[3] ?? '',
                bairro: endereco[4] ?? '',
                cidade: endereco[5] ?? '',
                estado: endereco[6] ?? 'SP',
              }}
              errors={{
                cep: errors.cep?.message,
                logradouro: errors.logradouro?.message,
                numero: errors.numero?.message,
                complemento: errors.complemento?.message,
                bairro: errors.bairro?.message,
                cidade: errors.cidade?.message,
                estado: errors.estado?.message,
              }}
              onChange={(field, value) =>
                setValue(field, value, { shouldValidate: true, shouldDirty: true })
              }
            />
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Condições de pagamento preferenciais *</legend>
            <p className={styles.formHint}>
              Serão pré-preenchidas automaticamente em novos pedidos de venda para este cliente.
            </p>
            <CondicaoPagamentoFields
              formaPagamento={formaPagamento}
              parcelas={parcelasPreferidas}
              taxaMensal={taxaJurosMensalPreferida}
              diasVencimento={diasVencimentoPreferidos}
              total={0}
              previewTotal={1000}
              previewHint="Simulação com R$ 1.000,00. Os valores reais serão calculados com o total do pedido."
              onFormaChange={(forma) =>
                setValue('formaPagamentoPreferida', forma, { shouldValidate: true })
              }
              onOpcaoChange={(parcelas, taxa) => {
                setValue('parcelasPreferidas', parcelas)
                setValue('taxaJurosMensalPreferida', taxa)
                setValue(
                  'diasVencimentoPreferidos',
                  defaultDiasVencimento(parcelas, formaPagamento),
                )
              }}
              onDiasVencimentoChange={(dias) =>
                setValue('diasVencimentoPreferidos', dias, { shouldValidate: true })
              }
            />
            {errors.formaPagamentoPreferida ? (
              <span className={styles.fieldError}>{errors.formaPagamentoPreferida.message}</span>
            ) : null}
            {errors.diasVencimentoPreferidos ? (
              <span className={styles.fieldError}>{errors.diasVencimentoPreferidos.message}</span>
            ) : null}
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Observações</legend>
            <div className={styles.formField}>
              <label htmlFor="cliente-observacao">Notas internas</label>
              <textarea
                id="cliente-observacao"
                rows={3}
                {...register('observacao')}
                placeholder="Informações comerciais, restrições ou follow-up..."
              />
              {errors.observacao ? (
                <span className={styles.fieldError}>{errors.observacao.message}</span>
              ) : null}
            </div>
          </fieldset>
        </form>

        <footer className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="cliente-drawer-form"
            className={styles.btnPrimary}
            disabled={isSubmitting || isCnpjSaveDisabled}
            aria-disabled={isSubmitting || isCnpjSaveDisabled}
          >
            {isEdit ? 'Salvar alterações' : 'Salvar cliente'}
          </button>
        </footer>
      </aside>
    </div>
  )
}
