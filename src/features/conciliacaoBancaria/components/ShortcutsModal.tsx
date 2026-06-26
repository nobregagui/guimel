import { Keyboard, X } from 'lucide-react'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

interface ShortcutGroup {
  group: string
  items: Array<{ keys: string[]; desc: string }>
}

const GROUPS: ShortcutGroup[] = [
  {
    group: 'Navegação',
    items: [
      { keys: ['Alt', '1'], desc: 'Ir para Dashboard' },
      { keys: ['Alt', '2'], desc: 'Ir para Conciliação' },
      { keys: ['Alt', '3'], desc: 'Ir para Regras' },
      { keys: ['Alt', '4'], desc: 'Ir para Analytics' },
      { keys: ['Alt', '5'], desc: 'Ir para Histórico' },
    ],
  },
  {
    group: 'Conciliação',
    items: [
      { keys: ['Ctrl', 'Enter'], desc: 'Confirmar conciliação selecionada' },
      { keys: ['Esc'], desc: 'Limpar seleção atual' },
      { keys: ['Del'], desc: 'Ignorar itens do extrato selecionados' },
    ],
  },
  {
    group: 'Ações globais',
    items: [
      { keys: ['Ctrl', 'I'], desc: 'Abrir importação de extrato' },
      { keys: ['Ctrl', 'E'], desc: 'Abrir exportação de relatório' },
      { keys: ['Ctrl', 'R'], desc: 'Aplicar regras automáticas' },
      { keys: ['?'], desc: 'Abrir este painel de atalhos' },
    ],
  },
  {
    group: 'Interface',
    items: [
      { keys: ['Esc'], desc: 'Fechar modal/drawer aberto' },
      { keys: ['Ctrl', 'Home'], desc: 'Primeira página da tabela' },
      { keys: ['Ctrl', 'End'], desc: 'Última página da tabela' },
    ],
  },
]

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 60 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        style={{ width: 520 }}
        role="dialog"
        aria-modal
        aria-labelledby="shortcuts-modal-title"
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconPurple}`}>
              <Keyboard size={16} />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className={styles.modalTitle}>Atalhos de teclado</h2>
              <p className={styles.modalSubtitle}>Atalhos disponíveis no módulo de conciliação</p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ gap: '20px' }}>
          {GROUPS.map((group) => (
            <div key={group.group}>
              <p className={styles.filterPanelLabel} style={{ marginBottom: '8px' }}>{group.group}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => (
                  <div key={item.desc} className={styles.shortcutRow}>
                    <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>{item.desc}</span>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                      {item.keys.map((k, i) => (
                        <span key={i}>
                          <span className={styles.kbdKey}>{k}</span>
                          {i < item.keys.length - 1 ? <span style={{ fontSize: '10px', color: '#9ca3af', margin: '0 1px' }}>+</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.infoRow} style={{ marginTop: '4px' }}>
            <Keyboard size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              Atalhos de teclado não funcionam quando o cursor está em campos de texto.
            </span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
