import { useMemo, useState } from 'react'
import { ChevronRight, Download, RefreshCw } from 'lucide-react'

import { NotaFiscalStatusBadge } from '@/features/notasFiscais/components/NotaFiscalStatusBadge'
import { NotaFiscalTipoBadge } from '@/features/notasFiscais/components/NotaFiscalTipoBadge'
import {
  NATUREZA_OPERACAO_LABEL,
  type NotaFiscal,
  type StatusFilter,
  type TipoFilter,
} from '@/features/notasFiscais/types'
import { filterNotasFiscais, formatBRL, formatDate } from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotasFiscaisTableProps {
  notas: NotaFiscal[]
  buscaGlobal?: string
  onVerDetalhe: (nota: NotaFiscal) => void
}

export function NotasFiscaisTable({ notas, buscaGlobal = '', onVerDetalhe }: NotasFiscaisTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todas')

  const filtradas = useMemo(
    () => filterNotasFiscais(notas, statusFilter, tipoFilter, buscaGlobal),
    [notas, statusFilter, tipoFilter, buscaGlobal],
  )

  return (
    <section className={styles.tableSection}>
      <div className={styles.tableToolbar}>
        <div className={styles.tableToolbarLeft}>
          <p className={styles.tableToolbarTitle}>Notas fiscais emitidas</p>
          <p className={styles.tableToolbarSub}>
            {filtradas.length} nota{filtradas.length !== 1 ? 's' : ''} encontrada
            {filtradas.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className={styles.tableToolbarRight}>
          <div className={styles.filterRow}>
            {(['todas', 'entrada', 'saida'] as TipoFilter[]).map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`${styles.filterPill} ${
                  tipoFilter === tipo
                    ? tipo === 'saida'
                      ? styles.filterPillOrange
                      : styles.filterPillActive
                    : ''
                }`}
                onClick={() => setTipoFilter(tipo)}
              >
                {tipo === 'todas' ? 'Todas' : tipo === 'entrada' ? '↓ Entrada' : '↑ Saída'}
              </button>
            ))}
          </div>

          <div className={styles.filterRow}>
            {(['todas', 'autorizada', 'pendente', 'cancelada'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                className={`${styles.filterPill} ${
                  statusFilter === status ? styles.filterPillActive : ''
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'todas'
                  ? 'Todos status'
                  : status === 'autorizada'
                    ? 'Autorizada'
                    : status === 'pendente'
                      ? 'Pendente'
                      : 'Cancelada'}
              </button>
            ))}
          </div>

          <button type="button" className={styles.btnSecondary}>
            <Download size={14} /> Exportar XML
          </button>
          <button type="button" className={styles.btnSecondary}>
            <RefreshCw size={14} /> Consultar SEFAZ
          </button>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Número / Série</th>
            <th>Tipo</th>
            <th>Emitente / Destinatário</th>
            <th>Natureza</th>
            <th>Emissão</th>
            <th className={styles.thRight}>Valor total</th>
            <th className={styles.thCenter}>Status</th>
            <th className={styles.thNarrow} />
          </tr>
        </thead>
        <tbody>
          {filtradas.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <p className={styles.emptyState}>Nenhuma nota fiscal encontrada.</p>
              </td>
            </tr>
          ) : (
            filtradas.map((nota) => (
              <tr key={nota.id}>
                <td>
                  <p className={styles.cellNumero}>
                    Nº {nota.numero} · Série {nota.serie}
                  </p>
                  <p className={styles.cellSubDesc}>{nota.chaveAcesso.slice(0, 20)}…</p>
                </td>
                <td>
                  <NotaFiscalTipoBadge tipo={nota.tipo} />
                </td>
                <td>
                  <p className={styles.cellEntidade}>
                    {nota.tipo === 'saida' ? nota.destinatario.nome : nota.emitente.nome}
                  </p>
                  <p className={styles.cellSubDesc}>
                    {nota.tipo === 'saida' ? nota.destinatario.cnpj : nota.emitente.cnpj} ·{' '}
                    {nota.tipo === 'saida' ? nota.destinatario.cidade : nota.emitente.cidade}/
                    {nota.tipo === 'saida' ? nota.destinatario.estado : nota.emitente.estado}
                  </p>
                </td>
                <td>
                  <span className={styles.cellCategoria}>
                    {NATUREZA_OPERACAO_LABEL[nota.naturezaOperacao]}
                  </span>
                </td>
                <td>
                  <span className={styles.cellData}>{formatDate(nota.dataEmissao)}</span>
                </td>
                <td>
                  <span
                    className={
                      nota.status === 'cancelada'
                        ? styles.cellValorMuted
                        : nota.tipo === 'saida'
                          ? styles.cellValorPos
                          : styles.cellValorNeg
                    }
                  >
                    {formatBRL(nota.valorTotal)}
                  </span>
                </td>
                <td className={styles.cellStatusCenter}>
                  <NotaFiscalStatusBadge status={nota.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => onVerDetalhe(nota)}
                    title="Ver detalhes"
                    aria-label={`Ver detalhes da nota ${nota.numero}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.tableFooter}>
        <span className={styles.tableFooterInfo}>
          Exibindo {filtradas.length} de {notas.length} notas fiscais
        </span>
        <button type="button" className={styles.tableFooterLink}>
          Ver relatório completo <ChevronRight size={14} />
        </button>
      </div>
    </section>
  )
}
