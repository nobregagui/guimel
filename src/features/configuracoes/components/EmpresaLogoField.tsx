import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'

import { useToast } from '@/components/ui/Toast'
import {
  useEmpresaQuery,
  useRemoveEmpresaLogoMutation,
  useUploadEmpresaLogoMutation,
} from '@/features/configuracoes/hooks/useEmpresa'
import { getApiAssetUrl } from '@/utils/apiAssets'
import styles from '@/pages/configuracoes/PerfilPage.module.css'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'
const MAX_BYTES = 2 * 1024 * 1024

interface EmpresaLogoFieldProps {
  canEdit: boolean
}

export function EmpresaLogoField({ canEdit }: EmpresaLogoFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const empresaQuery = useEmpresaQuery()
  const uploadMutation = useUploadEmpresaLogoMutation()
  const removeMutation = useRemoveEmpresaLogoMutation()
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)

  const logoUrl =
    previewObjectUrl ??
    (empresaQuery.data?.logoUrl
      ? getApiAssetUrl(empresaQuery.data.logoUrl) ?? empresaQuery.data.logoUrl
      : null)

  const isBusy = uploadMutation.isPending || removeMutation.isPending

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    }
  }, [previewObjectUrl])

  async function handleFileChange(file: File | undefined) {
    if (!file || !canEdit) return

    if (!file.type.startsWith('image/')) {
      showToast({ message: 'Selecione uma imagem válida (PNG, JPG, WEBP ou SVG).', variant: 'error' })
      return
    }

    if (file.size > MAX_BYTES) {
      showToast({ message: 'A imagem deve ter no máximo 2 MB.', variant: 'error' })
      return
    }

    const nextPreview = URL.createObjectURL(file)
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    setPreviewObjectUrl(nextPreview)

    try {
      await uploadMutation.mutateAsync(file)
      showToast({ message: 'Logo da empresa atualizado.', variant: 'success' })
      setPreviewObjectUrl(null)
      URL.revokeObjectURL(nextPreview)
    } catch {
      showToast({
        message: 'Não foi possível enviar o logo. Verifique se o endpoint está disponível.',
        variant: 'error',
      })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    if (!canEdit || isBusy) return
    try {
      await removeMutation.mutateAsync()
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl)
        setPreviewObjectUrl(null)
      }
      showToast({ message: 'Logo removido.', variant: 'success' })
    } catch {
      showToast({ message: 'Não foi possível remover o logo.', variant: 'error' })
    }
  }

  return (
    <div className={styles.logoField}>
      <div className={styles.logoPreviewWrap}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo da empresa" className={styles.logoPreview} />
        ) : (
          <div className={styles.logoPlaceholder} aria-hidden>
            <ImagePlus size={28} />
          </div>
        )}
      </div>

      <div className={styles.logoActions}>
        <p className={styles.logoTitle}>Logo da empresa</p>
        <p className={styles.fieldHint}>
          Usado no header do sistema e nos documentos PDF de venda. PNG, JPG, WEBP ou SVG até 2 MB.
        </p>

        <div className={styles.logoButtons}>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            className={styles.logoInput}
            disabled={!canEdit || isBusy}
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          <label
            htmlFor={inputId}
            className={`${styles.logoUploadBtn} ${!canEdit || isBusy ? styles.btnDisabled : ''}`}
          >
            {isBusy ? 'Enviando...' : logoUrl ? 'Trocar imagem' : 'Enviar logo'}
          </label>

          {logoUrl && canEdit ? (
            <button
              type="button"
              className={styles.btnDangerGhost}
              disabled={isBusy}
              onClick={() => void handleRemove()}
            >
              <Trash2 size={14} aria-hidden />
              Remover
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
