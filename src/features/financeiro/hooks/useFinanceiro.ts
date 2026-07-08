import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/components/ui/Toast'
import type { ToastOptions } from '@/components/ui/Toast'
import { financeiroService } from '@/services/financeiro.service'
import type {
  BulkContasPagarPayload,
  BulkContasReceberPayload,
  CreateContaPagarPayload,
  CreateContaReceberPayload,
  CreateExtratoMovimentoPayload,
  CreateTransferenciaPayload,
  ExtratoListParams,
  ImportarExtratoPayload,
  PagarContaPayload,
  ReceberContaPayload,
  UpdateContaPagarPayload,
  UpdateContaReceberPayload,
  UpdateTransferenciaPayload,
} from '@/services/financeiro.api.types'
import type {
  BaixaTituloFormValues,
  ContaPagarFormValues,
  ContaReceberFormValues,
  ExtratoMovimentoFormValues,
  LancamentoFormValues,
  TransferenciaFormValues,
} from '@/features/financeiro/types'

export const financeiroQueryKeys = {
  all: ['financeiro'] as const,
  lancamentos: () => [...financeiroQueryKeys.all, 'lancamentos'] as const,
  resumo: () => [...financeiroQueryKeys.all, 'resumo'] as const,
  contasBancarias: () => [...financeiroQueryKeys.all, 'contas-bancarias'] as const,
  contasReceber: (filters?: Record<string, string>) =>
    [...financeiroQueryKeys.all, 'contas-receber', filters] as const,
  contaReceber: (id: string) => [...financeiroQueryKeys.all, 'contas-receber', id] as const,
  contasPagar: (filters?: Record<string, string>) =>
    [...financeiroQueryKeys.all, 'contas-pagar', filters] as const,
  contaPagar: (id: string) => [...financeiroQueryKeys.all, 'contas-pagar', id] as const,
  extrato: (params?: ExtratoListParams) => [...financeiroQueryKeys.all, 'extrato', params] as const,
  transferencias: () => [...financeiroQueryKeys.all, 'transferencias'] as const,
  transferencia: (id: string) => [...financeiroQueryKeys.all, 'transferencias', id] as const,
}

type ShowToastFn = (options: ToastOptions) => void

export function handleFinanceiroApiError(error: unknown, showToast: ShowToastFn) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  const data = axios.isAxiosError(error) ? error.response?.data : undefined
  const rawMessage =
    typeof data === 'object' && data !== null && 'message' in data
      ? (data as { message: string | string[] }).message
      : undefined
  const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage

  if (status === 409) {
    showToast({ message: message ?? 'Operação não permitida.', variant: 'error' })
    return
  }
  if (status === 404) {
    showToast({ message: 'Registro não encontrado.', variant: 'error' })
    return
  }
  showToast({ message: message ?? 'Erro ao processar.', variant: 'error' })
}

function useInvalidateFinanceiro() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.all })
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapBaixaToReceberPayload(baixa: BaixaTituloFormValues): ReceberContaPayload {
  return {
    valorRecebido: baixa.valor,
    dataIso: baixa.dataIso,
    contaBancariaId: baixa.contaBancariaId,
    juros: baixa.juros,
    desconto: baixa.desconto,
    multa: baixa.multa,
    observacao: baixa.observacao || undefined,
  }
}

export function mapBaixaToPagarPayload(baixa: BaixaTituloFormValues): PagarContaPayload {
  return {
    valorPago: baixa.valor,
    dataIso: baixa.dataIso,
    contaBancariaId: baixa.contaBancariaId,
    juros: baixa.juros,
    desconto: baixa.desconto,
    multa: baixa.multa,
    observacao: baixa.observacao || undefined,
  }
}

export function mapContaReceberFormToCreatePayload(
  values: ContaReceberFormValues,
): CreateContaReceberPayload {
  const cliente = values.cliente.trim()
  return {
    cliente,
    descricao: values.documento.trim() || values.descricao || `Manual — ${cliente}`,
    categoria: values.categoria.trim() || 'Outros',
    centroCusto: values.centroCusto,
    dataEmissaoIso: values.dataEmissaoIso,
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    juros: values.juros,
    multa: values.multa,
    desconto: values.desconto,
    formaPagamento: values.formaPagamento,
    contaBancariaId: values.contaBancariaId,
    observacao: values.observacao,
  }
}

export function mapContaReceberFormToUpdatePayload(
  values: Partial<ContaReceberFormValues>,
): UpdateContaReceberPayload {
  return {
    cliente: values.cliente?.trim(),
    descricao: values.documento?.trim() || values.descricao,
    categoria: values.categoria?.trim(),
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    formaPagamento: values.formaPagamento,
    centroCusto: values.centroCusto,
    observacao: values.observacao,
  }
}

export function mapContaPagarFormToCreatePayload(values: ContaPagarFormValues): CreateContaPagarPayload {
  const fornecedor = values.fornecedor.trim()
  return {
    fornecedor,
    documento: values.documento.trim() || `Manual — ${fornecedor}`,
    categoria: values.categoria.trim() || 'Outros',
    dataEmissaoIso: new Date().toISOString().slice(0, 10),
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    formaPagamento: values.formaPagamento,
    modoLancamento: values.modoLancamento,
    repeticoes: values.modoLancamento === 'recorrente' ? values.repeticoes : undefined,
  }
}

export function mapContaPagarFormToUpdatePayload(
  values: Partial<ContaPagarFormValues>,
): UpdateContaPagarPayload {
  return {
    fornecedor: values.fornecedor?.trim(),
    documento: values.documento?.trim(),
    categoria: values.categoria?.trim(),
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    formaPagamento: values.formaPagamento,
  }
}

export function mapLancamentoFormToCreateReceber(values: LancamentoFormValues): CreateContaReceberPayload {
  const cliente = values.descricao.trim()
  return {
    cliente,
    descricao: values.subDescricao.trim() || `Manual — ${cliente}`,
    categoria: values.categoria.trim() || 'Outros',
    dataEmissaoIso: new Date().toISOString().slice(0, 10),
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    formaPagamento: 'pix',
  }
}

export function mapLancamentoFormToCreatePagar(values: LancamentoFormValues): CreateContaPagarPayload {
  const fornecedor = values.descricao.trim()
  return {
    fornecedor,
    documento: values.subDescricao.trim() || `Manual — ${fornecedor}`,
    categoria: values.categoria.trim() || 'Outros',
    dataEmissaoIso: new Date().toISOString().slice(0, 10),
    vencimentoIso: values.vencimentoIso,
    valor: values.valor,
    formaPagamento: 'boleto',
    modoLancamento: 'unico',
  }
}

export function mapExtratoFormToPayload(values: ExtratoMovimentoFormValues): CreateExtratoMovimentoPayload {
  return {
    contaId: values.contaId,
    dataIso: values.dataIso,
    descricao: values.descricao,
    detalhe: values.detalhe,
    categoria: values.categoria,
    tipo: values.tipo,
    valor: values.valor,
    manual: true,
  }
}

export function mapTransferenciaFormToPayload(values: TransferenciaFormValues): CreateTransferenciaPayload {
  return {
    contaOrigemId: values.contaOrigemId,
    contaDestinoId: values.contaDestinoId,
    dataIso: values.dataIso,
    valor: values.valor,
    descricao: values.descricao,
    observacao: values.observacao || undefined,
    status: values.status,
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useFinanceiroLancamentosQuery() {
  return useQuery({
    queryKey: financeiroQueryKeys.lancamentos(),
    queryFn: () => financeiroService.listLancamentos(),
  })
}

export function useFinanceiroResumoQuery() {
  return useQuery({
    queryKey: financeiroQueryKeys.resumo(),
    queryFn: () => financeiroService.getResumo(),
  })
}

export function useContasBancariasQuery() {
  return useQuery({
    queryKey: financeiroQueryKeys.contasBancarias(),
    queryFn: () => financeiroService.listContasBancarias(),
  })
}

export function useContasReceberQuery(filters?: Record<string, string>) {
  return useQuery({
    queryKey: financeiroQueryKeys.contasReceber(filters),
    queryFn: () => financeiroService.listContasReceber(),
  })
}

export function useContaReceberDetalheQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: financeiroQueryKeys.contaReceber(id ?? ''),
    queryFn: () => financeiroService.getContaReceberById(id!),
    enabled: Boolean(id) && enabled,
  })
}

export function useContasPagarQuery(filters?: Record<string, string>) {
  return useQuery({
    queryKey: financeiroQueryKeys.contasPagar(filters),
    queryFn: () => financeiroService.listContasPagar(),
  })
}

export function useContaPagarDetalheQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: financeiroQueryKeys.contaPagar(id ?? ''),
    queryFn: () => financeiroService.getContaPagarById(id!),
    enabled: Boolean(id) && enabled,
  })
}

export function useExtratoQuery(params?: ExtratoListParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.extrato(params),
    queryFn: () => financeiroService.listExtrato(params),
  })
}

export function useTransferenciasQuery() {
  return useQuery({
    queryKey: financeiroQueryKeys.transferencias(),
    queryFn: () => financeiroService.listTransferencias(),
  })
}

// ─── Mutations — Contas a Receber ─────────────────────────────────────────────

export function useCreateContaReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: CreateContaReceberPayload) => financeiroService.createContaReceber(payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Conta a receber cadastrada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useUpdateContaReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContaReceberPayload }) =>
      financeiroService.updateContaReceber(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Conta a receber atualizada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDeleteContaReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.deleteContaReceber(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Título excluído.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDuplicateContaReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.duplicateContaReceber(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Título duplicado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useReceberContaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceberContaPayload }) =>
      financeiroService.receberConta(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Recebimento registrado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useEstornarRecebimentoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.estornarRecebimento(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Recebimento estornado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useCancelarContaReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.cancelarContaReceber(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Título cancelado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useBulkContasReceberMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: BulkContasReceberPayload) => financeiroService.bulkContasReceber(payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Ação em massa concluída.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

// ─── Mutations — Contas a Pagar ───────────────────────────────────────────────

export function useCreateContaPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: CreateContaPagarPayload) => financeiroService.createContaPagar(payload),
    onSuccess: (titulos) => {
      void invalidate()
      const msg =
        titulos.length > 1
          ? `${titulos.length} títulos recorrentes gerados.`
          : 'Conta a pagar cadastrada.'
      showToast({ message: msg, variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useUpdateContaPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContaPagarPayload }) =>
      financeiroService.updateContaPagar(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Conta a pagar atualizada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDeleteContaPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.deleteContaPagar(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Título excluído.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDuplicateContaPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.duplicateContaPagar(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Despesa duplicada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function usePagarContaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PagarContaPayload }) =>
      financeiroService.pagarConta(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Pagamento registrado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useEstornarPagamentoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.estornarPagamento(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Pagamento estornado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useCancelarContaPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.cancelarContaPagar(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Título cancelado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useBulkContasPagarMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: BulkContasPagarPayload) => financeiroService.bulkContasPagar(payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Ação em massa concluída.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

// ─── Mutations — Extrato ──────────────────────────────────────────────────────

export function useCreateExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: CreateExtratoMovimentoPayload) =>
      financeiroService.createExtratoMovimento(payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Lançamento criado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useUpdateExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateExtratoMovimentoPayload> }) =>
      financeiroService.updateExtratoMovimento(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Lançamento atualizado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDeleteExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.deleteExtratoMovimento(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Lançamento excluído.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useConciliarExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (movimentoIds: string[]) =>
      financeiroService.conciliarExtrato({ movimentoIds }),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Movimentações conciliadas.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDesconciliarExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (movimentoIds: string[]) =>
      financeiroService.desconciliarExtrato({ movimentoIds }),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Movimentações desconciliadas.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useImportarExtratoMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: ImportarExtratoPayload) => financeiroService.importarExtrato(payload),
    onSuccess: (movimentos) => {
      void invalidate()
      showToast({
        message:
          movimentos.length > 0
            ? `${movimentos.length} movimentação(ões) importada(s).`
            : 'Importação recebida (backend em stub).',
        variant: 'info',
      })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

// ─── Mutations — Transferências ───────────────────────────────────────────────

export function useCreateTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (payload: CreateTransferenciaPayload) =>
      financeiroService.createTransferencia(payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência criada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useUpdateTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransferenciaPayload }) =>
      financeiroService.updateTransferencia(id, payload),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência atualizada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDeleteTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.deleteTransferencia(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência excluída.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useConfirmarTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.confirmarTransferencia(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência confirmada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useCancelarTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.cancelarTransferencia(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência cancelada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

export function useDuplicateTransferenciaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (id: string) => financeiroService.duplicateTransferencia(id),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Transferência duplicada.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}

// ─── Mutations — Contas bancárias ─────────────────────────────────────────────

export function useAtualizarSaldoContaMutation() {
  const invalidate = useInvalidateFinanceiro()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, saldo }: { id: string; saldo: number }) =>
      financeiroService.atualizarSaldoConta(id, { saldo }),
    onSuccess: () => {
      void invalidate()
      showToast({ message: 'Saldo atualizado.', variant: 'success' })
    },
    onError: (err) => handleFinanceiroApiError(err, showToast),
  })
}
