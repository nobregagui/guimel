import type {
  ConciliacaoAba,
  ErpFiltroData,
  ErpLancamento,
  ErpLancStatus,
  ErpTableFiltros,
  ExtratoFiltroData,
  ExtratoItem,
  ExtratoItemStatus,
  ExtratoOrigemTipo,
  ExtratoTableFiltros,
  SugestaoCriterio,
  SugestaoScore,
} from '@/features/conciliacaoBancaria/types'

export const REFERENCE_DATE = new Date('2026-06-26')

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

export function formatBRLCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  }
  if (abs >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  }
  return formatBRL(value)
}

export function formatIsoToBR(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

export function formatDateTimeBR(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCompetencia(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${MONTHS[Number(month) - 1]}/${year}`
}

// ─── Type guards ─────────────────────────────────────────────────────────────
export function isConciliacaoAba(value: string | null): value is ConciliacaoAba {
  return ['dashboard', 'conciliacao', 'regras', 'analytics', 'historico'].includes(value ?? '')
}

// ─── Labels ──────────────────────────────────────────────────────────────────
export const ORIGEM_LABEL: Record<ExtratoOrigemTipo, string> = {
  pix: 'PIX',
  ted: 'TED',
  doc: 'DOC',
  boleto: 'Boleto',
  cartao: 'Cartão',
  tarifa: 'Tarifa',
  iof: 'IOF',
  juros: 'Juros',
  transferencia: 'Transferência',
  aplicacao: 'Aplicação',
  resgate: 'Resgate',
  cheque: 'Cheque',
  outros: 'Outros',
}

export const EXTRATO_STATUS_LABEL: Record<ExtratoItemStatus, string> = {
  pendente: 'Pendente',
  conciliado: 'Conciliado',
  ignorado: 'Ignorado',
  sugerido: 'Sugerido',
}

export const ERP_STATUS_LABEL: Record<ErpLancStatus, string> = {
  pendente: 'Pendente',
  conciliado: 'Conciliado',
  pago: 'Pago',
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function isInDateRange(dateIso: string, filter: ExtratoFiltroData): boolean {
  if (filter === 'todos') return true
  const itemDate = new Date(dateIso + 'T12:00:00')
  const ref = REFERENCE_DATE

  switch (filter) {
    case 'hoje':
      return dateIso === '2026-06-26'
    case 'semana': {
      const weekAgo = new Date(ref)
      weekAgo.setDate(ref.getDate() - 7)
      return itemDate >= weekAgo && itemDate <= ref
    }
    case 'mes':
      return dateIso.startsWith('2026-06')
    case 'mes_anterior':
      return dateIso.startsWith('2026-05')
    default:
      return true
  }
}

function isErpInDateRange(vencimentoIso: string, filter: ErpFiltroData): boolean {
  if (filter === 'todos') return true
  const itemDate = new Date(vencimentoIso + 'T12:00:00')
  const ref = REFERENCE_DATE

  switch (filter) {
    case 'mes_atual':
      return vencimentoIso.startsWith('2026-06')
    case 'mes_anterior':
      return vencimentoIso.startsWith('2026-05')
    case 'ultimos_30': {
      const thirtyAgo = new Date(ref)
      thirtyAgo.setDate(ref.getDate() - 30)
      return itemDate >= thirtyAgo && itemDate <= ref
    }
    case 'proximos_7': {
      const sevenAhead = new Date(ref)
      sevenAhead.setDate(ref.getDate() + 7)
      return itemDate >= ref && itemDate <= sevenAhead
    }
    default:
      return true
  }
}

export function filterExtratoItems(items: ExtratoItem[], filtros: ExtratoTableFiltros): ExtratoItem[] {
  return items.filter((item) => {
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase()
      const hit =
        item.descricao.toLowerCase().includes(q) || (item.documento?.toLowerCase().includes(q) ?? false)
      if (!hit) return false
    }
    if (filtros.contaId && filtros.contaId !== 'todas') {
      if (item.contaId !== filtros.contaId) return false
    }
    if (filtros.origem !== 'todos' && item.origem !== filtros.origem) return false
    if (filtros.tipo !== 'todos' && item.tipo !== filtros.tipo) return false
    if (filtros.status !== 'todos' && item.status !== filtros.status) return false
    if (!isInDateRange(item.dataIso, filtros.data)) return false
    if (filtros.valorMin !== '' && item.valor < Number(filtros.valorMin)) return false
    if (filtros.valorMax !== '' && item.valor > Number(filtros.valorMax)) return false
    return true
  })
}

export function filterErpLancamentos(items: ErpLancamento[], filtros: ErpTableFiltros): ErpLancamento[] {
  return items.filter((item) => {
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase()
      const hit =
        item.descricao.toLowerCase().includes(q) ||
        (item.cliente?.toLowerCase().includes(q) ?? false) ||
        (item.fornecedor?.toLowerCase().includes(q) ?? false) ||
        (item.documento?.toLowerCase().includes(q) ?? false)
      if (!hit) return false
    }
    if (filtros.tipo !== 'todos' && item.tipo !== filtros.tipo) return false
    if (filtros.status !== 'todos' && item.status !== filtros.status) return false
    if (filtros.categoria && item.categoria !== filtros.categoria) return false
    if (filtros.centroCusto && item.centroCusto !== filtros.centroCusto) return false
    if (!isErpInDateRange(item.vencimentoIso, filtros.data)) return false
    if (filtros.valorMin !== '' && item.valor < Number(filtros.valorMin)) return false
    if (filtros.valorMax !== '' && item.valor > Number(filtros.valorMax)) return false
    return true
  })
}

export function countActiveExtratoFiltros(filtros: ExtratoTableFiltros): number {
  let count = 0
  if (filtros.busca) count++
  if (filtros.contaId && filtros.contaId !== 'todas') count++
  if (filtros.origem !== 'todos') count++
  if (filtros.tipo !== 'todos') count++
  if (filtros.status !== 'todos') count++
  if (filtros.data !== 'todos') count++
  if (filtros.valorMin) count++
  if (filtros.valorMax) count++
  return count
}

export function countActiveErpFiltros(filtros: ErpTableFiltros): number {
  let count = 0
  if (filtros.busca) count++
  if (filtros.tipo !== 'todos') count++
  if (filtros.status !== 'todos') count++
  if (filtros.categoria) count++
  if (filtros.centroCusto) count++
  if (filtros.data !== 'todos') count++
  if (filtros.valorMin) count++
  if (filtros.valorMax) count++
  return count
}

// ─── Smart suggestion algorithm ──────────────────────────────────────────────
export function calcularSugestoes(
  extratoItem: ExtratoItem,
  candidatos: ErpLancamento[],
): SugestaoScore[] {
  return candidatos
    .filter((erp) => erp.status === 'pendente')
    .map((erp): SugestaoScore => {
      const criterios: SugestaoCriterio[] = []

      // Valor (40 pts)
      const diff = Math.abs(extratoItem.valor - erp.valor)
      const valorMatch = diff <= erp.valor * 0.02
      const valorProximo = diff <= erp.valor * 0.1
      criterios.push({
        nome: 'Valor',
        peso: 40,
        match: valorMatch || valorProximo,
        descricao: valorMatch
          ? 'Valor idêntico'
          : valorProximo
            ? `Diferença de ${formatBRL(diff)} (±10%)`
            : `Diferença de ${formatBRL(diff)}`,
      })

      // Data (25 pts)
      const dias = Math.abs(
        (new Date(extratoItem.dataIso).getTime() - new Date(erp.vencimentoIso).getTime()) /
          86_400_000,
      )
      criterios.push({
        nome: 'Data',
        peso: 25,
        match: dias <= 10,
        descricao:
          dias <= 3 ? 'Data coincidente (±3 dias)' : dias <= 10 ? `${Math.round(dias)} dias de diferença` : `${Math.round(dias)} dias de distância`,
      })

      // Descrição (20 pts)
      const banco = extratoItem.descricao.toLowerCase()
      const erpDesc = erp.descricao.toLowerCase()
      const parteNome = (erp.cliente ?? erp.fornecedor ?? '').toLowerCase().split(' ')[0]
      const descMatch =
        banco.includes(erpDesc.split(' ')[0]) ||
        erpDesc.includes(banco.split(' ')[2] ?? '') ||
        (parteNome.length > 3 && banco.includes(parteNome))
      criterios.push({
        nome: 'Descrição',
        peso: 20,
        match: descMatch,
        descricao: descMatch ? 'Correspondência na descrição' : 'Sem correspondência na descrição',
      })

      // Tipo (10 pts)
      const tipoEsperado = extratoItem.tipo === 'credito' ? 'receber' : 'pagar'
      const tipoMatch = erp.tipo === tipoEsperado
      criterios.push({
        nome: 'Tipo',
        peso: 10,
        match: tipoMatch,
        descricao: tipoMatch ? 'Tipo compatível' : 'Tipo incompatível',
      })

      // Documento (5 pts)
      const docMatch = Boolean(
        extratoItem.documento &&
          erp.documento &&
          extratoItem.documento.replace(/\D/g, '').includes(erp.documento.replace(/\D/g, '')),
      )
      criterios.push({
        nome: 'Documento',
        peso: 5,
        match: docMatch,
        descricao: docMatch ? 'Número de documento correspondente' : 'Documento sem correspondência',
      })

      const score = criterios.reduce((acc, c) => acc + (c.match ? c.peso : 0), 0)
      return { extratoItemId: extratoItem.id, erpLancamentoId: erp.id, score, criterios }
    })
    .filter((s) => s.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// ─── Percent helpers ──────────────────────────────────────────────────────────
export function calcularPercentualConciliado(total: number, conciliados: number): number {
  if (total === 0) return 0
  return Math.round((conciliados / total) * 100)
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#f97316'
  return '#dc2626'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Alta confiança'
  if (score >= 60) return 'Média confiança'
  return 'Baixa confiança'
}
