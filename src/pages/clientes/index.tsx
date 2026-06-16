import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  AnaliseTab,
  ClienteDrawer,
  ClientesHeader,
  ListaClientesTab,
  VisaoGeralTab,
  useClientesStore,
  type ClienteFiltro,
  type ClientesAba,
} from '@/features/clientes'

import styles from './ClientesPage.module.css'

export function ClientesPage() {
  const navigate = useNavigate()
  const addCliente = useClientesStore((state) => state.addCliente)

  const [abaAtiva, setAbaAtiva] = useState<ClientesAba>('visao-geral')
  const [filtro, setFiltro] = useState<ClienteFiltro>('todos')
  const [busca, setBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

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
        {abaAtiva === 'visao-geral' ? <VisaoGeralTab busca={busca} /> : null}
        {abaAtiva === 'clientes' ? (
          <ListaClientesTab filtro={filtro} busca={busca} onFiltroChange={setFiltro} />
        ) : null}
        {abaAtiva === 'analise' ? <AnaliseTab busca={busca} /> : null}
      </div>

      <ClienteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(values) => {
          const cliente = addCliente(values)
          navigate(`/clientes/${cliente.id}`)
        }}
      />
    </div>
  )
}
