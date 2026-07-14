import type { ReactNode } from 'react'

import styles from '@/components/ui/pdf/PdfPreview.module.css'

interface PdfToolbarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PdfToolbar({ title, subtitle, actions }: PdfToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.titleWrap}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}
