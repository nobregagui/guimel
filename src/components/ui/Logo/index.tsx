import type { CSSProperties } from 'react'

import logoImg from '@/assets/newLogo.png'

/** Padrão: container compacto + imagem maior. */
export const LOGO_CONTAINER_HEIGHT = 52
export const LOGO_IMAGE_HEIGHT = 121

interface LogoProps {
  /** Altura do container (span). Padrão: 52px. */
  height?: number
  /** Altura da imagem. Padrão: 121px. */
  imgHeight?: number
  /** Largura do container; se omitida, acompanha a proporção da imagem. */
  width?: number
  /** Recorta para exibir só o símbolo (sidebar recolhida). */
  markOnly?: boolean
  className?: string
  style?: CSSProperties
  alt?: string
}

export function Logo({
  height = LOGO_CONTAINER_HEIGHT,
  imgHeight = LOGO_IMAGE_HEIGHT,
  width,
  markOnly = false,
  className,
  style,
  alt = 'GuiMel Money — Sistema ERP',
}: LogoProps) {

  const containerWidth = markOnly ? height : width

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: markOnly ? 'flex-start' : 'center',
        height,
        ...(containerWidth != null ? { width: containerWidth } : {}),
        overflow: markOnly ? 'hidden' : 'visible',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <img
        src={logoImg}
        alt={alt}
        style={{
          height: imgHeight,
          width: 'auto',
          maxWidth: 'none',
          display: 'block',
          objectFit: 'contain',
          objectPosition: markOnly ? 'left center' : 'center center',
          ...style,
        }}
      />
    </span>
  )
}
