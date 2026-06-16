import { create } from 'zustand'

import { NOTAS_FISCAIS } from '@/features/notasFiscais/data/notasFiscais'
import type { NotaFiscal, NotaFiscalFormValues } from '@/features/notasFiscais/types'
import { buildNotaFromForm } from '@/features/notasFiscais/utils'

interface NotasFiscaisState {
  notas: NotaFiscal[]
  addNota: (values: NotaFiscalFormValues) => NotaFiscal
  updateNota: (id: string, data: Partial<NotaFiscal>) => void
  cancelarNota: (id: string, motivo: string) => void
  getNotaById: (id: string) => NotaFiscal | undefined
}

export const useNotasFiscaisStore = create<NotasFiscaisState>((set, get) => ({
  notas: NOTAS_FISCAIS,

  addNota: (values) => {
    const nota: NotaFiscal = {
      ...buildNotaFromForm(values, get().notas.length),
      id: `nf-${Date.now()}`,
    }

    set((state) => ({ notas: [nota, ...state.notas] }))
    return nota
  },

  updateNota: (id, data) => {
    set((state) => ({
      notas: state.notas.map((nota) => (nota.id === id ? { ...nota, ...data } : nota)),
    }))
  },

  cancelarNota: (id, motivo) => {
    set((state) => ({
      notas: state.notas.map((nota) =>
        nota.id === id
          ? { ...nota, status: 'cancelada', motivoCancelamento: motivo }
          : nota,
      ),
    }))
  },

  getNotaById: (id) => get().notas.find((nota) => nota.id === id),
}))
