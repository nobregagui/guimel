import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

import { NotaFiscalStatusBadge } from '@/features/notasFiscais/components/NotaFiscalStatusBadge'
import { NotaFiscalTipoBadge } from '@/features/notasFiscais/components/NotaFiscalTipoBadge'
import {
  FORMA_PAGAMENTO_NF_LABEL,
  NATUREZA_OPERACAO_LABEL,
  type NotaFiscal,
} from '@/features/notasFiscais/types'
import { formatBRL, formatDate } from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotaFiscalDetalheDrawerProps {
  nota: NotaFiscal
  onClose: () => void
  onCancelar: (motivo: string) => void
}

export function NotaFiscalDetalheDrawer({
  nota,
  onClose,
  onCancelar,
}: NotaFiscalDetalheDrawerProps) {
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const isEntrada = nota.tipo === 'entrada'
  const contraparte = isEntrada ? nota.emitente : nota.destinatario
  const podeCancelar = nota.status === 'autorizada' || nota.status === 'pendente'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleCancelar() {
    const motivo = motivoCancelamento.trim()
    if (!motivo) return
    onCancelar(motivo)
  }

  return (
    <div className={styles.drawerRoot} role="dialog" aria-modal="true">
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <NotaFiscalTipoBadge tipo={nota.tipo} />
                <NotaFiscalStatusBadge status={nota.status} />
              </div>
              <h2 className={styles.drawerTitle}>
                NF-e Nº {nota.numero} · Série {nota.serie}
              </h2>
              <p className={styles.drawerSubtitle}>
                {NATUREZA_OPERACAO_LABEL[nota.naturezaOperacao]} · Emitida em{' '}
                {formatDate(nota.dataEmissao)}
              </p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Dados da nota</h3>
              </div>
              <dl className={styles.dadosGrid}>
                <div className={styles.dadoItem}>
                  <dt>Chave de acesso</dt>
                  <dd>{nota.chaveAcesso}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Forma de pagamento</dt>
                  <dd>{FORMA_PAGAMENTO_NF_LABEL[nota.formaPagamento]}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Data de emissão</dt>
                  <dd>{formatDate(nota.dataEmissao)}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>{isEntrada ? 'Data de entrada' : 'Data de saída'}</dt>
                  <dd>{formatDate(nota.dataEntrada ?? nota.dataSaida ?? '')}</dd>
                </div>
                {nota.vencimento ? (
                  <div className={styles.dadoItem}>
                    <dt>Vencimento</dt>
                    <dd>{formatDate(nota.vencimento)}</dd>
                  </div>
                ) : null}
                {nota.protocolo ? (
                  <div className={styles.dadoItem}>
                    <dt>Protocolo SEFAZ</dt>
                    <dd>{nota.protocolo}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className={styles.resumoCard}>
              <h3 className={styles.cardTitle}>Resumo financeiro</h3>
              <div className={styles.resumoItem}>
                <span>Produtos</span>
                <strong>{formatBRL(nota.valorProdutos)}</strong>
              </div>
              <div className={styles.resumoItem}>
                <span>Descontos</span>
                <strong>{formatBRL(nota.valorDesconto)}</strong>
              </div>
              <div className={styles.resumoItem}>
                <span>Frete</span>
                <strong>{formatBRL(nota.valorFrete)}</strong>
              </div>
              <div className={styles.resumoItem}>
                <span>Seguro</span>
                <strong>{formatBRL(nota.valorSeguro)}</strong>
              </div>
              <div className={styles.resumoItem}>
                <span>Outras despesas</span>
                <strong>{formatBRL(nota.valorOutrasDespesas)}</strong>
              </div>
              <hr className={styles.resumoDivider} />
              <div className={styles.resumoTotal}>
                <span>Valor total</span>
                <span>{formatBRL(nota.valorTotal)}</span>
              </div>
            </div>
          </div>

          <div className={styles.twoColBalanced}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  {isEntrada ? 'Emitente (fornecedor)' : 'Destinatário (cliente)'}
                </h3>
              </div>
              <dl className={styles.dadosGrid}>
                <div className={`${styles.dadoItem} ${styles.formFieldFull}`}>
                  <dt>Razão social</dt>
                  <dd>{contraparte.nome}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>CNPJ</dt>
                  <dd>{contraparte.cnpj}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Inscrição estadual</dt>
                  <dd>{contraparte.ie || '—'}</dd>
                </div>
                <div className={`${styles.dadoItem} ${styles.formFieldFull}`}>
                  <dt>Endereço</dt>
                  <dd>
                    {contraparte.endereco} — {contraparte.cidade}/{contraparte.estado}
                  </dd>
                </div>
              </dl>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Tributos</h3>
              </div>
              <dl className={styles.dadosGrid}>
                <div className={styles.dadoItem}>
                  <dt>ICMS</dt>
                  <dd>{formatBRL(nota.tributos.valorIcms)}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>PIS</dt>
                  <dd>{formatBRL(nota.tributos.valorPis)}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>COFINS</dt>
                  <dd>{formatBRL(nota.tributos.valorCofins)}</dd>
                </div>
                <div className={styles.dadoItem}>
                  <dt>Total tributos</dt>
                  <dd>{formatBRL(nota.tributos.valorTotalTributos)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Itens da nota</h3>
            </div>
            {nota.itens.length === 0 ? (
              <p className={styles.emptyState}>Nenhum item registrado.</p>
            ) : (
              <table className={styles.itensTable}>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Qtd</th>
                    <th>Valor unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {nota.itens.map((item) => (
                    <tr key={item.id}>
                      <td>{item.descricao}</td>
                      <td>
                        {item.quantidade} {item.unidade}
                      </td>
                      <td>{formatBRL(item.valorUnitario)}</td>
                      <td>{formatBRL(item.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={styles.itensTotalRow}>
                    <td colSpan={3}>Total dos itens</td>
                    <td>{formatBRL(nota.valorProdutos)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {nota.informacoesAdicionais ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Informações adicionais</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {nota.informacoesAdicionais}
              </p>
            </div>
          ) : null}

          {nota.motivoCancelamento ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Motivo do cancelamento</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#dc2626', lineHeight: 1.6 }}>
                {nota.motivoCancelamento}
              </p>
            </div>
          ) : null}

          {showCancelForm && podeCancelar ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Cancelar nota fiscal</h3>
              </div>
              <div className={styles.formField}>
                <label htmlFor="motivo-cancelamento">Motivo do cancelamento</label>
                <textarea
                  id="motivo-cancelamento"
                  rows={3}
                  value={motivoCancelamento}
                  onChange={(event) => setMotivoCancelamento(event.target.value)}
                  placeholder="Descreva o motivo do cancelamento…"
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowCancelForm(false)}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleCancelar}
                  disabled={!motivoCancelamento.trim()}
                >
                  Confirmar cancelamento
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Fechar
          </button>
          <button type="button" className={styles.btnSecondary}>
            <Download size={14} /> Baixar XML
          </button>
          {podeCancelar && !showCancelForm ? (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setShowCancelForm(true)}
            >
              Cancelar nota
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
