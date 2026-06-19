import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ClienteDrawer } from '@/features/clientes/components/ClienteDrawer'
import { ClienteDetalheDados } from '@/features/clientes/components/detalhe/ClienteDetalheDados'
import { ClienteDetalheHeader } from '@/features/clientes/components/detalhe/ClienteDetalheHeader'
import { ClienteDetalheKpis } from '@/features/clientes/components/detalhe/ClienteDetalheKpis'
import { ClienteDetalhePedidos } from '@/features/clientes/components/detalhe/ClienteDetalhePedidos'
import { ClienteDetalheResumo } from '@/features/clientes/components/detalhe/ClienteDetalheResumo'
import type { ClienteFormValues } from '@/features/clientes/types'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const cliente = useClientesStore((state) => state.clientes.find((item) => item.id === id))
  const pedidosRaw = useClientesStore((state) => state.pedidos)
  const updateCliente = useClientesStore((state) => state.updateCliente)

  const pedidos = useMemo(
    () =>
      pedidosRaw
        .filter((pedido) => pedido.clienteId === id)
        .sort((a, b) => b.dataIso.localeCompare(a.dataIso)),
    [pedidosRaw, id],
  )

  const initialValues = useMemo<ClienteFormValues | undefined>(() => {
    if (!cliente) return undefined

    return {
      tipo: cliente.tipo,
      nome: cliente.nome,
      nomeFantasia: cliente.nomeFantasia ?? '',
      documento: cliente.documento,
      email: cliente.email,
      telefone: cliente.telefone,
      segmento: cliente.segmento,
      cep: cliente.cep,
      logradouro: cliente.logradouro,
      numero: cliente.numero,
      complemento: cliente.complemento,
      bairro: cliente.bairro,
      cidade: cliente.cidade,
      estado: cliente.estado,
      observacao: cliente.observacao ?? '',
      formaPagamentoPreferida: cliente.formaPagamentoPreferida,
      parcelasPreferidas: cliente.parcelasPreferidas,
      taxaJurosMensalPreferida: cliente.taxaJurosMensalPreferida,
      diasVencimentoPreferidos: cliente.diasVencimentoPreferidos,
    }
  }, [cliente])

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

  return (
    <div className={styles.root}>
      <ClienteDetalheHeader cliente={cliente} onEditar={() => setDrawerOpen(true)} />

      <div className={styles.body}>
        <ClienteDetalheKpis cliente={cliente} />

        <div className={styles.contentGrid}>
          <div className={styles.mainCol}>
            <ClienteDetalheDados cliente={cliente} />
            <ClienteDetalhePedidos pedidos={pedidos} />
          </div>
          <ClienteDetalheResumo cliente={cliente} pedidosPendentes={pedidosPendentes} />
        </div>
      </div>

      <ClienteDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(values) => {
          updateCliente(cliente.id, values)
          setDrawerOpen(false)
        }}
        mode="edit"
        initialValues={initialValues}
      />
    </div>
  )
}
