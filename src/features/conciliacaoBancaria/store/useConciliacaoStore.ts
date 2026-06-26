import { create } from 'zustand'

import { CONTAS_CONCILIACAO } from '@/features/conciliacaoBancaria/data/contas'
import { ERP_LANCAMENTOS } from '@/features/conciliacaoBancaria/data/erp'
import { EXTRATO_ITEMS } from '@/features/conciliacaoBancaria/data/extrato'
import { REGRAS_AUTOMATICAS } from '@/features/conciliacaoBancaria/data/regras'
import type {
  ConciliacaoRegistro,
  ContaConciliacao,
  ErpLancamento,
  ExtratoItem,
  RegraAutomatica,
  SugestaoScore,
} from '@/features/conciliacaoBancaria/types'
import { calcularSugestoes } from '@/features/conciliacaoBancaria/utils'

let _seq = 0
function uid(prefix: string): string {
  _seq += 1
  return `${prefix}-${Date.now()}-${_seq}`
}

const NOW_BR = '26/06/2026 10:00'
const NOW_ISO = '2026-06-26T10:00:00.000Z'
const USUARIO = 'Guilherme Silva'

interface ConciliacaoState {
  contas: ContaConciliacao[]
  extratoItems: ExtratoItem[]
  erpLancamentos: ErpLancamento[]
  conciliacoes: ConciliacaoRegistro[]
  regras: RegraAutomatica[]

  // UI selection state
  selectedExtratoIds: string[]
  selectedErpIds: string[]
  drawerExtratoId: string | null
  drawerErpId: string | null

  // actions — selection
  toggleExtratoSelection: (id: string) => void
  toggleErpSelection: (id: string) => void
  clearSelection: () => void

  // actions — reconciliation
  conciliarManual: (extratoIds: string[], erpIds: string[], observacao?: string) => void
  conciliarAutomatica: (extratoId: string, erpId: string, score: number) => void
  desfazerConciliacao: (conciliacaoId: string) => void
  ignorarExtrato: (extratoItemId: string) => void

  // actions — drawer
  openDrawerExtrato: (id: string) => void
  openDrawerErp: (id: string) => void
  closeDrawer: () => void

  // actions — rules
  toggleRegra: (regraId: string) => void
  criarRegra: (dados: Omit<RegraAutomatica, 'id' | 'aplicacoes' | 'criadaEm'>) => void
  editarRegra: (id: string, dados: Partial<RegraAutomatica>) => void
  excluirRegra: (id: string) => void
  aplicarRegras: () => number

  // computed
  getSugestoes: (extratoItemId: string) => SugestaoScore[]
  getPendentesExtrato: () => ExtratoItem[]
  getPendentesErp: () => ErpLancamento[]
  getExtratoById: (id: string) => ExtratoItem | undefined
  getErpById: (id: string) => ErpLancamento | undefined
  getConciliacaoByExtratoId: (extratoId: string) => ConciliacaoRegistro | undefined
}

export const useConciliacaoStore = create<ConciliacaoState>((set, get) => ({
  contas: CONTAS_CONCILIACAO,
  extratoItems: EXTRATO_ITEMS,
  erpLancamentos: ERP_LANCAMENTOS,
  conciliacoes: [],
  regras: REGRAS_AUTOMATICAS,

  selectedExtratoIds: [],
  selectedErpIds: [],
  drawerExtratoId: null,
  drawerErpId: null,

  // ─── Selection ─────────────────────────────────────────────────────────────
  toggleExtratoSelection: (id) =>
    set((state) => ({
      selectedExtratoIds: state.selectedExtratoIds.includes(id)
        ? state.selectedExtratoIds.filter((x) => x !== id)
        : [...state.selectedExtratoIds, id],
    })),

  toggleErpSelection: (id) =>
    set((state) => ({
      selectedErpIds: state.selectedErpIds.includes(id)
        ? state.selectedErpIds.filter((x) => x !== id)
        : [...state.selectedErpIds, id],
    })),

  clearSelection: () => set({ selectedExtratoIds: [], selectedErpIds: [] }),

  // ─── Reconciliation ────────────────────────────────────────────────────────
  conciliarManual: (extratoIds, erpIds, observacao) => {
    const conciliacaoId = uid('conc')
    const isMultipla = extratoIds.length > 1 || erpIds.length > 1
    const registro: ConciliacaoRegistro = {
      id: conciliacaoId,
      extratoItemId: extratoIds[0],
      erpLancamentoId: erpIds[0],
      extratoIds,
      erpIds,
      tipo: 'manual',
      criadoEm: NOW_BR,
      criadoEmIso: NOW_ISO,
      criadoPor: USUARIO,
      observacao,
      historico: [
        {
          evento: 'conciliado',
          descricao: isMultipla
            ? `Conciliação N:N realizada (${extratoIds.length} extratos → ${erpIds.length} lançamentos)`
            : 'Conciliação manual realizada',
          em: NOW_BR,
          emIso: NOW_ISO,
          por: USUARIO,
        },
      ],
    }

    set((state) => ({
      extratoItems: state.extratoItems.map((item) =>
        extratoIds.includes(item.id)
          ? { ...item, status: 'conciliado', conciliacaoId, lancamentoErpId: erpIds[0] }
          : item,
      ),
      erpLancamentos: state.erpLancamentos.map((erp) =>
        erpIds.includes(erp.id)
          ? { ...erp, status: 'conciliado', conciliacaoId, extratoItemId: extratoIds[0] }
          : erp,
      ),
      conciliacoes: [registro, ...state.conciliacoes],
      selectedExtratoIds: [],
      selectedErpIds: [],
    }))
  },

  conciliarAutomatica: (extratoId, erpId, score) => {
    const conciliacaoId = uid('conc-auto')
    const registro: ConciliacaoRegistro = {
      id: conciliacaoId,
      extratoItemId: extratoId,
      erpLancamentoId: erpId,
      extratoIds: [extratoId],
      erpIds: [erpId],
      tipo: 'sugerida',
      score,
      criadoEm: NOW_BR,
      criadoEmIso: NOW_ISO,
      criadoPor: 'GuiMe AI',
      historico: [
        {
          evento: 'sugerido',
          descricao: `Sugerido pelo GuiMe AI com ${score}% de confiança`,
          em: NOW_BR,
          emIso: NOW_ISO,
          por: 'GuiMe AI',
        },
        {
          evento: 'conciliado',
          descricao: 'Conciliação aprovada pelo usuário',
          em: NOW_BR,
          emIso: NOW_ISO,
          por: USUARIO,
        },
      ],
    }

    set((state) => ({
      extratoItems: state.extratoItems.map((item) =>
        item.id === extratoId
          ? { ...item, status: 'conciliado', conciliacaoId, lancamentoErpId: erpId }
          : item,
      ),
      erpLancamentos: state.erpLancamentos.map((erp) =>
        erp.id === erpId
          ? { ...erp, status: 'conciliado', conciliacaoId, extratoItemId: extratoId }
          : erp,
      ),
      conciliacoes: [registro, ...state.conciliacoes],
    }))
  },

  desfazerConciliacao: (conciliacaoId) => {
    set((state) => ({
      extratoItems: state.extratoItems.map((item) =>
        item.conciliacaoId === conciliacaoId
          ? { ...item, status: 'pendente', conciliacaoId: undefined, lancamentoErpId: undefined }
          : item,
      ),
      erpLancamentos: state.erpLancamentos.map((erp) =>
        erp.conciliacaoId === conciliacaoId
          ? { ...erp, status: 'pendente', conciliacaoId: undefined, extratoItemId: undefined }
          : erp,
      ),
      conciliacoes: state.conciliacoes.map((c) =>
        c.id === conciliacaoId
          ? {
              ...c,
              historico: [
                ...c.historico,
                {
                  evento: 'desfeito' as const,
                  descricao: 'Conciliação desfeita',
                  em: NOW_BR,
                  emIso: NOW_ISO,
                  por: USUARIO,
                },
              ],
            }
          : c,
      ),
    }))
  },

  ignorarExtrato: (extratoItemId) => {
    set((state) => ({
      extratoItems: state.extratoItems.map((item) =>
        item.id === extratoItemId ? { ...item, status: 'ignorado' } : item,
      ),
    }))
  },

  // ─── Drawer ────────────────────────────────────────────────────────────────
  openDrawerExtrato: (id) => set({ drawerExtratoId: id, drawerErpId: null }),
  openDrawerErp: (id) => set({ drawerErpId: id, drawerExtratoId: null }),
  closeDrawer: () => set({ drawerExtratoId: null, drawerErpId: null }),

  // ─── Rules ─────────────────────────────────────────────────────────────────
  toggleRegra: (regraId) =>
    set((state) => ({
      regras: state.regras.map((r) => (r.id === regraId ? { ...r, ativo: !r.ativo } : r)),
    })),

  criarRegra: (dados) =>
    set((state) => ({
      regras: [
        ...state.regras,
        { ...dados, id: uid('regra'), aplicacoes: 0, criadaEm: NOW_BR },
      ],
    })),

  editarRegra: (id, dados) =>
    set((state) => ({
      regras: state.regras.map((r) => (r.id === id ? { ...r, ...dados } : r)),
    })),

  excluirRegra: (id) =>
    set((state) => ({
      regras: state.regras.filter((r) => r.id !== id),
    })),

  aplicarRegras: () => {
    const state = get()
    let count = 0

    const regrasAtivas = state.regras.filter((r) => r.ativo)
    const pendenteExtrato = state.extratoItems.filter((i) => i.status === 'pendente')
    const pendenteErp = state.erpLancamentos.filter((e) => e.status === 'pendente')

    regrasAtivas.forEach((regra) => {
      pendenteExtrato
        .filter((item) => regra.origens.length === 0 || regra.origens.includes(item.origem))
        .filter((item) =>
          regra.palavrasChave.some((kw) => item.descricao.toUpperCase().includes(kw.toUpperCase())),
        )
        .forEach((extratoItem) => {
          const tipoErpEsperado = extratoItem.tipo === 'credito' ? 'receber' : 'pagar'
          const tipoOk = regra.tipo === 'ambos' || regra.tipo === tipoErpEsperado

          if (!tipoOk) return

          const match = pendenteErp.find((erp) => {
            if (erp.tipo !== tipoErpEsperado) return false
            const diff = Math.abs(extratoItem.valor - erp.valor) / Math.max(erp.valor, 1)
            return diff <= 0.02
          })

          if (match) {
            get().conciliarManual(
              [extratoItem.id],
              [match.id],
              `Auto-conciliado pela regra: ${regra.nome}`,
            )
            count++
          }
        })
    })

    return count
  },

  // ─── Computed ──────────────────────────────────────────────────────────────
  getSugestoes: (extratoItemId) => {
    const state = get()
    const item = state.extratoItems.find((i) => i.id === extratoItemId)
    if (!item) return []
    const candidatos = state.erpLancamentos.filter((e) => e.status === 'pendente')
    return calcularSugestoes(item, candidatos)
  },

  getPendentesExtrato: () => {
    const state = get()
    return state.extratoItems.filter((i) => i.status === 'pendente' || i.status === 'sugerido')
  },

  getPendentesErp: () => {
    const state = get()
    return state.erpLancamentos.filter((e) => e.status === 'pendente')
  },

  getExtratoById: (id) => get().extratoItems.find((i) => i.id === id),

  getErpById: (id) => get().erpLancamentos.find((e) => e.id === id),

  getConciliacaoByExtratoId: (extratoId) =>
    get().conciliacoes.find(
      (c) => c.extratoIds?.includes(extratoId) ?? c.extratoItemId === extratoId,
    ),
}))
