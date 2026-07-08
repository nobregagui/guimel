import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X } from 'lucide-react'

import { USER_ROLE_LABEL } from '@/services/user.service'
import type { User } from '@/types'
import {
  EMPTY_USUARIO_FORM,
  usuarioToFormValues,
  type UsuarioDrawerMode,
  type UsuarioFormValues,
} from '@/features/configuracoes/types'
import styles from '@/pages/configuracoes/ConfiguracoesPage.module.css'

const roleField = z.enum(['admin', 'manager', 'finance', 'sales'])

const createUsuarioSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').min(2, 'Informe o nome completo'),
    email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
    password: z.string().min(1, 'Senha é obrigatória').min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    role: roleField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

const editUsuarioSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').min(2, 'Informe o nome completo'),
    email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
    password: z.string(),
    confirmPassword: z.string(),
    role: roleField,
  })
  .superRefine((data, ctx) => {
    const hasPassword = data.password.length > 0 || data.confirmPassword.length > 0
    if (!hasPassword) return

    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mínimo de 6 caracteres',
        path: ['password'],
      })
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
      })
    }
  })

function buildResolver(mode: UsuarioDrawerMode) {
  const schema = mode === 'create' ? createUsuarioSchema : editUsuarioSchema

  return async (values: UsuarioFormValues) => {
    const result = schema.safeParse(values)
    if (result.success) return { values: result.data, errors: {} }
    return {
      values: {},
      errors: Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors).map(([key, messages]) => [
          key,
          { message: messages?.[0] ?? 'Campo inválido', type: 'validation' },
        ]),
      ),
    }
  }
}

interface UsuarioDrawerProps {
  open: boolean
  mode: UsuarioDrawerMode
  usuario?: User
  isSaving?: boolean
  isOnlyAdmin?: boolean
  onClose: () => void
  onSubmit: (values: UsuarioFormValues) => Promise<void>
}

interface UsuarioDrawerFormProps {
  mode: UsuarioDrawerMode
  usuario?: User
  isSaving: boolean
  lockAdminRole: boolean
  onClose: () => void
  onSubmit: (values: UsuarioFormValues) => Promise<void>
}

function UsuarioDrawerForm({
  mode,
  usuario,
  isSaving,
  lockAdminRole,
  onClose,
  onSubmit,
}: UsuarioDrawerFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    defaultValues: isEdit && usuario ? usuarioToFormValues(usuario) : EMPTY_USUARIO_FORM,
    resolver: buildResolver(mode),
  })

  const roleOptions = useMemo(
    () =>
      (Object.keys(USER_ROLE_LABEL) as Array<keyof typeof USER_ROLE_LABEL>).map((role) => ({
        value: role,
        label: USER_ROLE_LABEL[role],
      })),
    [],
  )

  return (
    <form
      className={styles.drawerBody}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
        if (!isEdit) reset(EMPTY_USUARIO_FORM)
      })}
      noValidate
    >
          <div className={styles.field}>
            <label htmlFor="usuario-name">Nome completo</label>
            <input
              id="usuario-name"
              className={errors.name ? styles.inputError : undefined}
              {...register('name')}
            />
            {errors.name ? <span className={styles.errorMsg}>{errors.name.message}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="usuario-email">E-mail</label>
            <input
              id="usuario-email"
              type="email"
              autoComplete="off"
              className={errors.email ? styles.inputError : undefined}
              {...register('email')}
            />
            {errors.email ? <span className={styles.errorMsg}>{errors.email.message}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="usuario-role">Perfil de acesso</label>
            <select
              id="usuario-role"
              disabled={lockAdminRole}
              title={
                lockAdminRole
                  ? 'Não é possível alterar o papel do último administrador do sistema'
                  : undefined
              }
              {...register('role')}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="usuario-password">
              {isEdit ? 'Nova senha (opcional)' : 'Senha temporária'}
            </label>
            <div className={styles.passwordRow}>
              <input
                id="usuario-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={errors.password ? styles.inputError : undefined}
                {...register('password')}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password ? <span className={styles.errorMsg}>{errors.password.message}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="usuario-confirm">
              {isEdit ? 'Confirmar nova senha' : 'Confirmar senha'}
            </label>
            <input
              id="usuario-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={errors.confirmPassword ? styles.inputError : undefined}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <span className={styles.errorMsg}>{errors.confirmPassword.message}</span>
            ) : null}
          </div>

          <footer className={styles.drawerFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </footer>
    </form>
  )
}

export function UsuarioDrawer({
  open,
  mode,
  usuario,
  isSaving = false,
  isOnlyAdmin = false,
  onClose,
  onSubmit,
}: UsuarioDrawerProps) {
  const isEdit = mode === 'edit'
  const lockAdminRole = isEdit && isOnlyAdmin && usuario?.role === 'admin'

  if (!open) return null

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <aside className={styles.drawerPanel} role="dialog" aria-modal="true">
        <header className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{isEdit ? 'Editar usuário' : 'Novo usuário'}</h2>
            <p className={styles.drawerSubtitle}>
              {isEdit
                ? 'Atualize os dados de acesso do usuário'
                : 'Cadastre um acesso ao sistema ERP'}
            </p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <UsuarioDrawerForm
          key={isEdit ? `edit-${usuario?.id}` : 'create'}
          mode={mode}
          usuario={usuario}
          isSaving={isSaving}
          lockAdminRole={lockAdminRole}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </aside>
    </div>
  )
}
