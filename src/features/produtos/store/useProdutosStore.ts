import { create } from 'zustand'

import { CATEGORIAS_MOCK, PRODUTOS_MOCK, calcularMargem } from '@/features/produtos/data/shared'
import type { Categoria, Produto, ProdutoFormValues, StatusProduto } from '@/features/produtos/types'

interface ProdutosState {
  produtos: Produto[]
  categorias: Categoria[]
  addProduto: (values: ProdutoFormValues) => void
  updateProduto: (id: string, values: Partial<ProdutoFormValues>) => void
  updateStatus: (id: string, status: StatusProduto) => void
  deleteProduto: (id: string) => void
  addCategoria: (nome: string, cor: string) => void
}

let _counter = PRODUTOS_MOCK.length + 1

function novoId(): string {
  return `pr${Date.now()}`
}

export const useProdutosStore = create<ProdutosState>((set) => ({
  produtos: PRODUTOS_MOCK,
  categorias: CATEGORIAS_MOCK,

  addProduto: (values) => {
    set((state) => {
      const categoria = state.categorias.find((c) => c.id === values.categoriaId) ?? null
      const agora = new Date().toISOString()
      const novo: Produto = {
        id: novoId(),
        codigo: values.codigo.trim() || `SKU-${String(_counter).padStart(4, '0')}`,
        codigoBarras: values.codigoBarras.trim() || null,
        nome: values.nome.trim(),
        descricao: values.descricao.trim() || null,
        tipo: values.tipo,
        status: values.status,
        categoriaId: values.categoriaId || null,
        categoriaNome: categoria?.nome ?? null,
        unidadeMedida: values.unidadeMedida,
        precoCusto: values.precoCusto,
        precoVenda: values.precoVenda,
        margemLucro: calcularMargem(values.precoCusto, values.precoVenda),
        precoPromocional: values.precoPromocional ?? null,
        ncm: values.ncm.trim(),
        cfop: values.cfop.trim(),
        cst: values.cst.trim(),
        origem: values.origem,
        aliquotaIcms: values.aliquotaIcms,
        aliquotaPis: values.aliquotaPis,
        aliquotaCofins: values.aliquotaCofins,
        estoqueAtual: values.estoqueAtual,
        estoqueMinimo: values.estoqueMinimo,
        estoqueMaximo: values.estoqueMaximo ?? null,
        controlaEstoque: values.controlaEstoque,
        imagemUrl: null,
        criadoEm: agora,
        atualizadoEm: agora,
      }
      _counter++
      return { produtos: [novo, ...state.produtos] }
    })
  },

  updateProduto: (id, values) => {
    set((state) => ({
      produtos: state.produtos.map((p) => {
        if (p.id !== id) return p

        const categoria = values.categoriaId
          ? state.categorias.find((c) => c.id === values.categoriaId) ?? null
          : null
        const precoCusto = values.precoCusto ?? p.precoCusto
        const precoVenda = values.precoVenda ?? p.precoVenda

        return {
          ...p,
          ...values,
          codigoBarras: values.codigoBarras !== undefined ? values.codigoBarras.trim() || null : p.codigoBarras,
          descricao: values.descricao !== undefined ? values.descricao.trim() || null : p.descricao,
          categoriaNome: categoria?.nome ?? p.categoriaNome,
          margemLucro: calcularMargem(precoCusto, precoVenda),
          atualizadoEm: new Date().toISOString(),
        } as Produto
      }),
    }))
  },

  updateStatus: (id, status) => {
    set((state) => ({
      produtos: state.produtos.map((p) =>
        p.id === id ? { ...p, status, atualizadoEm: new Date().toISOString() } : p,
      ),
    }))
  },

  deleteProduto: (id) => {
    set((state) => ({ produtos: state.produtos.filter((p) => p.id !== id) }))
  },

  addCategoria: (nome, cor) => {
    const nova: Categoria = { id: `cat${Date.now()}`, nome, cor }
    set((state) => ({ categorias: [...state.categorias, nova] }))
  },
}))
