import { FORMA_PAGAMENTO_LABEL } from '@/features/clientes/data/shared'
import type { Cliente } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClienteDetalhePage.module.css'

interface ClienteDetalheDadosProps {
  cliente: Cliente
}

export function ClienteDetalheDados({ cliente }: ClienteDetalheDadosProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Dados cadastrais</h2>
      </div>

      <dl className={styles.dadosGrid}>
        <div className={styles.dadoItem}>
          <dt>Tipo</dt>
          <dd>{cliente.tipo === 'pj' ? 'Pessoa jurídica' : 'Pessoa física'}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Documento</dt>
          <dd>{cliente.documento}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>E-mail</dt>
          <dd>{cliente.email}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Telefone</dt>
          <dd>{cliente.telefone}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Segmento</dt>
          <dd>{cliente.segmento}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Pagamento preferencial</dt>
          <dd>{FORMA_PAGAMENTO_LABEL[cliente.formaPagamentoPreferida]}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Condição de pagamento</dt>
          <dd>{cliente.condicaoPagamentoDescricao}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Localização</dt>
          <dd>{cliente.cidade}/{cliente.estado}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Cadastro</dt>
          <dd>{cliente.cadastro}</dd>
        </div>
        <div className={styles.dadoItem}>
          <dt>Status</dt>
          <dd className={styles.capitalize}>{cliente.status}</dd>
        </div>
      </dl>

      {cliente.observacao ? (
        <div className={styles.observacaoBox}>
          <span className={styles.observacaoLabel}>Observações</span>
          <p>{cliente.observacao}</p>
        </div>
      ) : null}
    </section>
  )
}
