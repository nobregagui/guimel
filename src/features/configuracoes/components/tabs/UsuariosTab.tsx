import { useMemo, useState } from 'react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Loading } from '@/components/ui/Loading'
import { UsuarioDrawer } from '@/features/configuracoes/components/UsuarioDrawer'
import {
  getUsuariosQueryErrorMessage,
  useCreateUsuarioMutation,
  useDeleteUsuarioMutation,
  useUpdateUsuarioMutation,
  useUsuariosQuery,
} from '@/features/configuracoes/hooks/useUsuarios'
import { USER_ROLE_LABEL } from '@/constants/permissions'
import type { User } from '@/types'
import { useAuthStore } from '@/store'
import styles from '@/pages/configuracoes/ConfiguracoesPage.module.css'

interface UsuariosTabProps {
  readOnly?: boolean
  drawerOpen: boolean
  onCloseDrawer: () => void
}

function getIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export function UsuariosTab({ readOnly = false, drawerOpen, onCloseDrawer }: UsuariosTabProps) {
  const currentUser = useAuthStore((state) => state.user)
  const usuariosQuery = useUsuariosQuery()
  const createUsuarioMutation = useCreateUsuarioMutation()
  const updateUsuarioMutation = useUpdateUsuarioMutation()
  const deleteUsuarioMutation = useDeleteUsuarioMutation()

  const [editingUsuario, setEditingUsuario] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const usuarios = usuariosQuery.data ?? []

  const adminCount = useMemo(
    () => usuarios.filter((usuario) => usuario.role === 'admin').length,
    [usuarios],
  )

  const isOnlyAdmin = (usuario: User) => usuario.role === 'admin' && adminCount === 1

  const drawerMode = editingUsuario ? 'edit' : 'create'
  const isDrawerOpen = drawerOpen || editingUsuario !== null
  const isSaving = createUsuarioMutation.isPending || updateUsuarioMutation.isPending

  const handleCloseDrawer = () => {
    onCloseDrawer()
    setEditingUsuario(null)
  }

  return (
    <div className={styles.tabBody}>
      <div className={styles.infoBanner}>
        {readOnly
          ? 'Visualização somente leitura. Alterações de usuários exigem perfil administrador.'
          : 'O cadastro de novos usuários é feito apenas por administradores. Compartilhe a senha temporária de forma segura no primeiro acesso.'}
      </div>

      {usuariosQuery.isLoading ? (
        <Loading label="Carregando usuários..." layout="centered" />
      ) : usuariosQuery.isError ? (
        <div className={styles.feedbackState}>
          <p>{getUsuariosQueryErrorMessage(usuariosQuery.error)}</p>
          <button type="button" className={styles.btnSecondary} onClick={() => usuariosQuery.refetch()}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <section className={styles.usersCard}>
          <div className={styles.usersCardHeader}>
            <h2 className={styles.usersCardTitle}>Usuários do sistema</h2>
            <span className={styles.usersCount}>{usuarios.length} cadastrado(s)</span>
          </div>

          {usuarios.length === 0 ? (
            <p className={styles.emptyState}>
              {readOnly ? 'Nenhum usuário cadastrado.' : 'Nenhum usuário cadastrado. Clique em "Novo usuário".'}
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    {readOnly ? null : <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => {
                    const isCurrent = usuario.id === currentUser?.id
                    const onlyAdmin = isOnlyAdmin(usuario)
                    const canDelete = !isCurrent && !readOnly
                    const deleteDisabled = !canDelete || onlyAdmin
                    const roleLabel =
                      USER_ROLE_LABEL[usuario.role as keyof typeof USER_ROLE_LABEL] ?? usuario.role

                    return (
                      <tr key={usuario.id}>
                        <td>
                          <div className={styles.userCell}>
                            <span className={styles.userAvatar}>{getIniciais(usuario.name)}</span>
                            <span>{usuario.name}</span>
                          </div>
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={styles.roleBadge}>{roleLabel}</span>
                        </td>
                        <td>
                          <span className={isCurrent ? styles.statusActive : styles.statusDefault}>
                            {isCurrent ? 'Você' : 'Ativo'}
                          </span>
                        </td>
                        {readOnly ? null : (
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => setEditingUsuario(usuario)}
                              >
                                Editar
                              </button>
                              {canDelete ? (
                                <button
                                  type="button"
                                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                  disabled={deleteDisabled}
                                  title={
                                    onlyAdmin
                                      ? 'Não é possível remover o último administrador do sistema'
                                      : undefined
                                  }
                                  onClick={() => setDeleteTarget(usuario)}
                                >
                                  Excluir
                                </button>
                              ) : null}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!readOnly ? (
        <UsuarioDrawer
          open={isDrawerOpen}
          mode={drawerMode}
          usuario={editingUsuario ?? undefined}
          isSaving={isSaving}
          isOnlyAdmin={editingUsuario ? isOnlyAdmin(editingUsuario) : false}
          allowAdminRole={currentUser?.role === 'admin'}
          onClose={handleCloseDrawer}
          onSubmit={async (values) => {
            if (drawerMode === 'edit' && editingUsuario) {
              const payload: {
                name: string
                email: string
                role: User['role']
                password?: string
              } = {
                name: values.name.trim(),
                email: values.email.trim(),
                role: values.role,
              }

              if (values.password) {
                payload.password = values.password
              }

              await updateUsuarioMutation.mutateAsync({
                id: editingUsuario.id,
                payload,
              })
            } else {
              await createUsuarioMutation.mutateAsync({
                name: values.name.trim(),
                email: values.email.trim(),
                password: values.password,
                role: values.role,
              })
            }

            handleCloseDrawer()
          }}
        />
      ) : null}

      {!readOnly ? (
        <ConfirmModal
          open={deleteTarget !== null}
          title="Excluir usuário"
          description={
            deleteTarget
              ? `Tem certeza que deseja remover "${deleteTarget.name}"? O acesso será revogado imediatamente.`
              : ''
          }
          confirmLabel="Excluir"
          confirmingLabel="Excluindo..."
          isConfirming={deleteUsuarioMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return
            await deleteUsuarioMutation.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}
