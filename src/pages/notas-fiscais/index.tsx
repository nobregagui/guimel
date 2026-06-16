import { useState } from 'react'

import {
  NotaFiscalDetalheDrawer,
  NotaFiscalDevolucaoDrawer,
  NotaFiscalDrawer,
  NotasFiscaisHeader,
  NotasFiscaisKpiCards,
  NotasFiscaisTable,
  TypeSelectorSection,
  useNotasFiscaisStore,
  type NotaFiscal,
  type NotasFiscaisAba,
  type TipoDevolucao,
  type TipoNota,
} from '@/features/notasFiscais'
import { getTipoDevolucaoFromNota } from '@/features/notasFiscais/utils'

import styles from './NotasFiscaisPage.module.css'

export function NotasFiscaisPage() {
  const [abaAtiva, setAbaAtiva] = useState<NotasFiscaisAba>('visao-geral')
  const [busca, setBusca] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTipo, setDrawerTipo] = useState<TipoNota | null>(null)
  const [devolucaoOpen, setDevolucaoOpen] = useState(false)
  const [devolucaoNotaId, setDevolucaoNotaId] = useState<string | undefined>()
  const [devolucaoTipo, setDevolucaoTipo] = useState<TipoDevolucao>('devolucao_venda')
  const [detalheOpen, setDetalheOpen] = useState(false)
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null)

  const notas = useNotasFiscaisStore((state) => state.notas)
  const addNota = useNotasFiscaisStore((state) => state.addNota)
  const addNotaDevolucao = useNotasFiscaisStore((state) => state.addNotaDevolucao)
  const cancelarNota = useNotasFiscaisStore((state) => state.cancelarNota)

  function handleSelectTipo(tipo: TipoNota) {
    setDrawerTipo(tipo)
    setDrawerOpen(true)
  }

  function openDevolucaoDrawer(notaOriginalId?: string, tipo?: TipoDevolucao) {
    setDevolucaoNotaId(notaOriginalId)
    setDevolucaoTipo(tipo ?? 'devolucao_venda')
    setDevolucaoOpen(true)
  }

  function closeDevolucaoDrawer() {
    setDevolucaoOpen(false)
    setDevolucaoNotaId(undefined)
  }

  function handleVerDetalhe(nota: NotaFiscal) {
    setSelectedNota(nota)
    setDetalheOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setDrawerTipo(null)
  }

  function closeDetalhe() {
    setDetalheOpen(false)
    setSelectedNota(null)
  }

  function handleDevolverFromDetalhe(nota: NotaFiscal) {
    const tipo = getTipoDevolucaoFromNota(nota)
    if (!tipo) return
    closeDetalhe()
    openDevolucaoDrawer(nota.id, tipo)
  }

  return (
    <div className={styles.root}>
      <NotasFiscaisHeader
        abaAtiva={abaAtiva}
        busca={busca}
        onAbaChange={setAbaAtiva}
        onBuscaChange={setBusca}
        onNovaNota={() => setAbaAtiva('visao-geral')}
      />

      <main className={styles.body}>
        {abaAtiva === 'visao-geral' ? (
          <>
            <NotasFiscaisKpiCards notas={notas} />
            <TypeSelectorSection
              onSelect={handleSelectTipo}
              onSelectDevolucao={() => openDevolucaoDrawer()}
            />
            <NotasFiscaisTable
              notas={notas}
              buscaGlobal={busca}
              onVerDetalhe={handleVerDetalhe}
            />
          </>
        ) : null}

        {abaAtiva === 'notas' ? (
          <>
            <NotasFiscaisKpiCards notas={notas} />
            <NotasFiscaisTable
              notas={notas}
              buscaGlobal={busca}
              onVerDetalhe={handleVerDetalhe}
            />
          </>
        ) : null}

        {abaAtiva === 'relatorios' ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Relatórios fiscais</h2>
            </div>
            <p className={styles.emptyState}>
              Em breve: SPED Fiscal, DCTF, EFD Contribuições e mais.
            </p>
          </div>
        ) : null}
      </main>

      {drawerOpen && drawerTipo ? (
        <NotaFiscalDrawer
          tipo={drawerTipo}
          onClose={closeDrawer}
          onSubmit={(values) => {
            addNota(values)
            closeDrawer()
            setAbaAtiva('notas')
          }}
        />
      ) : null}

      {devolucaoOpen ? (
        <NotaFiscalDevolucaoDrawer
          notas={notas}
          notaOriginalId={devolucaoNotaId}
          tipoDevolucaoInicial={devolucaoTipo}
          onClose={closeDevolucaoDrawer}
          onSubmit={(values) => {
            addNotaDevolucao(values)
            closeDevolucaoDrawer()
            setAbaAtiva('notas')
          }}
        />
      ) : null}

      {detalheOpen && selectedNota ? (
        <NotaFiscalDetalheDrawer
          nota={selectedNota}
          onClose={closeDetalhe}
          onDevolver={handleDevolverFromDetalhe}
          onCancelar={(motivo) => {
            cancelarNota(selectedNota.id, motivo)
            closeDetalhe()
          }}
        />
      ) : null}
    </div>
  )
}
