import clsx from 'clsx'

import styles from '@/components/ui/Loading/Loading.module.css'

export type LoadingSize = 'sm' | 'md' | 'lg'
export type LoadingTone = 'light' | 'green' | 'muted'
export type LoadingLayout = 'inline' | 'centered' | 'fullscreen'

const SIZE_CLASS: Record<LoadingSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
}

const TONE_CLASS: Record<LoadingTone, string> = {
  light: styles.toneLight,
  green: styles.toneGreen,
  muted: styles.toneMuted,
}

const LAYOUT_CLASS: Record<LoadingLayout, string> = {
  inline: styles.layoutInline,
  centered: styles.layoutCentered,
  fullscreen: styles.layoutFullscreen,
}

export interface LoadingSpinnerProps {
  size?: LoadingSize
  tone?: LoadingTone
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  tone = 'green',
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      className={clsx(styles.loadingSpinner, SIZE_CLASS[size], TONE_CLASS[tone], className)}
      aria-hidden="true"
    />
  )
}

export interface LoadingProps {
  label?: string
  size?: LoadingSize
  tone?: LoadingTone
  layout?: LoadingLayout
  className?: string
}

export function Loading({
  label = 'Carregando...',
  size = 'lg',
  tone = 'green',
  layout = 'centered',
  className,
}: LoadingProps) {
  return (
    <div
      className={clsx(styles.loading, LAYOUT_CLASS[layout], className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size={size} tone={tone} />
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  )
}

export interface LoadingButtonContentProps {
  loading: boolean
  loadingLabel: string
  idleLabel: string
  spinnerTone?: LoadingTone
}

export function LoadingButtonContent({
  loading,
  loadingLabel,
  idleLabel,
  spinnerTone = 'light',
}: LoadingButtonContentProps) {
  if (!loading) return idleLabel

  return (
    <span className={styles.buttonContent}>
      <LoadingSpinner size="sm" tone={spinnerTone} />
      {loadingLabel}
    </span>
  )
}
