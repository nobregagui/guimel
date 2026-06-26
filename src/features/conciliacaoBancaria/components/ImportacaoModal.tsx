import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
  Zap,
} from 'lucide-react'

import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import { formatBRL } from '@/features/conciliacaoBancaria/utils'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

type ImportacaoTipo = 'ofx' | 'csv' | 'xlsx'
type ImportacaoEstado = 'idle' | 'drag' | 'processando' | 'preview' | 'sucesso' | 'erro'

interface ImportacaoModalProps {
  open: boolean
  onClose: () => void
  onImportado: (count: number) => void
}

const TIPO_CONFIG: Record<ImportacaoTipo, { label: string; extensao: string; icon: React.ReactNode }> = {
  ofx: {
    label: 'OFX / OFC',
    extensao: '.ofx, .ofc',
    icon: <FileText size={18} />,
  },
  csv: {
    label: 'CSV',
    extensao: '.csv',
    icon: <FileText size={18} />,
  },
  xlsx: {
    label: 'Excel (XLSX)',
    extensao: '.xlsx, .xls',
    icon: <FileSpreadsheet size={18} />,
  },
}

interface PreviewItem {
  data: string
  descricao: string
  valor: number
  tipo: 'credito' | 'debito'
}

// Simulated preview data for each format
const PREVIEW_DATA: PreviewItem[] = [
  { data: '24/06/2026', descricao: 'PIX REC - CLIENTE OMEGA SA', valor: 8_450, tipo: 'credito' },
  { data: '24/06/2026', descricao: 'PAGTO BOL - ENERGIA ELETRICA', valor: 920.5, tipo: 'debito' },
  { data: '25/06/2026', descricao: 'TED REC - MERCADO LIVRE', valor: 3_200, tipo: 'credito' },
  { data: '25/06/2026', descricao: 'PIX ENV - ALUGUEL JUNHO', valor: 3_200, tipo: 'debito' },
  { data: '25/06/2026', descricao: 'TARIFA MANUTENCAO', valor: 68, tipo: 'debito' },
  { data: '26/06/2026', descricao: 'PIX REC - STONE PAGAMENTOS', valor: 5_640, tipo: 'credito' },
  { data: '26/06/2026', descricao: 'IOF OPERACAO CREDITO', valor: 42.8, tipo: 'debito' },
]

export function ImportacaoModal({ open, onClose, onImportado }: ImportacaoModalProps) {
  const contas = useConciliacaoStore((s) => s.contas)

  const [tipo, setTipo] = useState<ImportacaoTipo>('ofx')
  const [estado, setEstado] = useState<ImportacaoEstado>('idle')
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [contaId, setContaId] = useState(contas[0]?.id ?? '')
  const [progresso, setProgresso] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return undefined
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Reset state when modal closes — deferred to avoid cascading renders
  useEffect(() => {
    if (open) return undefined
    const timer = setTimeout(() => {
      setEstado('idle')
      setNomeArquivo('')
      setProgresso(0)
      setIsDragging(false)
    }, 300) // after close animation
    return () => clearTimeout(timer)
  }, [open])

  function simularProcessamento(arquivo: string) {
    setNomeArquivo(arquivo)
    setEstado('processando')
    setProgresso(0)

    const interval = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setEstado('preview')
          return 100
        }
        return p + Math.random() * 25 + 5
      })
    }, 150)
  }

  function handleFileSelect(file: File) {
    simularProcessamento(file.name)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleSimularSemArquivo() {
    simularProcessamento(`extrato_simulado_${tipo.toUpperCase()}_jun2026.${tipo}`)
  }

  function handleConfirmar() {
    setEstado('sucesso')
    setTimeout(() => {
      onImportado(PREVIEW_DATA.length)
      onClose()
    }, 1200)
  }

  if (!open) return null

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 50 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal
        aria-labelledby="importacao-modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconGreen}`}>
              <Upload size={16} />
            </div>
            <div>
              <h2 id="importacao-modal-title" className={styles.modalTitle}>
                Importar extrato bancário
              </h2>
              <p className={styles.modalSubtitle}>
                Suporte a OFX, CSV e Excel · Até 5.000 movimentos por importação
              </p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {estado === 'idle' || estado === 'drag' ? (
            <>
              {/* Format tabs */}
              <div className={styles.modalTabs}>
                {(Object.keys(TIPO_CONFIG) as ImportacaoTipo[]).map((t) => {
                  const cfg = TIPO_CONFIG[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.modalTab} ${tipo === t ? styles.modalTabActive : ''}`}
                      onClick={() => setTipo(t)}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Conta selector */}
              <div className={styles.filterPanelField}>
                <label className={styles.filterPanelLabel}>Conta de destino</label>
                <select
                  className={styles.filterSelect}
                  value={contaId}
                  onChange={(e) => setContaId(e.target.value)}
                  style={{ width: '100%', maxWidth: '100%' }}
                >
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — Ag. {c.agencia} / C/C {c.conta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drop zone */}
              <div
                className={`${styles.importZone} ${isDragging ? styles.importZoneActive : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                aria-label="Área de arrastar e soltar arquivo"
              >
                <div className={styles.importZoneIcon}>
                  <Upload size={24} />
                </div>
                <p className={styles.importZoneText}>
                  Arraste o arquivo {TIPO_CONFIG[tipo].label} aqui
                </p>
                <p className={styles.importZoneSub}>
                  ou clique para selecionar · {TIPO_CONFIG[tipo].extensao}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={TIPO_CONFIG[tipo].extensao}
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />
              </div>

              {/* Tips */}
              <div className={styles.infoRow} style={{ marginTop: '8px' }}>
                <Zap size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  {tipo === 'ofx'
                    ? 'Exporte o OFX pelo internet banking do seu banco. A maioria dos bancos brasileiros suporta o formato OFX.'
                    : tipo === 'csv'
                      ? 'O CSV deve ter colunas: data, descrição, valor e tipo (crédito/débito). O separador pode ser vírgula ou ponto-e-vírgula.'
                      : 'Utilize o modelo Excel disponível para download. Preencha as colunas obrigatórias antes de importar.'}
                </span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={handleSimularSemArquivo}
                  style={{ fontSize: '12px', color: '#9ca3af' }}
                >
                  Simular importação (modo demo)
                </button>
              </div>
            </>
          ) : null}

          {estado === 'processando' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '32px 0' }}>
              <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconGreen}`} style={{ width: 56, height: 56, borderRadius: 16 }}>
                <Upload size={24} />
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                  <span>Processando <strong>{nomeArquivo}</strong></span>
                  <span>{Math.min(100, Math.round(progresso))}%</span>
                </div>
                <div className={styles.progressBar} style={{ height: '8px' }}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${Math.min(100, progresso)}%`, backgroundColor: '#16a34a', transition: 'width 0.15s ease' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                  {progresso < 40 ? 'Lendo arquivo…' : progresso < 75 ? 'Validando movimentos…' : 'Aplicando deduplicação…'}
                </p>
              </div>
            </div>
          ) : null}

          {estado === 'preview' ? (
            <>
              <div className={styles.infoRow}>
                <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  <strong>{PREVIEW_DATA.length} movimentos</strong> identificados em{' '}
                  <strong>{nomeArquivo}</strong>. Revise antes de confirmar a importação.
                </span>
              </div>

              <table className={styles.table} style={{ marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th className={styles.thCenter}>Tipo</th>
                    <th className={styles.thRight}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW_DATA.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={styles.cellData}>{item.data}</span>
                      </td>
                      <td>
                        <p className={styles.cellDescricao}>{item.descricao}</p>
                      </td>
                      <td className={styles.cellCenter}>
                        <span
                          className={`${styles.badge} ${item.tipo === 'credito' ? styles.badgeCredito : styles.badgeDebito}`}
                        >
                          {item.tipo === 'credito' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${item.tipo === 'credito' ? styles.cellValorPos : styles.cellValorNeg} ${styles.cellValorRight}`}
                        >
                          {item.tipo === 'credito' ? '+' : '−'} {formatBRL(item.valor)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                Conta de destino: <strong>{contas.find((c) => c.id === contaId)?.nome ?? '—'}</strong>
              </p>
            </>
          ) : null}

          {estado === 'sucesso' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'scaleIn 0.3s ease',
                }}
              >
                <CheckCircle2 size={32} color="#16a34a" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                  {PREVIEW_DATA.length} movimentos importados!
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  Os movimentos já estão disponíveis na aba Conciliação.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {estado !== 'sucesso' && estado !== 'processando' ? (
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
            {estado === 'preview' ? (
              <button type="button" className={styles.btnSuccess} onClick={handleConfirmar}>
                <CheckCircle2 size={13} />
                Confirmar importação ({PREVIEW_DATA.length} movimentos)
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
