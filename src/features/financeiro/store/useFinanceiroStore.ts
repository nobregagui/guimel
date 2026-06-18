import { create } from 'zustand'

import { CONTAS_PAGAR } from '@/features/financeiro/data/contasPagar'
import { CONTAS_RECEBER } from '@/features/financeiro/data/contasReceber'
import { EXTRATO_MOVIMENTOS } from '@/features/financeiro/data/extrato'
import { CONTAS_BANCARIAS, LANCAMENTOS } from '@/features/financeiro/data/shared'
import { TRANSFERENCIAS } from '@/features/financeiro/data/transferencias'
import type {
  ContaBancaria,
  ContaPagar,
  ContaPagarFormValues,
  ContaReceber,
  ContaReceberFormValues,
  ExtratoMovimento,
  ExtratoMovimentoFormValues,
  Lancamento,
  LancamentoFormValues,
  Transferencia,
  TransferenciaFormValues,
} from '@/features/financeiro/types'
import { formatIsoToBR } from '@/features/financeiro/utils'

interface FinanceiroState {
  contasBancarias: ContaBancaria[]
  lancamentos: Lancamento[]
  contasPagar: ContaPagar[]
  contasReceber: ContaReceber[]
  extratoMovimentos: ExtratoMovimento[]
  transferencias: Transferencia[]
  addLancamento: (values: LancamentoFormValues) => void
  addContaPagar: (values: ContaPagarFormValues) => void
  addContaReceber: (values: ContaReceberFormValues) => void
  addExtratoMovimento: (values: ExtratoMovimentoFormValues) => void
  addTransferencia: (values: TransferenciaFormValues) => void
}

let _seq = 0

function uid(prefix: string): string {
  _seq += 1
  return `${prefix}-${Date.now()}-${_seq}`
}

export const useFinanceiroStore = create<FinanceiroState>((set) => ({
  contasBancarias: CONTAS_BANCARIAS,
  lancamentos: LANCAMENTOS,
  contasPagar: CONTAS_PAGAR,
  contasReceber: CONTAS_RECEBER,
  extratoMovimentos: EXTRATO_MOVIMENTOS,
  transferencias: TRANSFERENCIAS,

  addLancamento: (values) => {
    const novo: Lancamento = {
      id: uid('lc'),
      descricao: values.descricao,
      subDescricao: values.subDescricao || (values.tipo === 'receber' ? 'A receber' : 'A pagar'),
      categoria: values.categoria || 'Outros',
      vencimento: formatIsoToBR(values.vencimentoIso),
      vencimentoIso: values.vencimentoIso,
      tipo: values.tipo,
      valor: values.valor,
      status: values.status,
    }
    set((state) => ({ lancamentos: [novo, ...state.lancamentos] }))
  },

  addContaPagar: (values) => {
    const novo: ContaPagar = {
      id: uid('cp'),
      fornecedor: values.fornecedor,
      documento: values.documento || '—',
      categoria: values.categoria || 'Outros',
      vencimento: formatIsoToBR(values.vencimentoIso),
      vencimentoIso: values.vencimentoIso,
      valor: values.valor,
      formaPagamento: values.formaPagamento,
      status: values.status,
    }
    set((state) => ({ contasPagar: [novo, ...state.contasPagar] }))
  },

  addContaReceber: (values) => {
    const novo: ContaReceber = {
      id: uid('cr'),
      cliente: values.cliente,
      documento: values.documento || '—',
      categoria: values.categoria || 'Outros',
      vencimento: formatIsoToBR(values.vencimentoIso),
      vencimentoIso: values.vencimentoIso,
      valor: values.valor,
      formaPagamento: values.formaPagamento,
      status: values.status,
    }
    set((state) => ({ contasReceber: [novo, ...state.contasReceber] }))
  },

  addExtratoMovimento: (values) => {
    set((state) => {
      const delta = values.tipo === 'entrada' ? values.valor : -values.valor
      const contasBancarias = state.contasBancarias.map((conta) =>
        conta.id === values.contaId ? { ...conta, saldo: conta.saldo + delta } : conta,
      )
      const saldoApos = contasBancarias.find((conta) => conta.id === values.contaId)?.saldo ?? 0

      const novo: ExtratoMovimento = {
        id: uid('ex'),
        contaId: values.contaId,
        data: formatIsoToBR(values.dataIso),
        dataIso: values.dataIso,
        descricao: values.descricao,
        detalhe: values.detalhe || (values.tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
        categoria: values.categoria || 'Outros',
        tipo: values.tipo,
        valor: values.valor,
        saldoApos,
      }

      return { extratoMovimentos: [novo, ...state.extratoMovimentos], contasBancarias }
    })
  },

  addTransferencia: (values) => {
    set((state) => {
      const contasBancarias =
        values.status === 'concluida'
          ? state.contasBancarias.map((conta) => {
              if (conta.id === values.contaOrigemId) return { ...conta, saldo: conta.saldo - values.valor }
              if (conta.id === values.contaDestinoId) return { ...conta, saldo: conta.saldo + values.valor }
              return conta
            })
          : state.contasBancarias

      const novo: Transferencia = {
        id: uid('tr'),
        contaOrigemId: values.contaOrigemId,
        contaDestinoId: values.contaDestinoId,
        data: formatIsoToBR(values.dataIso),
        dataIso: values.dataIso,
        descricao: values.descricao,
        observacao: values.observacao || undefined,
        valor: values.valor,
        status: values.status,
      }

      return { transferencias: [novo, ...state.transferencias], contasBancarias }
    })
  },
}))
