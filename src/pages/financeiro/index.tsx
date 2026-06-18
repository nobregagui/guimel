import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ContasPagarTab,
  ContasReceberTab,
  ExtratoTab,
  FinanceiroFormDrawer,
  FinanceiroHeader,
  TransferenciasTab,
  VisaoGeralTab,
  isFinanceiroAba,
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
  extrato: 'Conciliar extrato',
  transferencias: 'Nova transferência',
}

function resolveInitialTab(tabParam: string | null): FinanceiroAba {
  return isFinanceiroAba(tabParam) ? tabParam : 'visao-geral'
}

export function FinanceiroPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { getParam, consumeParam, searchParams } = useRouteQuery()
  const primaryActionRef = useRef<HTMLButtonElement>(null)

  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [abaAtiva, setAbaAtiva] = useState<FinanceiroAba>(() => {
    const tabFromState = getFinanceiroTabFromState(location.state)
    if (tabFromState) return tabFromState
    return resolveInitialTab(getParam(ROUTE_QUERY.tab))
  })
  const [highlightPrimaryAction, setHighlightPrimaryAction] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
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
    primaryActionRef.current?.focus({ preventScroll: true })

    const timer = window.setTimeout(() => setHighlightPrimaryAction(false), 2400)
    return () => window.clearTimeout(timer)
  }, [consumeParam, searchParams])

  const primaryActionLabel = PRIMARY_ACTION_LABEL[abaAtiva] ?? 'Novo lançamento'

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
        onPrimaryAction={() => setDrawerOpen(true)}
      />

      <div className={styles.body}>
        {abaAtiva === 'visao-geral' ? (
          <VisaoGeralTab periodo={periodo} />
        ) : null}

        {abaAtiva === 'a-pagar' ? (
          <ContasPagarTab />
        ) : null}

        {abaAtiva === 'a-receber' ? (
          <ContasReceberTab />
        ) : null}

        {abaAtiva === 'extrato' ? (
          <ExtratoTab
            periodo={periodo}
            contaId={contaExtrato}
            onContaChange={setContaExtrato}
          />
        ) : null}

        {abaAtiva === 'transferencias' ? (
          <TransferenciasTab
            periodo={periodo}
            contaId={contaTransferencias}
            onContaChange={setContaTransferencias}
          />
        ) : null}
      </div>

      <FinanceiroFormDrawer
        open={drawerOpen}
        tipo={abaAtiva}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
