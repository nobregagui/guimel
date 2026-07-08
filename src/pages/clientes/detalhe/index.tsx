import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
} from '@/features/clientes/hooks/useClientes'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { ClienteFormValues, ClientePedido } from '@/features/clientes/types'
import { clienteToFormValues, getClienteSaveErrorMessage } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

const EMPTY_PEDIDOS: ClientePedido[] = []

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inativarModalOpen, setInativarModalOpen] = useState(false)

  const clienteQuery = useClienteQuery(id)
  const pedidosQuery = useClientePedidosQuery(id)

  const clienteFromStore = useClientesStore((state) =>
    id ? state.clientes.find((item) => item.id === id) : undefined,
  )
  const pedidosFromStore = useClientesStore((state) =>
    id ? state.pedidosByClienteId[id] : undefined,
  )

  const updateClienteMutation = useUpdateClienteMutation()
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
        <Link to="/clientes" className={styles.backLinkStandalone}>Voltar para clientes</Link>
      </div>
    )
  }

  const pedidosPendentes = pedidos.filter((pedido) => pedido.status === 'pendente').length

  async function confirmInativar() {
    if (!cliente || cliente.status === 'inativo') return

    try {
      await removeClienteMutation.mutateAsync(cliente.id)
      showToast({ message: 'Cliente inativado com sucesso.', variant: 'success' })
      setInativarModalOpen(false)
    } catch {
      showToast({ message: 'Não foi possível inativar o cliente.', variant: 'error' })
    }
  }

  return (
    <div className={styles.root}>
      <ClienteDetalheHeader
        cliente={cliente}
        onEditar={() => setDrawerOpen(true)}
        onInativar={cliente.status !== 'inativo' ? () => setInativarModalOpen(true) : undefined}
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
        description={`Tem certeza que deseja inativar "${cliente.nome}"? O cadastro permanecerá no sistema, mas ficará com status inativo.`}
        variant="danger"
        confirmLabel="Inativar cliente"
        confirmingLabel="Inativando..."
        isConfirming={removeClienteMutation.isPending}
        onClose={() => setInativarModalOpen(false)}
        onConfirm={confirmInativar}
      />
    </div>
  )
}
