export type VendaDocumentoTipo =
  | 'pedido'
  | 'romaneio'
  | 'orcamento'
  | 'comprovante'
  | 'exportar'
  | 'danfe'

/** Tipos com path dedicado no backend DocumentsModule. */
export type VendaDocumentoEndpointTipo = 'pedido' | 'romaneio' | 'orcamento' | 'comprovante'

export interface VendaDocumentoOption {
  tipo: VendaDocumentoTipo
  label: string
  icon: string
  description?: string
  disabled?: boolean
  disabledReason?: string
}

export interface VendaDocumentoMeta {
  clienteNome: string
  numero: string
  dataIso: string
  vendedorNome: string | null
  statusLabel: string
  total: number
  quantidadeItens: number
  pesoTotal: number | null
  hasNfe: boolean
}

export interface PdfBlobResult {
  blob: Blob
  filename: string
  objectUrl: string
}
