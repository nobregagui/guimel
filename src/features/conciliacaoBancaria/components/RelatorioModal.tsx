import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
  X,
} from 'lucide-react'

import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import { formatBRL, formatBRLCompact } from '@/features/conciliacaoBancaria/utils'
import { useToast } from '@/components/ui/Toast'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

type RelatorioTipo = 'resumo' | 'extrato' | 'conciliacoes' | 'pendencias'
type ExportFormato = 'pdf' | 'xlsx' | 'csv'

interface RelatorioModalProps {
  open: boolean
  onClose: () => void
}

const TIPO_CONFIG: Record<RelatorioTipo, { label: string; desc: string; icon: React.ReactNode }> = {
  resumo: {
    label: 'Resumo Executivo',
    desc: 'Visão geral com KPIs, saldos e percentuais de conciliação.',
    icon: <TrendingUp size={15} />,
  },
  extrato: {
    label: 'Extrato Bancário',
    desc: 'Todos os movimentos do extrato com status de conciliação.',
    icon: <FileText size={15} />,
  },
  conciliacoes: {
    label: 'Conciliações Realizadas',
    desc: 'Lista detalhada de todas as conciliações da sessão.',
    icon: <FileText size={15} />,
  },
  pendencias: {
    label: 'Pendências',
    desc: 'Movimentos e lançamentos ainda não conciliados.',
    icon: <FileText size={15} />,
  },
}

const PERIODOS = [
  { id: 'junho2026', label: 'Junho 2026' },
  { id: 'maio2026', label: 'Maio 2026' },
  { id: 'abril2026', label: 'Abril 2026' },
  { id: 'q2-2026', label: '2º Trimestre 2026' },
  { id: 'semestre-2026', label: '1º Semestre 2026' },
]

export function RelatorioModal({ open, onClose }: RelatorioModalProps) {
  const { showToast } = useToast()

  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const erpLancamentos = useConciliacaoStore((s) => s.erpLancamentos)
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)
  const contas = useConciliacaoStore((s) => s.contas)

  const [tipo, setTipo] = useState<RelatorioTipo>('resumo')
  const [periodo, setPeriodo] = useState(PERIODOS[0].id)
  const [contaId, setContaId] = useState('todas')
  const [exportando, setExportando] = useState(false)

  const conciliadosExtrato = extratoItems.filter((e) => e.status === 'conciliado').length
  const pendentesExtrato = extratoItems.filter((e) => e.status === 'pendente').length
  const pct = extratoItems.length > 0 ? Math.round((conciliadosExtrato / extratoItems.length) * 100) : 0
  const totalEntradas = extratoItems.filter((e) => e.tipo === 'credito').reduce((a, e) => a + e.valor, 0)
  const totalSaidas = extratoItems.filter((e) => e.tipo === 'debito').reduce((a, e) => a + e.valor, 0)

  async function handleExportar(formato: ExportFormato) {
    setExportando(true)
    await delay(800 + Math.random() * 400)
    setExportando(false)

    const ext = formato === 'pdf' ? 'PDF' : formato === 'xlsx' ? 'Excel' : 'CSV'
    const nomeArq = `${tipo}_${periodo}.${formato}`
    showToast({
      message: `Relatório "${TIPO_CONFIG[tipo].label}" exportado como ${ext} (${nomeArq}).`,
      variant: 'success',
    })
    onClose()
  }

  function handleImprimir() {
    showToast({
      message: 'Preparando documento para impressão...',
      variant: 'info',
    })
    // In a real implementation, open a print-optimized page
    setTimeout(() => window.print(), 500)
    onClose()
  }

  if (!open) return null

  const periodoLabel = PERIODOS.find((p) => p.id === periodo)?.label ?? periodo

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 50 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        style={{ width: 620 }}
        role="dialog"
        aria-modal
        aria-labelledby="relatorio-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconBlue}`}>
              <Download size={16} />
            </div>
            <div>
              <h2 id="relatorio-modal-title" className={styles.modalTitle}>Exportar relatório</h2>
              <p className={styles.modalSubtitle}>Configure o relatório antes de exportar</p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Tipo */}
          <div className={styles.filterPanelField}>
            <label className={styles.filterPanelLabel}>Tipo de relatório</label>
            <div className={styles.relatorioTipoGrid}>
              {(Object.keys(TIPO_CONFIG) as RelatorioTipo[]).map((t) => {
                const cfg = TIPO_CONFIG[t]
                return (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.relatorioTipoBtn} ${tipo === t ? styles.relatorioTipoBtnActive : ''}`}
                    onClick={() => setTipo(t)}
                  >
                    <span className={styles.relatorioTipoBtnIcon}>{cfg.icon}</span>
                    <span className={styles.relatorioTipoBtnLabel}>{cfg.label}</span>
                    <span className={styles.relatorioTipoBtnDesc}>{cfg.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Periodo + Conta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>Período</label>
              <select className={styles.filterSelect} style={{ width: '100%' }} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                {PERIODOS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterPanelField}>
              <label className={styles.filterPanelLabel}>Conta</label>
              <select className={styles.filterSelect} style={{ width: '100%' }} value={contaId} onChange={(e) => setContaId(e.target.value)}>
                <option value="todas">Todas as contas</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview panel */}
          <div className={styles.relatorioPreview}>
            <div className={styles.relatorioPreviewHeader}>
              <p className={styles.relatorioPreviewTitle}>
                {TIPO_CONFIG[tipo].label} — {periodoLabel}
              </p>
              <p className={styles.relatorioPreviewSub}>
                {contaId === 'todas' ? 'Todas as contas' : contas.find((c) => c.id === contaId)?.nome}
              </p>
            </div>

            {tipo === 'resumo' ? (
              <div className={styles.relatorioPreviewBody}>
                <div className={styles.relatorioKpiRow}>
                  <div className={styles.relatorioKpi}>
                    <span className={styles.relatorioKpiLabel}>Conciliado</span>
                    <span className={styles.relatorioKpiValue} style={{ color: '#16a34a' }}>{pct}%</span>
                  </div>
                  <div className={styles.relatorioKpi}>
                    <span className={styles.relatorioKpiLabel}>Pendentes</span>
                    <span className={styles.relatorioKpiValue} style={{ color: '#f59e0b' }}>{pendentesExtrato}</span>
                  </div>
                  <div className={styles.relatorioKpi}>
                    <span className={styles.relatorioKpiLabel}>Entradas</span>
                    <span className={styles.relatorioKpiValue} style={{ color: '#16a34a' }}>{formatBRLCompact(totalEntradas)}</span>
                  </div>
                  <div className={styles.relatorioKpi}>
                    <span className={styles.relatorioKpiLabel}>Saídas</span>
                    <span className={styles.relatorioKpiValue} style={{ color: '#ef4444' }}>{formatBRLCompact(totalSaidas)}</span>
                  </div>
                </div>
              </div>
            ) : tipo === 'extrato' ? (
              <div className={styles.relatorioPreviewBody}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th className={styles.thRight}>Valor</th>
                      <th className={styles.thCenter}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extratoItems.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td><span className={styles.cellData}>{item.data}</span></td>
                        <td><p className={styles.cellDescricao}>{item.descricao}</p></td>
                        <td>
                          <span className={`${item.tipo === 'credito' ? styles.cellValorPos : styles.cellValorNeg} ${styles.cellValorRight}`}>
                            {item.tipo === 'credito' ? '+' : '−'} {formatBRL(item.valor)}
                          </span>
                        </td>
                        <td className={styles.cellCenter}>
                          <span className={`${styles.badge} ${item.status === 'conciliado' ? styles.badgeConciliado : styles.badgePendente}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: 4 }}>
                  + {extratoItems.length - 5} registros no relatório completo
                </p>
              </div>
            ) : tipo === 'conciliacoes' ? (
              <div className={styles.relatorioPreviewBody}>
                <p style={{ fontSize: '12px', color: '#374151', marginBottom: 8 }}>
                  <strong>{conciliacoes.length}</strong> conciliações serão exportadas
                </p>
                {conciliacoes.slice(0, 3).map((c) => (
                  <div key={c.id} style={{ fontSize: '11px', color: '#6b7280', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {c.tipo === 'manual' ? '🔗 Manual' : c.tipo === 'automatica' ? '⚡ Automática' : '✨ Sugestão'} · {c.criadoEm} · {c.criadoPor}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.relatorioPreviewBody}>
                <p style={{ fontSize: '12px', color: '#374151' }}>
                  <strong>{pendentesExtrato}</strong> movimentos de extrato pendentes · <strong>{erpLancamentos.filter((e) => e.status === 'pendente').length}</strong> lançamentos ERP pendentes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={handleImprimir}
            disabled={exportando}
          >
            <Printer size={13} /> Imprimir
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => handleExportar('csv')}
            disabled={exportando}
          >
            <FileText size={13} /> CSV
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => handleExportar('xlsx')}
            disabled={exportando}
          >
            <FileSpreadsheet size={13} /> Excel
          </button>
          <button
            type="button"
            className={`${styles.btnSuccess} ${exportando ? styles.btnLoading : ''}`}
            onClick={() => handleExportar('pdf')}
            disabled={exportando}
          >
            <Download size={13} />
            {exportando ? 'Gerando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
