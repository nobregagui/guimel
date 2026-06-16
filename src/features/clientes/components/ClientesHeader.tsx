import { Download, Plus, Search } from 'lucide-react'

import { CLIENTES_ABAS } from '@/features/clientes/data/shared'
import type { ClientesAba } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ClientesHeaderProps {
  abaAtiva: ClientesAba
  busca: string
  onAbaChange: (aba: ClientesAba) => void
  onBuscaChange: (busca: string) => void
  onNovoCliente: () => void
}

export function ClientesHeader({ abaAtiva, busca, onAbaChange, onBuscaChange, onNovoCliente }: ClientesHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h2 className={styles.pageTitle}>Clientes</h2>

        <div className={styles.headerActions}>
          <label className={styles.searchField}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="search"
              value={busca}
              onChange={(event) => onBuscaChange(event.target.value)}
              placeholder="Buscar por nome, documento, e-mail..."
              className={styles.searchInput}
              aria-label="Buscar clientes"
            />
          </label>

          <button type="button" className={styles.btnSecondary}>
            <Download size={13} /> Exportar
          </button>

          <button type="button" className={styles.btnPrimary} onClick={onNovoCliente}>
            <Plus size={13} /> Novo cliente
          </button>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Seções de clientes">
        {CLIENTES_ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => onAbaChange(aba.id)}
            className={`${styles.tab} ${abaAtiva === aba.id ? styles.tabActive : ''}`}
          >
            {aba.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
