import { CreditCard, FileText, MessageSquare } from 'lucide-react'

import { FORMA_PAGAMENTO_LABEL } from '@/features/clientes/data/shared'
import type { Cliente } from '@/features/clientes/types'
import { formatBRL } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

interface ClienteDetalheResumoProps {
  cliente: Cliente
  pedidosPendentes: number
}

export function ClienteDetalheResumo({ cliente, pedidosPendentes }: ClienteDetalheResumoProps) {
  return (
    <div className={styles.sideStack}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Resumo comercial</h2>
        </div>
        <div className={styles.resumoList}>
          <div className={styles.resumoItem}>
            <span>Pedidos pendentes</span>
            <strong>{pedidosPendentes}</strong>
          </div>
          <div className={styles.resumoItem}>
            <span>Limite sugerido</span>
            <strong>{formatBRL(Math.max(cliente.totalVendas * 0.2, 5000))}</strong>
          </div>
          <div className={styles.resumoItem}>
            <span>Pagamento preferencial</span>
            <strong>{FORMA_PAGAMENTO_LABEL[cliente.formaPagamentoPreferida]}</strong>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Ações rápidas</h2>
        </div>
        <div className={styles.actionList}>
          <button type="button" className={styles.actionBtn}>
            <CreditCard size={15} /> Emitir cobrança
          </button>
          <button type="button" className={styles.actionBtn}>
            <FileText size={15} /> Gerar proposta
          </button>
          <button type="button" className={styles.actionBtn}>
            <MessageSquare size={15} /> Registrar contato
          </button>
        </div>
      </section>
    </div>
  )
}
