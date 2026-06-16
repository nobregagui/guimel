import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, User, X } from 'lucide-react'

import { CLIENTE_SEGMENTOS, CLIENTE_FORMAS_PAGAMENTO, EMPTY_CLIENTE_FORM, ESTADOS_BR } from '@/features/clientes/data/shared'
import { clienteFormSchema } from '@/features/clientes/schemas/clienteFormSchema'
import type { ClienteFormValues } from '@/features/clientes/types'
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
    formState: { isSubmitting, errors },
  } = useForm<ClienteFormValues>({
    defaultValues: EMPTY_CLIENTE_FORM,
  })

  const tipo = watch('tipo')
  const formaPagamento = watch('formaPagamentoPreferida')
  const isEdit = mode === 'edit'
  const wasOpenRef = useRef(false)

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
      reset(isEdit && initialValues ? initialValues : EMPTY_CLIENTE_FORM)
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
                <label htmlFor="cliente-nome">{tipo === 'pj' ? 'Razão social' : 'Nome completo'}</label>
                <input id="cliente-nome" {...register('nome')} placeholder={tipo === 'pj' ? 'Empresa LTDA' : 'Nome completo'} />
                {errors.nome ? <span className={styles.fieldError}>{errors.nome.message}</span> : null}
              </div>

              {tipo === 'pj' ? (
                <div className={styles.formField}>
                  <label htmlFor="cliente-fantasia">Nome fantasia</label>
                  <input id="cliente-fantasia" {...register('nomeFantasia')} placeholder="Opcional" />
                </div>
              ) : null}

              <div className={styles.formField}>
                <label htmlFor="cliente-documento">{tipo === 'pj' ? 'CNPJ' : 'CPF'}</label>
                <input id="cliente-documento" {...register('documento')} placeholder={tipo === 'pj' ? '00.000.000/0001-00' : '000.000.000-00'} />
                {errors.documento ? <span className={styles.fieldError}>{errors.documento.message}</span> : null}
              </div>

              <div className={styles.formField}>
                <label htmlFor="cliente-segmento">Segmento</label>
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
                <label htmlFor="cliente-email">E-mail</label>
                <input id="cliente-email" type="email" {...register('email')} placeholder="contato@empresa.com" />
                {errors.email ? <span className={styles.fieldError}>{errors.email.message}</span> : null}
              </div>
              <div className={styles.formField}>
                <label htmlFor="cliente-telefone">Telefone</label>
                <input id="cliente-telefone" {...register('telefone')} placeholder="(11) 99999-9999" />
                {errors.telefone ? <span className={styles.fieldError}>{errors.telefone.message}</span> : null}
              </div>
              <div className={styles.formField}>
                <label htmlFor="cliente-cidade">Cidade</label>
                <input id="cliente-cidade" {...register('cidade')} placeholder="São Paulo" />
                {errors.cidade ? <span className={styles.fieldError}>{errors.cidade.message}</span> : null}
              </div>
              <div className={styles.formField}>
                <label htmlFor="cliente-estado">Estado</label>
                <select id="cliente-estado" {...register('estado')}>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                {errors.estado ? <span className={styles.fieldError}>{errors.estado.message}</span> : null}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Pagamento preferencial</legend>
            <p className={styles.formHint}>Será pré-preenchida em vendas, cobranças e contas a receber.</p>
            <div className={styles.formaPagamentoGrid}>
              {CLIENTE_FORMAS_PAGAMENTO.map((forma) => (
                <label
                  key={forma.id}
                  className={`${styles.formaPagamentoOption} ${formaPagamento === forma.id ? styles.formaPagamentoOptionActive : ''}`}
                >
                  <input type="radio" value={forma.id} {...register('formaPagamentoPreferida')} />
                  {forma.label}
                </label>
              ))}
            </div>
            {errors.formaPagamentoPreferida ? (
              <span className={styles.fieldError}>{errors.formaPagamentoPreferida.message}</span>
            ) : null}
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Observações</legend>
            <div className={styles.formField}>
              <label htmlFor="cliente-observacao">Notas internas</label>
              <textarea id="cliente-observacao" rows={3} {...register('observacao')} placeholder="Informações comerciais, restrições ou follow-up..." />
            </div>
          </fieldset>
        </form>

        <footer className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="cliente-drawer-form" className={styles.btnPrimary} disabled={isSubmitting}>
            {isEdit ? 'Salvar alterações' : 'Salvar cliente'}
          </button>
        </footer>
      </aside>
    </div>
  )
}
