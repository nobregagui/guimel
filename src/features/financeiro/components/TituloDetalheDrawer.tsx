import { X } from 'lucide-react'

import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import {
  useContaPagarDetalheQuery,
  useContaReceberDetalheQuery,
} from '@/features/financeiro/hooks/useFinanceiro'
import type { ContaPagar, ContaReceber, TituloModulo } from '@/features/financeiro/types'
import { FORMA_PAGAMENTO_LABEL, formatBRL, formatIsoToBR } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface TituloDetalheDrawerProps {
  open: boolean
  modulo: TituloModulo
  titulo: ContaReceber | ContaPagar | null
  onClose: () => void
  onEdit?: () => void
}

export function TituloDetalheDrawer({ open, modulo, titulo, onClose, onEdit }: TituloDetalheDrawerProps) {
  const receberQuery = useContaReceberDetalheQuery(titulo?.id, open && modulo === 'receber')
  const pagarQuery = useContaPagarDetalheQuery(titulo?.id, open && modulo === 'pagar')

  if (!open || !titulo) return null

  const detalhe = modulo === 'receber' ? receberQuery.data : pagarQuery.data
  const isLoading = modulo === 'receber' ? receberQuery.isLoading : pagarQuery.isLoading
  const tituloExibido = detalhe ?? titulo

  const parte =
    modulo === 'receber'
      ? (tituloExibido as ContaReceber).cliente
      : (tituloExibido as ContaPagar).fornecedor
  const podeEditar = tituloExibido.status !== 'pago' && tituloExibido.status !== 'cancelado'

  const historico = detalhe?.historico ?? []
  const pagamentos = detalhe?.pagamentos ?? []
  const anexos = detalhe?.anexos ?? []
  const parcelas = modulo === 'receber' && detalhe ? (detalhe as ContaReceber & { parcelas?: ContaReceber[] }).parcelas ?? [] : []

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />
      <aside className={styles.drawerPanel} role="dialog" aria-modal="true">
        <header className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>
              {modulo === 'receber' ? 'Conta a receber' : 'Conta a pagar'}
            </h2>
            <p className={styles.drawerSubtitle}>{parte} · {tituloExibido.documento}</p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          {isLoading ? <p className={styles.formHint}>Carregando detalhes…</p> : null}

          <div className={styles.detalheGrid}>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Status</span>
              <StatusBadge status={tituloExibido.status} modulo={modulo} />
            </div>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Valor</span>
              <strong>{formatBRL(tituloExibido.valor)}</strong>
            </div>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Baixado</span>
              <strong>{formatBRL(tituloExibido.valorBaixado ?? 0)}</strong>
            </div>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Vencimento</span>
              <strong>{tituloExibido.vencimento}</strong>
            </div>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Categoria</span>
              <strong>{tituloExibido.categoria}</strong>
            </div>
            <div className={styles.detalheItem}>
              <span className={styles.detalheLabel}>Forma de pagamento</span>
              <strong>{FORMA_PAGAMENTO_LABEL[tituloExibido.formaPagamento]}</strong>
            </div>
          </div>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Histórico</legend>
            {historico.length > 0 ? (
              <ul className={styles.detalheList}>
                {historico.map((item) => (
                  <li key={item.id}>
                    {formatIsoToBR(item.dataIso)} — {item.acao}
                    {item.detalhe ? ` (${item.detalhe})` : ''}
                    {item.usuario ? ` · ${item.usuario}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={styles.detalheList}>
                <li>
                  Criado em{' '}
                  {tituloExibido.criadoEmIso
                    ? new Date(tituloExibido.criadoEmIso).toLocaleString('pt-BR')
                    : '—'}
                </li>
                {(tituloExibido.valorBaixado ?? 0) > 0 ? (
                  <li>Baixa parcial/total registrada — {formatBRL(tituloExibido.valorBaixado ?? 0)}</li>
                ) : (
                  <li>Aguardando {modulo === 'receber' ? 'recebimento' : 'pagamento'}</li>
                )}
              </ul>
            )}
          </fieldset>

          {pagamentos.length > 0 ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formLegend}>Pagamentos</legend>
              <ul className={styles.detalheList}>
                {pagamentos.map((pag) => {
                  const valor = 'valorRecebido' in pag ? pag.valorRecebido : pag.valorPago
                  return (
                    <li key={pag.id}>
                      {formatIsoToBR(pag.dataIso)} — {formatBRL(valor)}
                      {pag.observacao ? ` · ${pag.observacao}` : ''}
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          ) : null}

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Parcelas</legend>
            {parcelas.length > 0 ? (
              <ul className={styles.detalheList}>
                {parcelas.map((parcela) => (
                  <li key={parcela.id}>
                    {parcela.documento} — {formatBRL(parcela.valor)} · venc. {parcela.vencimento}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.formHint}>
                {modulo === 'pagar' && (tituloExibido as ContaPagar).recorrenciaTotal
                  ? `Parcela ${(tituloExibido as ContaPagar).recorrenciaParcela}/${(tituloExibido as ContaPagar).recorrenciaTotal}`
                  : 'Título único (sem parcelamento vinculado).'}
              </p>
            )}
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend className={styles.formLegend}>Anexos</legend>
            {anexos.length > 0 ? (
              <ul className={styles.detalheList}>
                {anexos.map((anexo) => (
                  <li key={anexo.id}>{anexo.nome} ({anexo.tipo})</li>
                ))}
              </ul>
            ) : (
              <p className={styles.formHint}>Nenhum anexo vinculado.</p>
            )}
          </fieldset>

          {tituloExibido.observacao ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formLegend}>Observações</legend>
              <p className={styles.formHint}>{tituloExibido.observacao}</p>
            </fieldset>
          ) : null}
        </div>

        <footer className={styles.drawerFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Fechar
          </button>
          {podeEditar && onEdit ? (
            <button type="button" className={styles.btnPrimary} onClick={onEdit}>
              Editar
            </button>
          ) : null}
        </footer>
      </aside>
    </div>
  )
}
