import { lazy, Suspense, useState } from 'react'

import { ConciliacaoDrawer, ConciliacaoHeader, useConciliacaoStore } from '@/features/conciliacaoBancaria'
import { ColumnConfigModal } from '@/features/conciliacaoBancaria/components/ColumnConfigModal'
import { ImportacaoModal } from '@/features/conciliacaoBancaria/components/ImportacaoModal'
import { RelatorioModal } from '@/features/conciliacaoBancaria/components/RelatorioModal'
import { ShortcutsModal } from '@/features/conciliacaoBancaria/components/ShortcutsModal'
import { SkeletonTable } from '@/features/conciliacaoBancaria/components/SkeletonTable'
import { useColumnConfig, EXTRATO_COLUMNS, ERP_COLUMNS } from '@/features/conciliacaoBancaria/hooks/useColumnConfig'
import { useKeyboardShortcuts } from '@/features/conciliacaoBancaria/hooks/useKeyboardShortcuts'
import type { ConciliacaoAba } from '@/features/conciliacaoBancaria/types'
import { useToast } from '@/components/ui/Toast'

import styles from './ConciliacaoBancariaPage.module.css'

// ── Lazy-loaded tab components ─────────────────────────────────────────────────
const DashboardTab = lazy(() =>
  import('@/features/conciliacaoBancaria/components/tabs/DashboardTab').then((m) => ({ default: m.DashboardTab })),
)
const ConciliacaoTab = lazy(() =>
  import('@/features/conciliacaoBancaria/components/tabs/ConciliacaoTab').then((m) => ({ default: m.ConciliacaoTab })),
)
const RegrasTab = lazy(() =>
  import('@/features/conciliacaoBancaria/components/tabs/RegrasTab').then((m) => ({ default: m.RegrasTab })),
)
const AnalyticsTab = lazy(() =>
  import('@/features/conciliacaoBancaria/components/tabs/AnalyticsTab').then((m) => ({ default: m.AnalyticsTab })),
)
const HistoricoTab = lazy(() =>
  import('@/features/conciliacaoBancaria/components/tabs/HistoricoTab').then((m) => ({ default: m.HistoricoTab })),
)

function TabFallback() {
  return (
    <div style={{ padding: '20px 0' }}>
      <SkeletonTable rows={8} columns={5} />
    </div>
  )
}

export function ConciliacaoBancariaPage() {
  const { showToast } = useToast()
  const aplicarRegras = useConciliacaoStore((s) => s.aplicarRegras)

  const [abaAtiva, setAbaAtiva] = useState<ConciliacaoAba>('dashboard')
  const [importacaoAberta, setImportacaoAberta] = useState(false)
  const [relatorioAberto, setRelatorioAberto] = useState(false)
  const [colConfigAberto, setColConfigAberto] = useState(false)
  const [shortcutsAberto, setShortcutsAberto] = useState(false)

  // ── Column config (persisted in localStorage) ─────────────────────────────
  const extratoColConfig = useColumnConfig('extrato', EXTRATO_COLUMNS)
  const erpColConfig = useColumnConfig('erp', ERP_COLUMNS)

  function handleAplicarRegras() {
    const count = aplicarRegras()
    if (count > 0) {
      showToast({ message: `${count} conciliação(ões) automática(s) realizada(s).`, variant: 'success' })
    } else {
      showToast({ message: 'Nenhuma correspondência encontrada pelas regras ativas.', variant: 'info' })
    }
  }

  function handleImportado(count: number) {
    showToast({
      message: `${count} movimentos importados! Acesse a aba Conciliação para vincular.`,
      variant: 'success',
    })
    setAbaAtiva('conciliacao')
  }

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useKeyboardShortcuts([
    { key: 'r', ctrlKey: true, description: 'Aplicar regras', handler: handleAplicarRegras },
    { key: 'i', ctrlKey: true, description: 'Importar extrato', handler: () => setImportacaoAberta(true) },
    { key: 'e', ctrlKey: true, description: 'Exportar relatório', handler: () => setRelatorioAberto(true) },
    { key: '?', description: 'Atalhos de teclado', handler: () => setShortcutsAberto(true) },
    { key: '1', altKey: true, description: 'Dashboard', handler: () => setAbaAtiva('dashboard') },
    { key: '2', altKey: true, description: 'Conciliação', handler: () => setAbaAtiva('conciliacao') },
    { key: '3', altKey: true, description: 'Regras', handler: () => setAbaAtiva('regras') },
    { key: '4', altKey: true, description: 'Analytics', handler: () => setAbaAtiva('analytics') },
    { key: '5', altKey: true, description: 'Histórico', handler: () => setAbaAtiva('historico') },
  ])

  return (
    <div className={styles.root}>
      <ConciliacaoHeader
        abaAtiva={abaAtiva}
        onAbaChange={setAbaAtiva}
        onImportar={() => setImportacaoAberta(true)}
        onExportar={() => setRelatorioAberto(true)}
        onAplicarRegras={handleAplicarRegras}
        onConfigColunas={() => setColConfigAberto(true)}
        onAjuda={() => setShortcutsAberto(true)}
      />

      <div className={styles.body}>
        <Suspense fallback={<TabFallback />}>
          {abaAtiva === 'dashboard' ? <DashboardTab /> : null}
          {abaAtiva === 'conciliacao' ? <ConciliacaoTab /> : null}
          {abaAtiva === 'regras' ? <RegrasTab /> : null}
          {abaAtiva === 'analytics' ? <AnalyticsTab /> : null}
          {abaAtiva === 'historico' ? <HistoricoTab /> : null}
        </Suspense>
      </div>

      <ConciliacaoDrawer />

      <ImportacaoModal
        open={importacaoAberta}
        onClose={() => setImportacaoAberta(false)}
        onImportado={handleImportado}
      />

      <RelatorioModal
        open={relatorioAberto}
        onClose={() => setRelatorioAberto(false)}
      />

      <ColumnConfigModal
        open={colConfigAberto}
        extratoColumns={extratoColConfig.columns}
        erpColumns={erpColConfig.columns}
        onToggleExtrato={extratoColConfig.toggleColumn}
        onToggleErp={erpColConfig.toggleColumn}
        onResetExtrato={extratoColConfig.resetToDefaults}
        onResetErp={erpColConfig.resetToDefaults}
        onClose={() => setColConfigAberto(false)}
      />

      <ShortcutsModal
        open={shortcutsAberto}
        onClose={() => setShortcutsAberto(false)}
      />
    </div>
  )
}
