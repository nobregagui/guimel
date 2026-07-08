import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useToast } from '@/components/ui/Toast'
import {
  ContasPagarTab,
  ContasReceberTab,
  ExtratoTab,
  FinanceiroFormDrawer,
  FinanceiroHeader,
  TransferenciasTab,
  VisaoGeralTab,
  financeiroQueryKeys,
  isFinanceiroAba,
  type ContaPagar,
  type ContaReceber,
  type ExtratoContaFiltro,
  type FinanceiroAba,
  type Periodo,
} from '@/features/financeiro'
import { useRouteQuery } from '@/hooks/useRouteQuery'
import { getFinanceiroTabFromState } from '@/routes/navigationState'
import { ROUTE_QUERY, isRouteIntent } from '@/routes/queryState'

import styles from './FinanceiroPage.module.css'

const PRIMARY_ACTION_LABEL: Partial<Record<FinanceiroAba, string>> = {
  'a-pagar': 'Nova conta a pagar',
  'a-receber': 'Nova conta a receber',
  extrato: 'Novo lançamento',
  transferencias: 'Nova transferência',
}

function resolveInitialTab(tabParam: string | null): FinanceiroAba {
  return isFinanceiroAba(tabParam) ? tabParam : 'visao-geral'
}

export function FinanceiroPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getParam, consumeParam, searchParams } = useRouteQuery()
  const queryClient = useQueryClient()
  const primaryActionRef = useRef<HTMLButtonElement>(null)

  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [abaAtiva, setAbaAtiva] = useState<FinanceiroAba>(() => {
    const tabFromState = getFinanceiroTabFromState(location.state)
    if (tabFromState) return tabFromState
    return resolveInitialTab(getParam(ROUTE_QUERY.tab))
  })
  const [highlightPrimaryAction, setHighlightPrimaryAction] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [editReceber, setEditReceber] = useState<ContaReceber | null>(null)
  const [editPagar, setEditPagar] = useState<ContaPagar | null>(null)
  const [contaExtrato, setContaExtrato] = useState<ExtratoContaFiltro>('todas')
  const [contaTransferencias, setContaTransferencias] = useState<ExtratoContaFiltro>('todas')

  useEffect(() => {
    const tabFromState = getFinanceiroTabFromState(location.state)
    if (!tabFromState) return

    setAbaAtiva(tabFromState)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const tabParam = getParam(ROUTE_QUERY.tab)
    if (isFinanceiroAba(tabParam)) {
      setAbaAtiva(tabParam)
    }
  }, [getParam, searchParams])

  useEffect(() => {
    const intent = consumeParam(ROUTE_QUERY.intent)
    if (!isRouteIntent(intent)) return

    setHighlightPrimaryAction(true)
    openCreateDrawer()
    primaryActionRef.current?.focus({ preventScroll: true })

    const timer = window.setTimeout(() => setHighlightPrimaryAction(false), 2400)
    return () => window.clearTimeout(timer)
  }, [consumeParam, searchParams])

  const primaryActionLabel = PRIMARY_ACTION_LABEL[abaAtiva] ?? 'Novo lançamento'

  function openCreateDrawer() {
    setDrawerMode('create')
    setEditReceber(null)
    setEditPagar(null)
    setDrawerOpen(true)
  }

  function openEditReceber(titulo: ContaReceber) {
    setAbaAtiva('a-receber')
    setDrawerMode('edit')
    setEditReceber(titulo)
    setEditPagar(null)
    setDrawerOpen(true)
  }

  function openEditPagar(titulo: ContaPagar) {
    setAbaAtiva('a-pagar')
    setDrawerMode('edit')
    setEditPagar(titulo)
    setEditReceber(null)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setDrawerMode('create')
    setEditReceber(null)
    setEditPagar(null)
  }

  function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.all })
    showToast({ message: 'Dados atualizados.', variant: 'success' })
  }

  function handleExport() {
    showToast({ message: 'Use Exportar CSV na tabela da aba ativa.', variant: 'info' })
  }

  function handleImport() {
    showToast({ message: 'Importação OFX/CSV será integrada com o backend.', variant: 'info' })
  }

  return (
    <div className={styles.root}>
      <FinanceiroHeader
        periodo={periodo}
        abaAtiva={abaAtiva}
        onPeriodoChange={setPeriodo}
        onAbaChange={setAbaAtiva}
        primaryActionLabel={primaryActionLabel}
        primaryActionRef={primaryActionRef}
        highlightPrimaryAction={highlightPrimaryAction}
        onPrimaryAction={openCreateDrawer}
        onExport={handleExport}
        onImport={abaAtiva === 'extrato' ? handleImport : undefined}
        onRefresh={handleRefresh}
      />

      <div className={styles.body}>
        {abaAtiva === 'visao-geral' ? (
          <VisaoGeralTab periodo={periodo} />
        ) : null}

        {abaAtiva === 'a-pagar' ? (
          <ContasPagarTab onNovo={openCreateDrawer} onEditar={openEditPagar} />
        ) : null}

        {abaAtiva === 'a-receber' ? (
          <ContasReceberTab onNovo={openCreateDrawer} onEditar={openEditReceber} />
        ) : null}

        {abaAtiva === 'extrato' ? (
          <ExtratoTab
            periodo={periodo}
            contaId={contaExtrato}
            onContaChange={setContaExtrato}
            onNovo={openCreateDrawer}
          />
        ) : null}

        {abaAtiva === 'transferencias' ? (
          <TransferenciasTab
            periodo={periodo}
            contaId={contaTransferencias}
            onContaChange={setContaTransferencias}
            onNovo={openCreateDrawer}
          />
        ) : null}
      </div>

      <FinanceiroFormDrawer
        open={drawerOpen}
        tipo={abaAtiva}
        mode={drawerMode}
        editReceber={editReceber}
        editPagar={editPagar}
        onClose={closeDrawer}
      />
    </div>
  )
}
