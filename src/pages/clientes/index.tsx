import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  AnaliseTab,
  ClienteDrawer,
  ClientesHeader,
  ClientesQueryFeedback,
  ListaClientesTab,
  VisaoGeralTab,
  type ClienteFiltro,
  type ClientesAba,
} from '@/features/clientes'
import {
  useClientesQuery,
  useCreateClienteMutation,
} from '@/features/clientes/hooks/useClientes'
import { getClienteSaveErrorMessage } from '@/features/clientes/utils'
import { useToast } from '@/components/ui/Toast'
import { getBuscaFromState } from '@/routes/navigationState'

import styles from './ClientesPage.module.css'

export function ClientesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const clientesQuery = useClientesQuery()
  const createClienteMutation = useCreateClienteMutation()

  const [abaAtiva, setAbaAtiva] = useState<ClientesAba>('visao-geral')
  const [filtro, setFiltro] = useState<ClienteFiltro>('todos')
  const [busca, setBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const buscaFromState = getBuscaFromState(location.state)
    if (!buscaFromState) return

    setBusca(buscaFromState)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  return (
    <div className={styles.root}>
      <ClientesHeader
        abaAtiva={abaAtiva}
        busca={busca}
        onAbaChange={setAbaAtiva}
        onBuscaChange={setBusca}
        onNovoCliente={() => setDrawerOpen(true)}
      />

      <div className={styles.body}>
        <ClientesQueryFeedback
          isLoading={clientesQuery.isLoading}
          isError={clientesQuery.isError}
          onRetry={() => clientesQuery.refetch()}
        >
          {abaAtiva === 'visao-geral' ? (
            <VisaoGeralTab busca={busca} onVerTodosClientes={() => setAbaAtiva('clientes')} />
          ) : null}
          {abaAtiva === 'clientes' ? (
            <ListaClientesTab filtro={filtro} busca={busca} onFiltroChange={setFiltro} />
          ) : null}
          {abaAtiva === 'analise' ? <AnaliseTab busca={busca} /> : null}
        </ClientesQueryFeedback>
      </div>

      <ClienteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isSaving={createClienteMutation.isPending}
        onSubmit={async (values) => {
          try {
            const cliente = await createClienteMutation.mutateAsync(values)
            showToast({
              message: `Cliente "${cliente.nome}" cadastrado com sucesso.`,
              variant: 'success',
            })
            navigate(`/clientes/${cliente.id}`)
          } catch (error) {
            showToast({
              message: getClienteSaveErrorMessage(error, 'Erro ao cadastrar cliente'),
              variant: 'error',
            })
            throw error
          }
        }}
      />
    </div>
  )
}
