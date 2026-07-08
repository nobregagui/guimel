import { Logo } from '@/components/ui'

import styles from '@/pages/auth/Login/LoginPage.module.css'

export function AuthDashboardMockup() {
  return (
    <div className={styles.mockupWrapper} aria-hidden="true">
      <div className={`${styles.mockupCard} ${styles.mockupCardMain}`}>
        <div className={styles.mockupHeader}>
          <div className={styles.mockupLogo}>
            <Logo height={0} imgHeight={56} />
          </div>
          <div className={styles.mockupSearch} />
        </div>

        <div className={styles.mockupTitle}>Visão Geral</div>

        <div className={styles.mockupKpis}>
          <div className={styles.mockupKpi}>
            <span className={styles.mockupKpiLabel}>Contas a Receber</span>
            <span className={styles.mockupKpiValue}>R$ 324.650,00</span>
            <span className={styles.mockupKpiBadgeGreen}>+12,9% este mês</span>
          </div>
          <div className={styles.mockupKpi}>
            <span className={styles.mockupKpiLabel}>Contas a Pagar</span>
            <span className={styles.mockupKpiValue}>R$ 198.420,00</span>
            <span className={styles.mockupKpiBadgeRed}>-6,3% este mês</span>
          </div>
        </div>

        <div className={styles.mockupSectionLabel}>Movimentações</div>
        <div className={styles.mockupTransactions}>
          {[
            { label: 'Foo', type: 'D' },
            { label: 'Recebimento Cliente A', type: 'C' },
            { label: 'Pagamento Fornecedor B', type: 'D' },
            { label: 'Transferência', type: 'T' },
          ].map((t, i) => (
            <div key={i} className={styles.mockupTxRow}>
              <span className={styles.mockupTxDot} />
              <span className={styles.mockupTxLabel}>{t.label}</span>
              <span className={styles.mockupTxTag}>{t.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.mockupCard} ${styles.mockupCardGrowth}`}>
        <div className={styles.mockupGrowthLabel}>Crescimento da Receita</div>
        <div className={styles.mockupGrowthValue}>+24,8%</div>
        <div className={styles.mockupGrowthSub}>vs mês anterior</div>
        <div className={styles.mockupMiniChart}>
          <svg viewBox="0 0 80 30" className={styles.mockupLine}>
            <polyline
              points="0,25 15,20 30,22 45,12 60,8 80,4"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className={`${styles.mockupCard} ${styles.mockupCardCash}`}>
        <div className={styles.mockupCashLabel}>Fluxo de Caixa</div>
        <div className={styles.mockupCashValue}>R$ 186.430,00</div>
        <div className={styles.mockupCashSub}>Saldo atual</div>
        <div className={styles.mockupBars}>
          {[60, 80, 45, 90, 55, 70].map((h, i) => (
            <div
              key={i}
              className={styles.mockupBar}
              style={{
                height: `${h}%`,
                background: i % 2 === 0 ? '#16A34A' : '#F97316',
              }}
            />
          ))}
        </div>
      </div>

      <div className={`${styles.mockupCard} ${styles.mockupCardHealth}`}>
        <div className={styles.mockupHealthLabel}>Saúde Financeira</div>
        <div className={styles.mockupHealthGauge}>
          <svg viewBox="0 0 80 50">
            <path
              d="M 10 45 A 30 30 0 0 1 70 45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 10 45 A 30 30 0 0 1 70 45"
              fill="none"
              stroke="#16A34A"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="94"
              strokeDashoffset="18"
            />
            <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#18181B">
              92
            </text>
          </svg>
        </div>
        <div className={styles.mockupHealthTag}>Excelente</div>
      </div>

      <div className={`${styles.mockupCard} ${styles.mockupCardAI}`}>
        <div className={styles.mockupAIIcon}>✦</div>
        <div className={styles.mockupAITitle}>Insights de IA</div>
        <div className={styles.mockupAIText}>
          Identificamos uma oportunidade de economia de R$ 12.430 este mês.
        </div>
        <div className={styles.mockupAILink}>Ver insight →</div>
      </div>
    </div>
  )
}
