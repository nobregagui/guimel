import { Link, useLocation } from 'react-router-dom'

import { useHomeRoute } from '@/hooks/useHomeRoute'

import styles from './ForbiddenPage.module.css'

export function ForbiddenPage() {
  const location = useLocation()
  const homeRoute = useHomeRoute()
  const from = (location.state as { from?: string } | null)?.from

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <p className={styles.code}>403</p>
        <h1 className={styles.title}>Acesso restrito</h1>
        <p className={styles.description}>
          Você não tem permissão para acessar esta página.
          {from ? ` (${from})` : ''}
        </p>
        <Link to={homeRoute} className={styles.link}>
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
