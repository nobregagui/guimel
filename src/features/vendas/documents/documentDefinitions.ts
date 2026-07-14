import type { Pedido } from '@/features/vendas/types'
import { STATUS_PEDIDO_LABEL } from '@/features/vendas/data/shared'
import type { VendaDocumentoMeta, VendaDocumentoOption, VendaDocumentoTipo } from '@/features/vendas/documents/types'

export const VENDA_DOCUMENTO_OPTIONS: VendaDocumentoOption[] = [
  { tipo: 'pedido', label: 'Pedido de Venda', icon: '📄' },
  { tipo: 'romaneio', label: 'Romaneio de Separação', icon: '📦' },
  { tipo: 'orcamento', label: 'Orçamento', icon: '🧾' },
  { tipo: 'comprovante', label: 'Comprovante da Venda', icon: '📄' },
  { tipo: 'exportar', label: 'Exportar PDF', icon: '⬇' },
]

export function getVendaDocumentoOptions(pedido: Pick<Pedido, 'nfeChave' | 'status'>): VendaDocumentoOption[] {
  const options = [...VENDA_DOCUMENTO_OPTIONS]

  // DANFE ainda sem endpoint no backend — exibe desabilitado quando já há NF-e
  if (pedido.nfeChave) {
    options.push({
      tipo: 'danfe',
      label: 'DANFE',
      icon: '📑',
      disabled: true,
      disabledReason: 'DANFE ainda não disponível.',
    })
  }

  if (pedido.status === 'orcamento') {
    return options.filter((option) => option.tipo !== 'comprovante')
  }

  return options
}

export function buildVendaDocumentoMeta(pedido: Pedido): VendaDocumentoMeta {
  const quantidadeItens = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0)

  return {
    clienteNome: pedido.clienteNome,
    numero: pedido.numero,
    dataIso: pedido.dataIso,
    vendedorNome: pedido.vendedorNome,
    statusLabel: STATUS_PEDIDO_LABEL[pedido.status],
    total: pedido.total,
    quantidadeItens,
    pesoTotal: null,
    hasNfe: Boolean(pedido.nfeChave),
  }
}

export function getDocumentoFilename(tipo: VendaDocumentoTipo, numero: string): string {
  const safeNumero = numero.replace(/[^\w.-]+/g, '_')
  // exportar é alias de pedido → mesmo filename
  const resolved: Exclude<VendaDocumentoTipo, 'exportar'> =
    tipo === 'exportar' ? 'pedido' : tipo

  const map: Record<Exclude<VendaDocumentoTipo, 'exportar'>, string> = {
    pedido: `pedido-${safeNumero}.pdf`,
    romaneio: `romaneio-${safeNumero}.pdf`,
    orcamento: `orcamento-${safeNumero}.pdf`,
    comprovante: `comprovante-${safeNumero}.pdf`,
    danfe: `danfe-${safeNumero}.pdf`,
  }
  return map[resolved]
}

export function getDocumentoTitle(tipo: VendaDocumentoTipo): string {
  const map: Record<VendaDocumentoTipo, string> = {
    pedido: 'Pedido de Venda',
    romaneio: 'Romaneio de Separação',
    orcamento: 'Orçamento',
    comprovante: 'Comprovante da Venda',
    exportar: 'Exportar PDF',
    danfe: 'DANFE',
  }
  return map[tipo]
}
