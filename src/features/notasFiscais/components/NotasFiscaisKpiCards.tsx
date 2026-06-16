import { AlertCircle, FileCheck, Receipt, TrendingUp } from 'lucide-react'

import type { NotaFiscal } from '@/features/notasFiscais/types'
import { formatBRL } from '@/features/notasFiscais/utils'
import styles from '@/pages/notas-fiscais/NotasFiscaisPage.module.css'

interface NotasFiscaisKpiCardsProps {
  notas: NotaFiscal[]
}

export function NotasFiscaisKpiCards({ notas }: NotasFiscaisKpiCardsProps) {
  const notasAutorizadas = notas.filter((nota) => nota.status === 'autorizada')
  const notasSaida = notas.filter((nota) => nota.tipo === 'saida')
  const notasEntrada = notas.filter((nota) => nota.tipo === 'entrada')
  const notasPendentes = notas.filter((nota) => nota.status === 'pendente')

  const totalSaida = notasSaida
    .filter((nota) => nota.status === 'autorizada')
    .reduce((acc, nota) => acc + nota.valorTotal, 0)

  const totalEntrada = notasEntrada
    .filter((nota) => nota.status === 'autorizada')
    .reduce((acc, nota) => acc + nota.valorTotal, 0)

  return (
    <div className={styles.kpiGrid}>
      <div className={styles.kpiCard}>
        <p className={`${styles.kpiLabel} ${styles.colorMuted}`}>
          <FileCheck size={20} /> Total emitidas
        </p>
        <p className={styles.kpiValue}>{notas.length}</p>
        <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>
          {notasAutorizadas.length} autorizadas este mês
        </p>
        <div className={styles.kpiProgressTrack}>
          <div
            className={styles.kpiProgressFill}
            style={{
              width: `${notas.length ? (notasAutorizadas.length / notas.length) * 100 : 0}%`,
              backgroundColor: '#16a34a',
            }}
          />
        </div>
      </div>

      <div className={styles.kpiCard}>
        <p className={`${styles.kpiLabel} ${styles.colorGreen}`}>
          <TrendingUp size={20} /> Total de saída
        </p>
        <p className={`${styles.kpiValue} ${styles.colorGreen}`}>{formatBRL(totalSaida)}</p>
        <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>
          {notasSaida.length} nota{notasSaida.length !== 1 ? 's' : ''} de saída
        </p>
        <div className={styles.kpiProgressTrack}>
          <div
            className={styles.kpiProgressFill}
            style={{ width: '72%', backgroundColor: '#16a34a' }}
          />
        </div>
      </div>

      <div className={styles.kpiCard}>
        <p className={`${styles.kpiLabel} ${styles.colorOrange}`}>
          <Receipt size={20} /> Total de entrada
        </p>
        <p className={`${styles.kpiValue} ${styles.colorOrange}`}>{formatBRL(totalEntrada)}</p>
        <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>
          {notasEntrada.length} nota{notasEntrada.length !== 1 ? 's' : ''} de entrada
        </p>
        <div className={styles.kpiProgressTrack}>
          <div
            className={styles.kpiProgressFill}
            style={{ width: '28%', backgroundColor: '#f97316' }}
          />
        </div>
      </div>

      <div className={styles.kpiCard}>
        <p className={`${styles.kpiLabel} ${styles.colorMuted}`}>
          <AlertCircle size={20} /> Pendentes
        </p>
        <p
          className={`${styles.kpiValue} ${
            notasPendentes.length > 0 ? styles.colorOrange : styles.colorMuted
          }`}
        >
          {notasPendentes.length}
        </p>
        <p className={`${styles.kpiTrend} ${styles.colorMuted}`}>
          {notasPendentes.length > 0 ? 'Aguardando autorização' : 'Nenhuma pendência'}
        </p>
        <div className={styles.kpiProgressTrack}>
          <div
            className={styles.kpiProgressFill}
            style={{
              width: `${notas.length ? (notasPendentes.length / notas.length) * 100 : 0}%`,
              backgroundColor: '#f97316',
            }}
          />
        </div>
      </div>
    </div>
  )
}
