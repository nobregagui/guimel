import { Download, Filter, Plus, Search } from 'lucide-react'

import { PermissionGate } from '@/components/auth/PermissionGate'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
import { NOTAS_FISCAIS_ABAS } from '@/features/notasFiscais/data/shared'
import type { NotasFiscaisAba } from '@/features/notasFiscais/types'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotasFiscaisHeaderProps {
  abaAtiva: NotasFiscaisAba
  busca: string
  onAbaChange: (aba: NotasFiscaisAba) => void
  onBuscaChange: (busca: string) => void
  onNovaNota: () => void
}

export function NotasFiscaisHeader({
  abaAtiva,
  busca,
  onAbaChange,
  onBuscaChange,
  onNovaNota,
}: NotasFiscaisHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.pageTitle}>Notas Fiscais</h1>

        <div className={styles.headerActions}>
          <label className={styles.searchField}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="search"
              value={busca}
              onChange={(event) => onBuscaChange(event.target.value)}
              placeholder="Buscar por número, emitente, destinatário…"
              aria-label="Buscar notas fiscais"
            />
          </label>

          <button type="button" className={styles.btnSecondary}>
            <Filter size={14} /> Filtros
          </button>

          <button type="button" className={styles.btnSecondary}>
            <Download size={14} /> Exportar
          </button>

          <PermissionGate permissions={[...MODULE_WRITE_PERMISSIONS.nfe]} requireWrite>
            <button type="button" className={styles.btnPrimary} onClick={onNovaNota}>
              <Plus size={14} /> Nova nota fiscal
            </button>
          </PermissionGate>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Seções de notas fiscais">
        {NOTAS_FISCAIS_ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={`${styles.tab} ${abaAtiva === aba.id ? styles.tabActive : ''}`}
            onClick={() => onAbaChange(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
