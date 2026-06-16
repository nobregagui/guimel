import { useState } from 'react'

import {
  ContasPagarTab,
  ContasReceberTab,
  ExtratoTab,
  FinanceiroHeader,
  TransferenciasTab,
  VisaoGeralTab,
  type ContasPagarFiltro,
  type ContasReceberFiltro,
  type ExtratoContaFiltro,
  type ExtratoFiltro,
  type FinanceiroAba,
  type FiltroLancamento,
  type Periodo,
  type TransferenciasFiltro,
} from '@/features/financeiro'

import styles from './FinanceiroPage.module.css'

const PRIMARY_ACTION_LABEL: Partial<Record<FinanceiroAba, string>> = {
  'a-pagar': 'Nova conta a pagar',
  'a-receber': 'Nova conta a receber',
  extrato: 'Conciliar extrato',
  transferencias: 'Nova transferência',
}

export function FinanceiroPage() {
  const [ periodo, setPeriodo] = useState<Periodo>('mes')
  const [abaAtiva, setAbaAtiva] = useState<FinanceiroAba>('visao-geral')
  const [filtroVisaoGeral, setFiltroVisaoGeral] = useState<FiltroLancamento>('todos')
  const [filtroContasPagar, setFiltroContasPagar] = useState<ContasPagarFiltro>('todos')
  const [filtroContasReceber, setFiltroContasReceber] = useState<ContasReceberFiltro>('todos')
  const [filtroExtrato, setFiltroExtrato] = useState<ExtratoFiltro>('todos')
  const [contaExtrato, setContaExtrato] = useState<ExtratoContaFiltro>('todas')
  const [filtroTransferencias, setFiltroTransferencias] = useState<TransferenciasFiltro>('todos')
  const [contaTransferencias, setContaTransferencias] = useState<ExtratoContaFiltro>('todas')

  const primaryActionLabel = PRIMARY_ACTION_LABEL[abaAtiva] ?? 'Novo lançamento'

  return (
    <div className={styles.root}>
      <FinanceiroHeader
        periodo={ periodo}
        abaAtiva={abaAtiva}
        onPeriodoChange={setPeriodo}
        onAbaChange={setAbaAtiva}
        primaryActionLabel={primaryActionLabel}
      />

      <div className={styles.body}>
        {abaAtiva === 'visao-geral' ? (
          <VisaoGeralTab periodo={ periodo} filtro={filtroVisaoGeral} onFiltroChange={setFiltroVisaoGeral} />
        ) : null}

        {abaAtiva === 'a-pagar' ? (
          <ContasPagarTab filtro={filtroContasPagar} onFiltroChange={setFiltroContasPagar} />
        ) : null}

        {abaAtiva === 'a-receber' ? (
          <ContasReceberTab filtro={filtroContasReceber} onFiltroChange={setFiltroContasReceber} />
        ) : null}

        {abaAtiva === 'extrato' ? (
          <ExtratoTab
            periodo={ periodo}
            filtro={filtroExtrato}
            contaId={contaExtrato}
            onFiltroChange={setFiltroExtrato}
            onContaChange={setContaExtrato}
          />
        ) : null}

        {abaAtiva === 'transferencias' ? (
          <TransferenciasTab
            periodo={ periodo}
            filtro={filtroTransferencias}
            contaId={contaTransferencias}
            onFiltroChange={setFiltroTransferencias}
            onContaChange={setContaTransferencias}
          />
        ) : null}
      </div>
    </div>
  )
}
