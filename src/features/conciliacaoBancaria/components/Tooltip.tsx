import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: string
  children: React.ReactElement
  placement?: TooltipPlacement
  disabled?: boolean
}

const PLACEMENT_CLASS: Record<TooltipPlacement, string> = {
  top: styles.tooltipTop,
  bottom: styles.tooltipBottom,
  left: styles.tooltipLeft,
  right: styles.tooltipRight,
}

export function Tooltip({ content, children, placement = 'top', disabled = false }: TooltipProps) {
  if (disabled || !content) return children

  return (
    <span
      className={`${styles.tooltipWrapper} ${PLACEMENT_CLASS[placement]}`}
      data-tooltip={content}
    >
      {children}
    </span>
  )
}
