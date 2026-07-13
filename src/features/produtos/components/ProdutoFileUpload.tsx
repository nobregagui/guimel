import { memo, useCallback, useRef, useState } from 'react'
import { FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react'

import type { ProdutoArquivoMeta } from '@/features/produtos/types'
import { getApiAssetUrl } from '@/utils/apiAssets'
import styles from '@/pages/produtos/ProdutosPage.module.css'

interface ProdutoFileUploadProps {
  label: string
  hint?: string
  accept?: string
  multiple?: boolean
  value: ProdutoArquivoMeta | null
  values?: ProdutoArquivoMeta[]
  onChange: (file: ProdutoArquivoMeta | null) => void
  onChangeMultiple?: (files: ProdutoArquivoMeta[]) => void
  disabled?: boolean
}

function createMeta(file: File): ProdutoArquivoMeta {
  return {
    id: `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type || 'application/octet-stream',
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    file,
  }
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resolvePreview(file: ProdutoArquivoMeta): string | undefined {
  return getApiAssetUrl(file.previewUrl ?? file.url)
}

function ProdutoFileUploadComponent({
  label,
  hint = 'Arraste o arquivo ou clique para selecionar',
  accept,
  multiple = false,
  value,
  values = [],
  onChange,
  onChangeMultiple,
  disabled = false,
}: ProdutoFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const applyFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList)

      if (multiple && onChangeMultiple) {
        onChangeMultiple([...values, ...files.map(createMeta)])
        return
      }

      onChange(createMeta(files[0]))
    },
    [multiple, onChange, onChangeMultiple, values],
  )

  const list = multiple ? values : value ? [value] : []

  return (
    <div className={styles.uploadField}>
      <div className={styles.uploadFieldHeader}>
        <span className={styles.uploadFieldLabel}>{label}</span>
        {hint ? <span className={styles.uploadFieldHint}>{hint}</span> : null}
      </div>

      <div
        className={`${styles.uploadZone} ${dragging ? styles.uploadZoneActive : ''} ${disabled ? styles.uploadZoneDisabled : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!disabled) applyFiles(event.dataTransfer.files)
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
      >
        <div className={styles.uploadZoneIcon}>
          <Upload size={18} />
        </div>
        <p className={styles.uploadZoneText}>{hint}</p>
        <p className={styles.uploadZoneSub}>{accept ? `Formatos: ${accept}` : 'PDF, imagens e documentos'}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          disabled={disabled}
          onChange={(event) => {
            applyFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {list.length > 0 ? (
        <ul className={styles.uploadList}>
          {list.map((file) => {
            const isImage = file.tipo.startsWith('image/')
            const preview = resolvePreview(file)
            return (
              <li key={file.id} className={styles.uploadItem}>
                {isImage && preview ? (
                  <img src={preview} alt="" className={styles.uploadItemThumb} />
                ) : (
                  <div className={styles.uploadItemIcon}>
                    {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
                  </div>
                )}
                <div className={styles.uploadItemMeta}>
                  <strong>{file.nome}</strong>
                  <span>{formatSize(file.tamanho)}</span>
                </div>
                <button
                  type="button"
                  className={styles.uploadItemRemove}
                  aria-label={`Remover ${file.nome}`}
                  disabled={disabled}
                  onClick={() => {
                    if (multiple && onChangeMultiple) {
                      onChangeMultiple(values.filter((item) => item.id !== file.id))
                      return
                    }
                    onChange(null)
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export const ProdutoFileUpload = memo(ProdutoFileUploadComponent)
