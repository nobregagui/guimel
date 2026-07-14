import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Loading } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { ClienteDrawer } from '@/features/clientes/components/ClienteDrawer'
import { ClienteDetalheDados } from '@/features/clientes/components/detalhe/ClienteDetalheDados'
import { ClienteDetalheHeader } from '@/features/clientes/components/detalhe/ClienteDetalheHeader'
import { ClienteDetalheKpis } from '@/features/clientes/components/detalhe/ClienteDetalheKpis'
import { ClienteDetalhePedidos } from '@/features/clientes/components/detalhe/ClienteDetalhePedidos'
import { ClienteDetalheResumo } from '@/features/clientes/components/detalhe/ClienteDetalheResumo'
import {
  useClientePedidosQuery,
  useClienteQuery,
  useRemoveClienteMutation,
  useUpdateClienteMutation,
  useUpdateClienteStatusMutation,
} from '@/features/clientes/hooks/useClientes'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { ClienteFormValues, ClientePedido } from '@/features/clientes/types'
import { clienteToFormValues, getClienteSaveErrorMessage } from '@/features/clientes/utils'
import { APP_PATHS } from '@/routes/paths'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

const EMPTY_PEDIDOS: ClientePedido[] = []

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inativarModalOpen, setInativarModalOpen] = useState(false)
  const [excluirModalOpen, setExcluirModalOpen] = useState(false)

  const clienteQuery = useClienteQuery(id)
  const pedidosQuery = useClientePedidosQuery(id)

  const clienteFromStore = useClientesStore((state) =>
    id ? state.clientes.find((item) => item.id === id) : undefined,
  )
  const pedidosFromStore = useClientesStore((state) =>
    id ? state.pedidosByClienteId[id] : undefined,
  )

  const updateClienteMutation = useUpdateClienteMutation()
  const updateStatusMutation = useUpdateClienteStatusMutation()
  const removeClienteMutation = useRemoveClienteMutation()

  const cliente = clienteQuery.data ?? clienteFromStore

  const pedidos = useMemo(() => {
    const raw = pedidosQuery.data ?? pedidosFromStore ?? EMPTY_PEDIDOS
    if (raw.length <= 1) return raw
    return [...raw].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
  }, [pedidosFromStore, pedidosQuery.data])

  const initialValues = useMemo<ClienteFormValues | undefined>(() => {
    if (!cliente) return undefined
    return clienteToFormValues(cliente)
  }, [cliente])

  if (clienteQuery.isLoading && !cliente) {
    return (
      <div className={styles.notFound}>
        <Loading label="Carregando cliente..." layout="fullscreen" />
      </div>
    )
  }

  if (clienteQuery.isError && !cliente) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Erro ao carregar cliente</h1>
        <p className={styles.notFoundText}>Não foi possível buscar os dados deste cadastro.</p>
        <button type="button" className={styles.backLinkStandalone} onClick={() => clienteQuery.refetch()}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Cliente não encontrado</h1>
        <p className={styles.notFoundText}>O cadastro solicitado não existe ou foi removido.</p>
        <Link to={APP_PATHS.clientes} className={styles.backLinkStandalone}>
          Voltar para clientes
        </Link>
      </div>
    )
  }

  const pedidosPendentes = pedidos.filter((pedido) => pedido.status === 'pendente').length
  const isInativo = cliente.status === 'inativo'

  async function confirmInativar() {
    try {
      await updateStatusMutation.mutateAsync({ id: cliente.id, status: 'inativo' })
      showToast({ message: 'Cliente inativado com sucesso.', variant: 'success' })
      setInativarModalOpen(false)
    } catch (error) {
      showToast({
        message: getClienteSaveErrorMessage(error, 'Não foi possível inativar o cliente.'),
        variant: 'error',
      })
    }
  }

  async function confirmExcluir() {
    try {
      await removeClienteMutation.mutateAsync(cliente.id)
      showToast({ message: 'Cliente excluído com sucesso.', variant: 'success' })
      navigate(APP_PATHS.clientes)
    } catch (error) {
      showToast({
        message: getClienteSaveErrorMessage(error, 'Não foi possível excluir o cliente.'),
        variant: 'error',
      })
    }
  }

  async function handleReativar() {
    try {
      await updateStatusMutation.mutateAsync({ id: cliente.id, status: 'ativo' })
      showToast({ message: 'Cliente reativado com sucesso.', variant: 'success' })
    } catch (error) {
      showToast({
        message: getClienteSaveErrorMessage(error, 'Não foi possível reativar o cliente.'),
        variant: 'error',
      })
    }
  }

  return (
    <div className={styles.root}>
      <ClienteDetalheHeader
        cliente={cliente}
        onEditar={isInativo ? undefined : () => setDrawerOpen(true)}
        onInativar={isInativo ? undefined : () => setInativarModalOpen(true)}
        onExcluir={isInativo ? undefined : () => setExcluirModalOpen(true)}
        onReativar={isInativo ? () => void handleReativar() : undefined}
        isReativando={updateStatusMutation.isPending}
      />

      <div className={styles.body}>
        <ClienteDetalheKpis cliente={cliente} />

        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            <ClienteDetalheDados cliente={cliente} />
            <ClienteDetalhePedidos
              pedidos={pedidos}
              isLoading={pedidosQuery.isLoading && pedidos.length === 0}
            />
          </div>
          <ClienteDetalheResumo cliente={cliente} pedidosPendentes={pedidosPendentes} />
        </div>
      </div>

      <ClienteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isSaving={updateClienteMutation.isPending}
        onSubmit={async (values) => {
          try {
            await updateClienteMutation.mutateAsync({ id: cliente.id, values })
            showToast({ message: 'Cliente atualizado com sucesso.', variant: 'success' })
            setDrawerOpen(false)
          } catch (error) {
            showToast({
              message: getClienteSaveErrorMessage(error, 'Erro ao atualizar cliente'),
              variant: 'error',
            })
            throw error
          }
        }}
        mode="edit"
        initialValues={initialValues}
      />

      <ConfirmModal
        open={inativarModalOpen}
        title="Inativar cliente"
        description={`Tem certeza que deseja inativar “${cliente.nome}”? Você poderá reativá-lo depois.`}
        variant="warning"
        confirmLabel="Inativar"
        confirmingLabel="Inativando..."
        isConfirming={updateStatusMutation.isPending}
        onClose={() => {
          if (!updateStatusMutation.isPending) setInativarModalOpen(false)
        }}
        onConfirm={() => void confirmInativar()}
      />

      <ConfirmModal
        open={excluirModalOpen}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir permanentemente “${cliente.nome}”? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isConfirming={removeClienteMutation.isPending}
        onClose={() => {
          if (!removeClienteMutation.isPending) setExcluirModalOpen(false)
        }}
        onConfirm={() => void confirmExcluir()}
      />
    </div>
  )
}
