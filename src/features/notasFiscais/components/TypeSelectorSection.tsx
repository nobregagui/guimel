import { ArrowDown, ArrowRight, ArrowUp, RotateCcw } from 'lucide-react'

import type { TipoNota } from '@/features/notasFiscais/types'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface TypeSelectorSectionProps {
  onSelect: (tipo: TipoNota) => void
  onSelectDevolucao: () => void
}

export function TypeSelectorSection({ onSelect, onSelectDevolucao }: TypeSelectorSectionProps) {
  return (
    <section className={styles.typeSelectorSection}>
      <div>
        <h2 className={styles.typeSelectorTitle}>Nova nota fiscal</h2>
        <p className={styles.typeSelectorSubtitle}>
          Selecione o tipo de nota que deseja emitir ou registrar
        </p>
      </div>

      <div className={styles.typeCards}>
        <button
          type="button"
          className={`${styles.typeCard} ${styles.typeCardEntrada}`}
          onClick={() => onSelect('entrada')}
        >
          <div className={`${styles.typeCardIcon} ${styles.typeCardIconEntrada}`}>
            <ArrowDown size={18} />
          </div>
          <span className={`${styles.typeCardBadge} ${styles.typeCardBadgeEntrada}`}>
            NF-e de Entrada
          </span>
          <div>
            <h3 className={styles.typeCardTitle}>Nota fiscal de entrada</h3>
            <p className={styles.typeCardDesc}>
              Registro de mercadorias ou serviços recebidos de fornecedores. Necessária para
              controle de estoque e créditos tributários.
            </p>
          </div>
          <div className={styles.typeCardExamples}>
            <div className={styles.typeCardExample}>
              <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotEntrada}`} />
              Compra de mercadorias para revenda
            </div>
            <div className={styles.typeCardExample}>
              <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotEntrada}`} />
              Retorno de remessa em consignação
            </div>
          </div>
          <div className={`${styles.typeCardAction} ${styles.typeCardActionEntrada}`}>
            Registrar nota de entrada <ArrowRight size={14} />
          </div>
        </button>

        <button
          type="button"
          className={`${styles.typeCard} ${styles.typeCardSaida}`}
          onClick={() => onSelect('saida')}
        >
          <div className={`${styles.typeCardIcon} ${styles.typeCardIconSaida}`}>
            <ArrowUp size={18} />
          </div>
          <span className={`${styles.typeCardBadge} ${styles.typeCardBadgeSaida}`}>
            NF-e de Saída
          </span>
          <div>
            <h3 className={styles.typeCardTitle}>Nota fiscal de saída</h3>
            <p className={styles.typeCardDesc}>
              Emissão de nota para vendas de produtos ou prestação de serviços. Obrigatória
              para toda operação de venda da sua empresa.
            </p>
          </div>
          <div className={styles.typeCardExamples}>
            <div className={styles.typeCardExample}>
              <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotSaida}`} />
              Venda de produtos ao cliente
            </div>
            <div className={styles.typeCardExample}>
              <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotSaida}`} />
              Prestação de serviços contratados
            </div>
          </div>
          <div className={`${styles.typeCardAction} ${styles.typeCardActionSaida}`}>
            Emitir nota de saída <ArrowRight size={14} />
          </div>
        </button>
      </div>

      <button
        type="button"
        className={`${styles.typeCard} ${styles.typeCardDevolucao}`}
        onClick={onSelectDevolucao}
      >
        <div className={`${styles.typeCardIcon} ${styles.typeCardIconDevolucao}`}>
          <RotateCcw size={18} />
        </div>
        <span className={`${styles.typeCardBadge} ${styles.typeCardBadgeDevolucao}`}>
          NF-e de Devolução
        </span>
        <div>
          <h3 className={styles.typeCardTitle}>Nota fiscal de devolução</h3>
          <p className={styles.typeCardDesc}>
            Emita ou registre uma devolução referenciando a nota original. Os dados do cliente,
            fornecedor e itens são preenchidos automaticamente para agilizar o processo.
          </p>
        </div>
        <div className={styles.typeCardExamples}>
          <div className={styles.typeCardExample}>
            <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotDevolucao}`} />
            Devolução de venda — cliente devolve mercadoria (NF-e de entrada)
          </div>
          <div className={styles.typeCardExample}>
            <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotDevolucao}`} />
            Devolução de compra — devolução ao fornecedor (NF-e de saída)
          </div>
          <div className={styles.typeCardExample}>
            <span className={`${styles.typeCardExampleDot} ${styles.typeCardExampleDotDevolucao}`} />
            Referência automática à chave, número e itens da NF original
          </div>
        </div>
        <div className={`${styles.typeCardAction} ${styles.typeCardActionDevolucao}`}>
          Iniciar devolução <ArrowRight size={14} />
        </div>
      </button>
    </section>
  )
}
