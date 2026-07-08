import { api } from '@/services/api'
import type {
  AtualizarSaldoContaPayload,
  BulkContasPagarPayload,
  BulkContasReceberPayload,
  ConciliarExtratoPayload,
  ContaPagarDetalhe,
  ContaReceberDetalhe,
  CreateContaPagarPayload,
  CreateContaReceberPayload,
  CreateExtratoMovimentoPayload,
  CreateTransferenciaPayload,
  DesconciliarExtratoPayload,
  ExportFinanceiroPayload,
  ExtratoListParams,
  ExtratoMovimentoDetalhe,
  ImportarExtratoPayload,
  ListContasBancariasResponse,
  PagarContaPayload,
  ReceberContaPayload,
  TransferenciaDetalhe,
  UpdateContaPagarPayload,
  UpdateContaReceberPayload,
  UpdateTransferenciaPayload,
} from '@/services/financeiro.api.types'
import type {
  ContaBancaria,
  ContaPagar,
  ContaReceber,
  ExtratoMovimento,
  Lancamento,
  Transferencia,
} from '@/features/financeiro/types'
import type { FinanceiroResumo } from '@/features/financeiro/utils'

/**
 * Serviço HTTP do módulo Financeiro.
 */
export const financeiroService = {
  // ─── Visão geral ───────────────────────────────────────────────────────────
  async listLancamentos(): Promise<Lancamento[]> {
    const { data } = await api.get<Lancamento[]>('/financeiro/lancamentos')
    return data
  },

  async getResumo(): Promise<FinanceiroResumo> {
    const { data } = await api.get<FinanceiroResumo>('/financeiro/resumo')
    return data
  },

  // ─── Contas a Receber [API] ────────────────────────────────────────────────
  async listContasReceber(): Promise<ContaReceber[]> {
    const { data } = await api.get<ContaReceber[]>('/financeiro/contas-receber')
    return data
  },

  async getContaReceberById(id: string): Promise<ContaReceberDetalhe> {
    const { data } = await api.get<ContaReceberDetalhe>(`/financeiro/contas-receber/${id}`)
    return data
  },

  async createContaReceber(payload: CreateContaReceberPayload): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>('/financeiro/contas-receber', payload)
    return data
  },

  async updateContaReceber(id: string, payload: UpdateContaReceberPayload): Promise<ContaReceber> {
    const { data } = await api.patch<ContaReceber>(`/financeiro/contas-receber/${id}`, payload)
    return data
  },

  async deleteContaReceber(id: string): Promise<void> {
    await api.delete(`/financeiro/contas-receber/${id}`)
  },

  async duplicateContaReceber(id: string): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>(`/financeiro/contas-receber/${id}/duplicar`)
    return data
  },

  async receberConta(id: string, payload: ReceberContaPayload): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>(`/financeiro/contas-receber/${id}/receber`, payload)
    return data
  },

  async estornarRecebimento(id: string): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>(`/financeiro/contas-receber/${id}/estornar`)
    return data
  },

  async cancelarContaReceber(id: string): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>(`/financeiro/contas-receber/${id}/cancelar`)
    return data
  },

  async bulkContasReceber(payload: BulkContasReceberPayload): Promise<void> {
    await api.post('/financeiro/contas-receber/bulk', payload)
  },

  // ─── Contas a Pagar [API] ──────────────────────────────────────────────────
  async listContasPagar(): Promise<ContaPagar[]> {
    const { data } = await api.get<ContaPagar[]>('/financeiro/contas-pagar')
    return data
  },

  async getContaPagarById(id: string): Promise<ContaPagarDetalhe> {
    const { data } = await api.get<ContaPagarDetalhe>(`/financeiro/contas-pagar/${id}`)
    return data
  },

  async createContaPagar(payload: CreateContaPagarPayload): Promise<ContaPagar[]> {
    const { data } = await api.post<ContaPagar[]>('/financeiro/contas-pagar', payload)
    return data
  },

  async updateContaPagar(id: string, payload: UpdateContaPagarPayload): Promise<ContaPagar> {
    const { data } = await api.patch<ContaPagar>(`/financeiro/contas-pagar/${id}`, payload)
    return data
  },

  async deleteContaPagar(id: string): Promise<void> {
    await api.delete(`/financeiro/contas-pagar/${id}`)
  },

  async duplicateContaPagar(id: string): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/duplicar`)
    return data
  },

  async pagarConta(id: string, payload: PagarContaPayload): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/pagar`, payload)
    return data
  },

  async estornarPagamento(id: string): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/estornar`)
    return data
  },

  async cancelarContaPagar(id: string): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/cancelar`)
    return data
  },

  async bulkContasPagar(payload: BulkContasPagarPayload): Promise<void> {
    await api.post('/financeiro/contas-pagar/bulk', payload)
  },

  // ─── Extrato [API] ─────────────────────────────────────────────────────────
  async listExtrato(params?: ExtratoListParams): Promise<ExtratoMovimento[]> {
    const { data } = await api.get<ExtratoMovimento[]>('/financeiro/extrato', { params })
    return data
  },

  async getExtratoMovimentoById(id: string): Promise<ExtratoMovimentoDetalhe> {
    const { data } = await api.get<ExtratoMovimentoDetalhe>(`/financeiro/extrato/${id}`)
    return data
  },

  async createExtratoMovimento(payload: CreateExtratoMovimentoPayload): Promise<ExtratoMovimento> {
    const { data } = await api.post<ExtratoMovimento>('/financeiro/extrato', payload)
    return data
  },

  async updateExtratoMovimento(id: string, payload: Partial<CreateExtratoMovimentoPayload>): Promise<ExtratoMovimento> {
    const { data } = await api.patch<ExtratoMovimento>(`/financeiro/extrato/${id}`, payload)
    return data
  },

  async deleteExtratoMovimento(id: string): Promise<void> {
    await api.delete(`/financeiro/extrato/${id}`)
  },

  async importarExtrato(payload: ImportarExtratoPayload): Promise<ExtratoMovimento[]> {
    const formData = new FormData()
    formData.append('arquivo', payload.arquivo)
    formData.append('contaId', payload.contaId)
    formData.append('formato', payload.formato)
    const { data } = await api.post<ExtratoMovimento[]>('/financeiro/extrato/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async conciliarExtrato(payload: ConciliarExtratoPayload): Promise<void> {
    await api.post('/financeiro/extrato/conciliar', payload)
  },

  async desconciliarExtrato(payload: DesconciliarExtratoPayload): Promise<void> {
    await api.post('/financeiro/extrato/desconciliar', payload)
  },

  // ─── Transferências [API] ──────────────────────────────────────────────────
  async listTransferencias(): Promise<Transferencia[]> {
    const { data } = await api.get<Transferencia[]>('/financeiro/transferencias')
    return data
  },

  async getTransferenciaById(id: string): Promise<TransferenciaDetalhe> {
    const { data } = await api.get<TransferenciaDetalhe>(`/financeiro/transferencias/${id}`)
    return data
  },

  async createTransferencia(payload: CreateTransferenciaPayload): Promise<Transferencia> {
    const { data } = await api.post<Transferencia>('/financeiro/transferencias', payload)
    return data
  },

  async updateTransferencia(id: string, payload: UpdateTransferenciaPayload): Promise<Transferencia> {
    const { data } = await api.patch<Transferencia>(`/financeiro/transferencias/${id}`, payload)
    return data
  },

  async confirmarTransferencia(id: string): Promise<Transferencia> {
    const { data } = await api.post<Transferencia>(`/financeiro/transferencias/${id}/confirmar`)
    return data
  },

  async cancelarTransferencia(id: string): Promise<Transferencia> {
    const { data } = await api.post<Transferencia>(`/financeiro/transferencias/${id}/cancelar`)
    return data
  },

  async deleteTransferencia(id: string): Promise<void> {
    await api.delete(`/financeiro/transferencias/${id}`)
  },

  async duplicateTransferencia(id: string): Promise<Transferencia> {
    const { data } = await api.post<Transferencia>(`/financeiro/transferencias/${id}/duplicar`)
    return data
  },

  // ─── Contas bancárias [API] ────────────────────────────────────────────────
  async listContasBancarias(): Promise<ListContasBancariasResponse> {
    const { data } = await api.get<ContaBancaria[]>('/financeiro/contas-bancarias')
    return data
  },

  async atualizarSaldoConta(id: string, payload: AtualizarSaldoContaPayload): Promise<ContaBancaria> {
    const { data } = await api.post<ContaBancaria>(`/financeiro/contas-bancarias/${id}/atualizar-saldo`, payload)
    return data
  },

  // ─── Exportação [API] ──────────────────────────────────────────────────────
  async exportar(payload: ExportFinanceiroPayload): Promise<Blob> {
    const { data } = await api.post<Blob>('/financeiro/exportar', payload, { responseType: 'blob' })
    return data
  },
}
