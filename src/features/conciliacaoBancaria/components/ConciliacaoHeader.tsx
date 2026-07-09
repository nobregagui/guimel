import { Columns, Download, HelpCircle, Plus, RefreshCw, Upload } from 'lucide-react'

import { PermissionGate } from '@/components/auth/PermissionGate'
import { Tooltip } from '@/features/conciliacaoBancaria/components/Tooltip'
import { CONCILIACAO_ABAS } from '@/features/conciliacaoBancaria/data/shared'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ConciliacaoAba } from '@/features/conciliacaoBancaria/types'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ConciliacaoHeaderProps {
  abaAtiva: ConciliacaoAba
  onAbaChange: (aba: ConciliacaoAba) => void
  onImportar?: () => void
  onExportar?: () => void
  onAplicarRegras?: () => void
  onConfigColunas?: () => void
  onAjuda?: () => void
}

export function ConciliacaoHeader({
  abaAtiva,
  onAbaChange,
  onImportar,
  onExportar,
  onAplicarRegras,
  onConfigColunas,
  onAjuda,
}: ConciliacaoHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className={styles.pageTitleGroup}>
            <h2 className={styles.pageTitle}>Conciliação Bancária</h2>
            <p className={styles.pageSubtitle}>Vincule movimentos bancários aos lançamentos do ERP</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {onAjuda ? (
            <Tooltip content="Atalhos de teclado (?)" placement="bottom">
              <button type="button" className={styles.btnGhost} onClick={onAjuda} aria-label="Abrir painel de atalhos de teclado">
                <HelpCircle size={13} />
              </button>
            </Tooltip>
          ) : null}

          {onConfigColunas ? (
            <Tooltip content="Configurar colunas visíveis" placement="bottom">
              <button type="button" className={styles.btnGhost} onClick={onConfigColunas} aria-label="Configurar colunas">
                <Columns size={13} />
              </button>
            </Tooltip>
          ) : null}

          {onAplicarRegras ? (
            <Tooltip content="Aplicar regras automáticas (Ctrl+R)" placement="bottom">
              <button type="button" className={styles.btnGhost} onClick={onAplicarRegras} aria-label="Aplicar regras automáticas">
                <RefreshCw size={13} />
                <span>Aplicar regras</span>
              </button>
            </Tooltip>
          ) : null}

          <PermissionGate permission="relatorios:export">
            <Tooltip content="Exportar relatório (Ctrl+E)" placement="bottom">
              <button type="button" className={styles.btnSecondary} onClick={onExportar} aria-label="Exportar relatório">
                <Download size={13} />
                <span>Exportar</span>
              </button>
            </Tooltip>
          </PermissionGate>

          <PermissionGate permission="conciliacao:import" requireWrite>
            <Tooltip content="Importar extrato bancário (Ctrl+I)" placement="bottom">
              <button type="button" className={styles.btnSecondary} onClick={onImportar} aria-label="Importar extrato">
                <Upload size={13} />
                <span>Importar</span>
              </button>
            </Tooltip>
          </PermissionGate>

          <PermissionGate permissions={['conciliacao:write', 'conciliacao:reconcile', 'conciliacao:*']} requireWrite>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => onAbaChange('conciliacao')}
              aria-label="Ir para conciliação"
            >
              <Plus size={13} />
              <span>Conciliar</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Seções da conciliação bancária" role="tablist">
        {CONCILIACAO_ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={abaAtiva === aba.id}
            onClick={() => onAbaChange(aba.id)}
            className={`${styles.tab} ${abaAtiva === aba.id ? styles.tabActive : ''}`}
          >
            {aba.label}
            <AbaCountBadge abaId={aba.id} />
          </button>
        ))}
      </nav>
    </div>
  )
}

function AbaCountBadge({ abaId }: { abaId: ConciliacaoAba }) {
  const extratoItems = useConciliacaoStore((s) => s.extratoItems)
  const conciliacoes = useConciliacaoStore((s) => s.conciliacoes)
  const regras = useConciliacaoStore((s) => s.regras)

  let count: number | null = null

  if (abaId === 'conciliacao') {
    count = extratoItems.filter((e) => e.status === 'pendente').length
  } else if (abaId === 'historico') {
    count = conciliacoes.length
  } else if (abaId === 'regras') {
    count = regras.filter((r) => r.ativo).length
  }

  if (!count) return null

  return (
    <span
      className={styles.tabBadge}
      aria-label={`${count} itens`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
