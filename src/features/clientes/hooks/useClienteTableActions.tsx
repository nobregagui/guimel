import { useCallback, useMemo, useState } from 'react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import { ClienteDrawer } from '@/features/clientes/components/ClienteDrawer'
import type { ClienteActionMenuItem } from '@/features/clientes/components/ClienteActionMenu'
import {
  useRemoveClienteMutation,
  useUpdateClienteMutation,
  useUpdateClienteStatusMutation,
} from '@/features/clientes/hooks/useClientes'
import type { Cliente } from '@/features/clientes/types'
import { clienteToFormValues, getClienteSaveErrorMessage } from '@/features/clientes/utils'
import { usePermissions } from '@/hooks/usePermissions'

export function useClienteTableActions() {
  const { showToast } = useToast()
  const { canWriteModule, isReadOnly } = usePermissions()
  const canWrite = canWriteModule([...MODULE_WRITE_PERMISSIONS.clientes]) && !isReadOnly

  const updateClienteMutation = useUpdateClienteMutation()
  const updateStatusMutation = useUpdateClienteStatusMutation()
  const removeClienteMutation = useRemoveClienteMutation()

  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [clienteParaInativar, setClienteParaInativar] = useState<Cliente | null>(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)

  const drawerInitialValues = useMemo(
    () => (clienteEditando ? clienteToFormValues(clienteEditando) : undefined),
    [clienteEditando],
  )

  const getMenuItems = useCallback(
    (cliente: Cliente): ClienteActionMenuItem[] => {
      if (!canWrite) return []

      if (cliente.status === 'inativo') {
        return [
          {
            id: 'reativar',
            label: 'Reativar',
            onClick: () => {
              void (async () => {
                try {
                  await updateStatusMutation.mutateAsync({ id: cliente.id, status: 'ativo' })
                  showToast({ message: 'Cliente reativado com sucesso.', variant: 'success' })
                } catch (error) {
                  showToast({
                    message: getClienteSaveErrorMessage(error, 'Não foi possível reativar o cliente.'),
                    variant: 'error',
                  })
                }
              })()
            },
          },
        ]
      }

      return [
        {
          id: 'editar',
          label: 'Editar',
          onClick: () => setClienteEditando(cliente),
        },
        {
          id: 'inativar',
          label: 'Inativar',
          onClick: () => setClienteParaInativar(cliente),
        },
        {
          id: 'excluir',
          label: 'Excluir',
          danger: true,
          onClick: () => setClienteParaExcluir(cliente),
        },
      ]
    },
    [canWrite, showToast, updateStatusMutation],
  )

  async function handleConfirmInativar() {
    if (!clienteParaInativar) return
    try {
      await updateStatusMutation.mutateAsync({ id: clienteParaInativar.id, status: 'inativo' })
      showToast({ message: 'Cliente inativado com sucesso.', variant: 'success' })
      setClienteParaInativar(null)
    } catch (error) {
      showToast({
        message: getClienteSaveErrorMessage(error, 'Não foi possível inativar o cliente.'),
        variant: 'error',
      })
    }
  }

  async function handleConfirmExcluir() {
    if (!clienteParaExcluir) return
    try {
      await removeClienteMutation.mutateAsync(clienteParaExcluir.id)
      showToast({ message: 'Cliente excluído com sucesso.', variant: 'success' })
      setClienteParaExcluir(null)
    } catch (error) {
      showToast({
        message: getClienteSaveErrorMessage(error, 'Não foi possível excluir o cliente.'),
        variant: 'error',
      })
    }
  }

  const actionsUi = (
    <>
      <ClienteDrawer
        open={Boolean(clienteEditando)}
        mode="edit"
        initialValues={drawerInitialValues}
        isSaving={updateClienteMutation.isPending}
        onClose={() => {
          if (!updateClienteMutation.isPending) setClienteEditando(null)
        }}
        onSubmit={async (values) => {
          if (!clienteEditando) return
          try {
            await updateClienteMutation.mutateAsync({ id: clienteEditando.id, values })
            showToast({ message: 'Cliente atualizado com sucesso.', variant: 'success' })
            setClienteEditando(null)
          } catch (error) {
            showToast({
              message: getClienteSaveErrorMessage(error, 'Erro ao atualizar cliente'),
              variant: 'error',
            })
            throw error
          }
        }}
      />

      <ConfirmModal
        open={Boolean(clienteParaInativar)}
        title="Inativar cliente"
        description={
          clienteParaInativar
            ? `Tem certeza que deseja inativar “${clienteParaInativar.nome}”? Você poderá reativá-lo depois.`
            : ''
        }
        variant="warning"
        confirmLabel="Inativar"
        confirmingLabel="Inativando..."
        isConfirming={updateStatusMutation.isPending}
        onClose={() => {
          if (!updateStatusMutation.isPending) setClienteParaInativar(null)
        }}
        onConfirm={() => void handleConfirmInativar()}
      />

      <ConfirmModal
        open={Boolean(clienteParaExcluir)}
        title="Excluir cliente"
        description={
          clienteParaExcluir
            ? `Tem certeza que deseja excluir permanentemente “${clienteParaExcluir.nome}”? Esta ação não pode ser desfeita.`
            : ''
        }
        variant="danger"
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isConfirming={removeClienteMutation.isPending}
        onClose={() => {
          if (!removeClienteMutation.isPending) setClienteParaExcluir(null)
        }}
        onConfirm={() => void handleConfirmExcluir()}
      />
    </>
  )

  return {
    canWrite,
    getMenuItems,
    actionsUi,
  }
}
